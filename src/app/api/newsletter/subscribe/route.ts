import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidEmail, sanitizeString, checkRateLimit, getRateLimitIdentifier } from '@/lib/security';
import { sendNewsletterConfirmationEmail } from '@/lib/email';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 5 requests per hour per IP
    const identifier = getRateLimitIdentifier(req);
    const { allowed, remaining, resetTime } = checkRateLimit(identifier, 5, 60 * 60 * 1000);

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
    const consent = body.consent === true;
    const source = sanitizeString(body.source || 'homepage', 50);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { success: false, error: 'Bitte akzeptieren Sie die Datenschutzbestimmungen' },
        { status: 400 }
      );
    }

    // Get client info for tracking
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                      req.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Check if email already exists
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      // If already active, don't reveal (prevent email enumeration)
      if (existing.isActive) {
        // Don't send another confirmation email to avoid spam
        return NextResponse.json({
          success: true,
          message: 'Vielen Dank! Sie erhalten eine Bestätigung per E-Mail.',
        });
      }

      // If unsubscribed, reactivate
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          isActive: true,
          unsubscribedAt: null,
          subscribedAt: new Date(),
          ipAddress,
          userAgent,
          source,
        },
      });

      // Send reactivation confirmation email
      await sendNewsletterConfirmationEmail(email);

      return NextResponse.json({
        success: true,
        message: 'Willkommen zurück! Sie erhalten eine Bestätigung per E-Mail.',
      });
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        source,
        ipAddress,
        userAgent,
        isActive: true,
        subscribedAt: new Date(),
      },
    });

    // Send confirmation email
    await sendNewsletterConfirmationEmail(email);

    return NextResponse.json({
      success: true,
      email,
      message: 'Vielen Dank! Sie erhalten eine Bestätigung per E-Mail.',
    });

  } catch (error) {
    console.error('❌ Error in newsletter subscribe API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      },
      { status: 500 }
    );
  }
}
