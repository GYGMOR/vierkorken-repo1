import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/security';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


/**
 * GET /api/maintenance/subscriber-count
 * Get count of active maintenance mode subscribers
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const count = await prisma.maintenanceModeSubscriber.count({
      where: { isActive: true },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('❌ Error fetching subscriber count:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Anzahl' },
      { status: 500 }
    );
  }
}
