import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidEmail, sanitizeString, checkRateLimit, getRateLimitIdentifier } from '@/lib/security';
import { sendMaintenanceSubscriptionEmail } from '@/lib/email';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 5 requests per 15 minutes per IP
    const identifier = getRateLimitIdentifier(req);
    const { allowed, remaining, resetTime } = checkRateLimit(identifier, 5, 15 * 60 * 1000);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
            'X-RateLimit-Remaining': String(remaining),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const email = sanitizeString(body.email?.toLowerCase(), 255);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Get client info for tracking
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                      req.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Check if email already exists
    const existing = await prisma.maintenanceModeSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      // Don't reveal that email exists (prevent email enumeration)
      // But also don't create duplicate
      // Still send confirmation email
      await sendMaintenanceSubscriptionEmail(email);

      return NextResponse.json({
        success: true,
        message: 'Vielen Dank! Sie erhalten eine Bestätigung per E-Mail.',
      });
    }

    // Create new subscriber
    await prisma.maintenanceModeSubscriber.create({
      data: {
        email,
        ipAddress,
        userAgent,
      },
    });

    // Send confirmation email
    await sendMaintenanceSubscriptionEmail(email);

    return NextResponse.json({
      success: true,
      message: 'Vielen Dank! Sie erhalten eine Bestätigung per E-Mail.',
    });

  } catch (error) {
    console.error('❌ Error in maintenance subscribe API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      },
      { status: 500 }
    );
  }
}
