/**
 * Central Security Library
 * Provides input validation, rate limiting, and security utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// ============================================================
// INPUT VALIDATION & SANITIZATION
// ============================================================

/**
 * Sanitize string input - remove potentially dangerous characters
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';

  // Trim and limit length
  let sanitized = input.trim().substring(0, maxLength);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  return sanitized;
}

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags except safe ones
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: URIs (can contain base64 encoded scripts)
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // Remove dangerous HTML tags
  const dangerousTags = ['iframe', 'object', 'embed', 'link', 'style', 'meta', 'base', 'form'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    // Also handle self-closing tags
    const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/>`, 'gi');
    sanitized = sanitized.replace(selfClosing, '');
  });

  return sanitized;
}

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHTML(input: string): string {
  if (typeof input !== 'string') return '';

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'\/]/g, char => htmlEntities[char] || char);
}

/**
 * Validate request body size
 */
export function validateRequestBodySize(bodySize: number, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return bodySize <= maxBytes;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate phone number (Swiss format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+41|0041|0)[0-9\s]{9,13}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate number within range
 */
export function isValidNumber(value: any, min?: number, max?: number): boolean {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

/**
 * Validate string length
 */
export function isValidLength(str: string, min: number, max: number): boolean {
  return str.length >= min && str.length <= max;
}

/**
 * Sanitize filename - only allow safe characters
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  filename = filename.replace(/\.\./g, '');
  filename = filename.replace(/[\/\\]/g, '');

  // Only allow alphanumeric, dash, underscore, and dot
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  if (filename.length > 255) {
    const ext = filename.split('.').pop();
    filename = filename.substring(0, 200) + '.' + ext;
  }

  return filename;
}

/**
 * Validate file extension
 */
export function isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return false;
  return allowedExtensions.includes(ext);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size <= maxBytes;
}

// ============================================================
// RATE LIMITING
// ============================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up old rate limit entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware
 * @param identifier - Unique identifier (e.g., IP address or user ID)
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  // Increment existing entry
  entry.count++;
  rateLimitStore.set(identifier, entry);

  const allowed = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);

  return { allowed, remaining, resetTime: entry.resetTime };
}

/**
 * Get rate limit identifier from request (IP address or session)
 */
export function getRateLimitIdentifier(req: NextRequest, session?: any): string {
  // Use user ID if authenticated
  if (session?.user?.email) {
    return `user:${session.user.email}`;
  }

  // Otherwise use IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  req: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000
): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  const identifier = getRateLimitIdentifier(req, session);
  const { allowed, remaining, resetTime } = checkRateLimit(identifier, maxRequests, windowMs);

  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
        },
      }
    );
  }

  return null; // Allowed
}

// ============================================================
// AUTHENTICATION & AUTHORIZATION
// ============================================================

/**
 * Check if user is authenticated
 */
export async function requireAuth(req: NextRequest): Promise<NextResponse | any> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }

  return session;
}

/**
 * Check if user is admin
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | any> {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session; // Auth failed

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  return session;
}

/**
 * Check if user owns a resource
 */
export async function requireOwnership(
  req: NextRequest,
  resourceUserId: string
): Promise<NextResponse | null> {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || (user.id !== resourceUserId && user.role !== 'ADMIN')) {
    return NextResponse.json(
      { success: false, error: 'Forbidden - You do not own this resource' },
      { status: 403 }
    );
  }

  return null; // Ownership verified
}

// ============================================================
// SECURITY HEADERS
// ============================================================

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://api.klara.ch;"
  );

  return response;
}

// ============================================================
// INPUT VALIDATION SCHEMAS
// ============================================================

/**
 * Validate password strength
 * Requires: min 8 chars, uppercase, lowercase, number, special char
 */
export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 100) {
    errors.push('Password must not exceed 100 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak passwords
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common and not secure');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate user registration input
 */
export function validateRegistrationInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Invalid email address');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else {
    const passwordCheck = isStrongPassword(data.password);
    if (!passwordCheck.valid) {
      errors.push(...passwordCheck.errors);
    }
  }

  if (!data.firstName || !isValidLength(data.firstName, 1, 50)) {
    errors.push('First name must be between 1 and 50 characters');
  }

  if (!data.lastName || !isValidLength(data.lastName, 1, 50)) {
    errors.push('Last name must be between 1 and 50 characters');
  }

  // Sanitize all inputs
  if (data.firstName) data.firstName = sanitizeString(data.firstName, 50);
  if (data.lastName) data.lastName = sanitizeString(data.lastName, 50);
  if (data.email) data.email = sanitizeString(data.email.toLowerCase(), 255);

  return { valid: errors.length === 0, errors };
}

/**
 * Validate review input
 */
export function validateReviewInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.wineId || !isValidLength(data.wineId, 1, 100)) {
    errors.push('Invalid wine ID');
  }

  if (!isValidNumber(data.rating, 1, 5)) {
    errors.push('Rating must be between 1 and 5');
  }

  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (data.comment && data.comment.length > 2000) {
    errors.push('Comment must be less than 2000 characters');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate address input
 */
export function validateAddressInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.firstName || !isValidLength(data.firstName, 1, 50)) {
    errors.push('First name is required (1-50 characters)');
  }

  if (!data.lastName || !isValidLength(data.lastName, 1, 50)) {
    errors.push('Last name is required (1-50 characters)');
  }

  if (!data.street || !isValidLength(data.street, 1, 100)) {
    errors.push('Street is required (1-100 characters)');
  }

  if (!data.streetNumber || !isValidLength(data.streetNumber, 1, 10)) {
    errors.push('Street number is required (1-10 characters)');
  }

  if (!data.city || !isValidLength(data.city, 1, 100)) {
    errors.push('City is required (1-100 characters)');
  }

  if (!data.postalCode || !isValidLength(data.postalCode, 1, 20)) {
    errors.push('Postal code is required (1-20 characters)');
  }

  if (!data.country || !isValidLength(data.country, 2, 2)) {
    errors.push('Country code must be 2 characters (e.g., CH)');
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Invalid phone number format');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// LOGGING & MONITORING
// ============================================================

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  details: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
) {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] [${severity.toUpperCase()}] ${timestamp} - ${event}`, details);

  // In production, send to monitoring service (Sentry, LogRocket, etc.)
  if (severity === 'critical' || severity === 'high') {
    console.error(`[SECURITY ALERT] ${event}`, details);
  }
}
