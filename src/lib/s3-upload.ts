/**
 * S3 Upload Helper
 * Handles file uploads to AWS S3 or S3-compatible storage
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
export function getS3Client() {
  const endpoint = process.env.S3_ENDPOINT || 'https://s3.amazonaws.com';
  const region = process.env.S3_REGION || 'eu-central-1';
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('S3 credentials not configured (S3_ACCESS_KEY, S3_SECRET_KEY)');
  }

  // Backblaze B2 specific configuration
  const isBackblaze = endpoint.includes('backblazeb2.com');

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: isBackblaze, // Backblaze requires path-style URLs
  });
}

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error('S3_BUCKET not configured');
  }

  const s3Client = getS3Client();

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = filename.split('.').pop();
  const uniqueFilename = `uploads/${timestamp}-${randomString}.${extension}`;

  // Backblaze B2 doesn't support ACL in the same way as AWS S3
  const isBackblaze = (process.env.S3_ENDPOINT || '').includes('backblazeb2.com');

  const commandParams: any = {
    Bucket: bucket,
    Key: uniqueFilename,
    Body: file,
    ContentType: contentType,
  };

  // Only add ACL for AWS S3, not Backblaze
  if (!isBackblaze) {
    commandParams.ACL = 'public-read';
  }

  const command = new PutObjectCommand(commandParams);

  await s3Client.send(command);

  // Construct public URL
  const endpoint = process.env.S3_ENDPOINT || 'https://s3.amazonaws.com';
  const region = process.env.S3_REGION || 'eu-central-1';

  // Handle different S3 URL formats
  let publicUrl: string;

  if (endpoint.includes('amazonaws.com')) {
    // AWS S3
    publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${uniqueFilename}`;
  } else if (endpoint.includes('backblazeb2.com')) {
    // Backblaze B2 - uses path-style URLs
    publicUrl = `${endpoint}/${bucket}/${uniqueFilename}`;
  } else {
    // Other S3-compatible storage (e.g., DigitalOcean Spaces, Wasabi)
    publicUrl = `${endpoint}/${bucket}/${uniqueFilename}`;
  }

  return publicUrl;
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error('S3_BUCKET not configured');
  }

  // Extract key from URL
  let key: string;

  try {
    const url = new URL(fileUrl);
    key = url.pathname.substring(1); // Remove leading slash

    // If URL contains bucket name, remove it
    if (key.startsWith(`${bucket}/`)) {
      key = key.substring(bucket.length + 1);
    }
  } catch (error) {
    throw new Error('Invalid S3 URL');
  }

  const s3Client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Get presigned URL for temporary access
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error('S3_BUCKET not configured');
  }

  const s3Client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return signedUrl;
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

/**
 * Get file extension from content type
 */
export function getExtensionFromContentType(contentType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
  };

  return extensions[contentType] || 'bin';
}
