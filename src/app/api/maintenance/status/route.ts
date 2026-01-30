import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

// Cache for 10 seconds to reduce DB load
export const revalidate = 10;

/**
 * GET /api/maintenance/status
 * Public endpoint to check maintenance mode status
 * Used by client-side MaintenanceGuard
 */
export async function GET() {
  try {
    // Check database setting first
    const setting = await prisma.settings.findUnique({
      where: { key: 'maintenance_mode' },
    });

    const enabled = setting?.value === 'true' || process.env.MAINTENANCE_MODE === 'true';

    return NextResponse.json(
      { enabled },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('❌ Error checking maintenance status:', error);
    // Default to false on error (don't block users)
    return NextResponse.json({ enabled: false });
  }
}
