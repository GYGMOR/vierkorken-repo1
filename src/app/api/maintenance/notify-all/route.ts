import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/security';
import { sendLaunchNotificationEmail } from '@/lib/email';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  // Require admin authentication
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) {
    return authResult; // Auth failed
  }

  try {
    // Fetch all active subscribers who haven't been notified
    const subscribers = await prisma.maintenanceModeSubscriber.findMany({
      where: {
        isActive: true,
        notifiedAt: null,
      },
      select: {
        id: true,
        email: true,
      },
    });

    let successCount = 0;
    let failCount = 0;

    // Send emails (in batches to avoid overwhelming SMTP)
    for (const subscriber of subscribers) {
      try {
        await sendLaunchNotificationEmail(subscriber.email);

        // Mark as notified
        await prisma.maintenanceModeSubscriber.update({
          where: { id: subscriber.id },
          data: { notifiedAt: new Date() },
        });

        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        failCount++;
      }

      // Small delay between emails to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
      total: subscribers.length,
    });

  } catch (error) {
    console.error('❌ Error in notify-all API:', error);

    return NextResponse.json(
      { success: false, error: 'Fehler beim Versenden der Benachrichtigungen' },
      { status: 500 }
    );
  }
}
