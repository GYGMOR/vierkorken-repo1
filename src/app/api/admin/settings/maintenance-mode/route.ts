import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/security';
import { prisma } from '@/lib/prisma';
import { sendLaunchNotificationEmail } from '@/lib/email';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


/**
 * GET /api/admin/settings/maintenance-mode
 * Get current maintenance mode status
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Check database setting first, fallback to env
    const setting = await prisma.settings.findUnique({
      where: { key: 'maintenance_mode' },
    });

    const enabled = setting?.value === 'true' || process.env.MAINTENANCE_MODE === 'true';

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('❌ Error fetching maintenance mode setting:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Einstellung' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings/maintenance-mode
 * Toggle maintenance mode on/off
 * When disabling, sends launch notifications to all MaintenanceModeSubscribers
 */
export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { enabled } = await req.json();

    // Update database setting
    await prisma.settings.upsert({
      where: { key: 'maintenance_mode' },
      update: {
        value: String(enabled),
        updatedAt: new Date(),
        updatedBy: authResult.user.id,
      },
      create: {
        key: 'maintenance_mode',
        value: String(enabled),
        description: 'Enable/disable coming soon mode',
        updatedBy: authResult.user.id,
      },
    });

    let notifiedCount = 0;

    // If disabling maintenance mode, notify ALL active subscribers
    if (!enabled) {
      const subscribers = await prisma.maintenanceModeSubscriber.findMany({
        where: {
          isActive: true,
        },
      });

      console.log(`📧 Sending launch notifications to ${subscribers.length} subscribers`);

      for (const sub of subscribers) {
        try {
          await sendLaunchNotificationEmail(sub.email);

          await prisma.maintenanceModeSubscriber.update({
            where: { id: sub.id },
            data: { notifiedAt: new Date() },
          });

          notifiedCount++;

          // Small delay to avoid rate limits
          await new Promise(r => setTimeout(r, 100));
        } catch (err) {
          console.error(`Failed to notify ${sub.email}:`, err);
        }
      }

      console.log(`✅ Launch notifications sent: ${notifiedCount}/${subscribers.length}`);
    }

    return NextResponse.json({
      success: true,
      enabled,
      notified: notifiedCount,
    });
  } catch (error) {
    console.error('❌ Error updating maintenance mode:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Einstellung' },
      { status: 500 }
    );
  }
}
