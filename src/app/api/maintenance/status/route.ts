import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

/**
 * GET /api/maintenance/status
 * Returns the current maintenance mode status from database
 * Used by middleware to check if site should show coming soon page
 */
export async function GET(req: NextRequest) {
  // Only allow internal middleware requests or same-origin
  const isMiddlewareRequest = req.headers.get('x-middleware-request') === 'true';

  if (!isMiddlewareRequest) {
    // Still allow the request but don't expose internal details
  }

  try {
    const setting = await prisma.settings.findUnique({
      where: { key: 'maintenance_mode' },
    });

    const enabled = setting?.value === 'true';

    return NextResponse.json(
      { enabled },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching maintenance mode status:', error);
    // On error, default to not in maintenance mode
    return NextResponse.json(
      { enabled: false },
      { status: 200 }
    );
  }
}
