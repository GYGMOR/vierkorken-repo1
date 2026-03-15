/**
 * Next.js Middleware for Security & Maintenance Mode
 * Automatically applies security headers and handles maintenance mode
 *
 * NOTE: Middleware runs in Edge Runtime - NO DATABASE ACCESS!
 * Uses internal API call to check database settings.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Check if maintenance mode is enabled
 * Fetches from internal API to check database setting
 */
async function checkMaintenanceMode(request: NextRequest): Promise<boolean> {
  // First check environment variable (quick check)
  if (process.env.MAINTENANCE_MODE === 'true') {
    return true;
  }

  // Then check database setting via internal API
  try {
    const baseUrl = request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/maintenance/status`, {
      method: 'GET',
      headers: {
        'x-middleware-request': 'true', // Internal marker
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return data.enabled === true;
    }
  } catch (error) {
    // Silently fail - fallback to env variable only
    console.error('Failed to check maintenance mode from API:', error);
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ============================================================
  // SKIP MAINTENANCE CHECK FOR STATUS API (prevents infinite loop)
  // ============================================================
  if (pathname === '/api/maintenance/status') {
    const response = NextResponse.next();
    return applySecurityHeaders(response, request);
  }

  // ============================================================
  // MAINTENANCE MODE CHECK
  // ============================================================

  const isMaintenanceMode = await checkMaintenanceMode(request);

  if (isMaintenanceMode) {
    // Always allow these paths (needed for admin bypass and functionality)
    const allowedPaths = [
      '/coming-soon',
      '/api/auth',           // NextAuth API routes
      '/api/maintenance/subscribe', // Email registration
      '/_next',              // Next.js static files
      '/favicon.ico',
      '/images',
      '/fonts',
    ];

    const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path));

    if (!isAllowedPath) {
      // Check if user is authenticated admin
      try {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });

        // If user is logged in and is admin, allow access
        if (token?.role === 'ADMIN') {
          // Admin bypass - continue to normal response with security headers
          const response = NextResponse.next();
          // Security headers will be applied below
          return applySecurityHeaders(response, request);
        }
      } catch (error) {
        console.error('❌ Error checking auth token in middleware:', error);
      }

      // Not admin - redirect to coming soon page
      return NextResponse.redirect(new URL('/coming-soon', request.url));
    }
  }

  // ============================================================
  // APPLY SECURITY HEADERS TO ALL RESPONSES
  // ============================================================

  const response = NextResponse.next();
  return applySecurityHeaders(response, request);
}

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: NextResponse, request: NextRequest) {

  // ============================================================
  // SECURITY HEADERS
  // ============================================================

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Enable XSS filter
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable unwanted browser features
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Strict Transport Security (HTTPS only) - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api.stripe.com https://api.klara.ch https://maps.googleapis.com",
    "frame-src 'self' https://js.stripe.com https://www.google.com",
    "worker-src 'self' blob:",  // Allow Web Workers for Three.js
    "child-src 'self' blob:",   // Allow blob: for WebGL
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // "upgrade-insecure-requests", // Disabled for local development - enable in production
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspDirectives);

  // ============================================================
  // CORS HEADERS (if needed for API)
  // ============================================================

  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Only allow same origin by default
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}

// Apply middleware to all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
