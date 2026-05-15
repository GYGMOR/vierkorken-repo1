import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 10 unsubscriptions per hour per IP
    const identifier = getRateLimitIdentifier(req);
    const { allowed } = checkRateLimit(identifier, 10, 60 * 60 * 1000);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'E-Mail-Adresse erforderlich' },
        { status: 400 }
      );
    }

    const lowerEmail = email.toLowerCase();

    // 1. Update guest subscribers
    const guestSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: lowerEmail },
    });

    if (guestSubscriber) {
      await prisma.newsletterSubscriber.update({
        where: { email: lowerEmail },
        data: {
          isActive: false,
          unsubscribedAt: new Date(),
        },
      });
    }

    // 2. Update registered users
    const user = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });

    if (user) {
      await prisma.user.update({
        where: { email: lowerEmail },
        data: {
          newsletterSubscribed: false,
          newsletterSubscribedAt: null,
        },
      });
    }

    // 3. Update maintenance mode subscribers if they exist
    // Checking if the model exists in prisma client
    if ((prisma as any).maintenanceModeSubscriber) {
      const maintenanceSub = await (prisma as any).maintenanceModeSubscriber.findUnique({
        where: { email: lowerEmail },
      });
      if (maintenanceSub) {
        await (prisma as any).maintenanceModeSubscriber.update({
          where: { email: lowerEmail },
          data: { isActive: false },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sie wurden erfolgreich vom Newsletter abgemeldet.',
    });
  } catch (error: any) {
    console.error('❌ Error in newsletter unsubscribe API:', error);
    return NextResponse.json(
      { success: false, error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
