/**
 * Local Upload Helper
 * Handles file uploads to local public/uploads directory
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Upload file to local storage
 */
export async function uploadLocally(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = filename.split('.').pop() || 'jpg';
  const uniqueFilename = `${timestamp}-${randomString}.${extension}`;

  // Create uploads directory if it doesn't exist
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  // Write file
  const filePath = join(uploadsDir, uniqueFilename);
  await writeFile(filePath, file);

  // Return public URL
  return `/uploads/${uniqueFilename}`;
}

/**
 * Validate file type
 */
export function validateFileType(contentType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      // Handle wildcard types like "image/*"
      const baseType = type.split('/')[0];
      return contentType.startsWith(baseType + '/');
    }
    return contentType === type;
  });
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}
