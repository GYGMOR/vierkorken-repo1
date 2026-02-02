/**
 * Admin Image Upload API
 * Handles file uploads to local storage
 * 🔒 SECURITY: Admin-only + Rate limiting + File validation + Filename sanitization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import {
  uploadLocally,
  validateFileType,
  validateFileSize,
} from '@/lib/local-upload';
import {
  applyRateLimit,
  requireAdmin,
  sanitizeFilename,
  isValidFileExtension,
  isValidFileSize,
  logSecurityEvent,
} from '@/lib/security';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user?.role === 'ADMIN';
}

export async function POST(request: NextRequest) {
  try {
    // Apply generous rate limiting for admin file uploads: 500 uploads per hour
    // Admins often need to upload many product images at once
    const rateLimitResponse = await applyRateLimit(request, 500, 60 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    // Require admin authentication
    const session = await requireAdmin(request);
    if (session instanceof NextResponse) return session;

    console.log('📤 Using local storage for upload');

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      logSecurityEvent('Upload attempt without file', { email: session.user.email }, 'low');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Additional security: Check filename for path traversal attempts
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      logSecurityEvent('Path traversal attempt in filename',
        { filename: file.name, email: session.user.email },
        'high'
      );
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file.type, ALLOWED_IMAGE_TYPES)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          message: `Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
          receivedType: file.type,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: `Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          receivedSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent security issues
    const safeFilename = sanitizeFilename(file.name);

    // Validate file extension (whitelist)
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!isValidFileExtension(safeFilename, allowedExtensions)) {
      logSecurityEvent('Invalid file extension',
        { filename: file.name, type: file.type, email: session.user.email },
        'medium'
      );
      return NextResponse.json(
        { error: 'Invalid file extension. Only JPG, PNG, WEBP, GIF allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to local storage with sanitized filename
    console.log('📤 Uploading file locally:', safeFilename, file.type, `${(file.size / 1024).toFixed(2)}KB`);
    const url = await uploadLocally(buffer, safeFilename, file.type);

    // Log successful upload
    logSecurityEvent('File uploaded successfully',
      { filename: safeFilename, url, email: session.user.email },
      'low'
    );

    console.log('✅ File uploaded successfully:', url);

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);

    let errorMessage = error.message || 'Unknown error';
    const statusCode = 500;

    if (error.code === 'EACCES') {
      errorMessage = 'Permission denied - cannot write to uploads directory';
    } else if (error.code === 'ENOSPC') {
      errorMessage = 'No space left on device';
    }

    return NextResponse.json(
      {
        error: 'Upload failed',
        message: errorMessage,
        details: error.message,
        storage: 'local',
      },
      { status: statusCode }
    );
  }
}
