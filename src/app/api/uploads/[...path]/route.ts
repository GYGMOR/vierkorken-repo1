/**
 * Dynamic Upload File Server
 * Serves uploaded files dynamically (workaround for Next.js public caching)
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = join(process.cwd(), 'public', 'uploads', ...path);

    // Security: Prevent path traversal
    if (!filePath.startsWith(join(process.cwd(), 'public', 'uploads'))) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(filePath);

    // Determine content type
    const ext = path[path.length - 1].split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
    };
    const contentType = contentTypeMap[ext || ''] || 'application/octet-stream';

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving upload:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
