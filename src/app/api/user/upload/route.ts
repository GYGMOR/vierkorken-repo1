/**
 * User Image Upload API
 * Handles file uploads to local storage for user profile pictures
 * 🔒 SECURITY: Authenticated users only + Rate limiting + File validation + Filename sanitization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
    uploadLocally,
    validateFileType,
    validateFileSize,
} from '@/lib/local-upload';
import {
    applyRateLimit,
    requireAuth,
    sanitizeFilename,
    isValidFileExtension,
    logSecurityEvent,
} from '@/lib/security';

// Force Node.js runtime
export const runtime = 'nodejs';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting: 20 uploads per hour for regular users
        const rateLimitResponse = await applyRateLimit(request, 20, 60 * 60 * 1000);
        if (rateLimitResponse) return rateLimitResponse;

        // Require authentication
        const session = await requireAuth(request);
        if (session instanceof NextResponse) return session;

        // Get form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            logSecurityEvent('Upload attempt without file', { email: session?.user?.email }, 'low');
            return NextResponse.json(
                { error: 'Kein Bild ausgewählt' },
                { status: 400 }
            );
        }

        // Additional security: Check filename for path traversal attempts
        if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
            logSecurityEvent('Path traversal attempt in filename',
                { filename: file.name, email: session?.user?.email },
                'high'
            );
            return NextResponse.json(
                { error: 'Ungültiger Dateiname' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!validateFileType(file.type, ALLOWED_IMAGE_TYPES)) {
            return NextResponse.json(
                {
                    error: 'Ungültiger Dateityp',
                    message: `Erlaubte Typen: JPG, PNG, WEBP, GIF`,
                },
                { status: 400 }
            );
        }

        // Validate file size
        if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
            return NextResponse.json(
                {
                    error: 'Datei ist zu gross',
                    message: `Maximale Grösse: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
                },
                { status: 400 }
            );
        }

        // Sanitize filename and prepend timestamp
        const safeFilename = `user-${Date.now()}-${sanitizeFilename(file.name)}`;

        // Validate file extension
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!isValidFileExtension(safeFilename, allowedExtensions)) {
            return NextResponse.json(
                { error: 'Ungültige Dateiendung. Nur JPG, PNG, WEBP, GIF sind erlaubt.' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to local storage
        const url = await uploadLocally(buffer, safeFilename, file.type);

        return NextResponse.json({
            success: true,
            url,
        });

    } catch (error: any) {
        console.error('❌ User upload error:', error);
        return NextResponse.json(
            { error: 'Upload fehlgeschlagen' },
            { status: 500 }
        );
    }
}
