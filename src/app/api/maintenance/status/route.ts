import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

/**
 * GET /api/maintenance/status
 * Returns the current maintenance mode status from database
 * Used by middleware and client-side MaintenanceGuard
 */
export async function GET(req: NextRequest) {
  // Check if this is an internal middleware request
  const isMiddlewareRequest = req.headers.get('x-middleware-request') === 'true';

  try {
    const setting = await prisma.settings.findUnique({
      where: { key: 'maintenance_mode' },
    });

    // Check database setting first, fallback to env variable
    const enabled = setting?.value === 'true' || process.env.MAINTENANCE_MODE === 'true';

    return NextResponse.json(
      { enabled },
      {
        headers: {
          // No cache for middleware requests, short cache for client requests
          'Cache-Control': isMiddlewareRequest
            ? 'no-store, max-age=0'
            : 'public, s-maxage=10, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching maintenance mode status:', error);
    // Default to false on error (don't block users)
    return NextResponse.json(
      { enabled: false },
      { status: 200 }
    );
  }
}
