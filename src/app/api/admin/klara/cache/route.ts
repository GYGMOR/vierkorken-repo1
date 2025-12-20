/**
 * KLARA Cache Management API
 *
 * GET  /api/admin/klara/cache - Get cache statistics
 * POST /api/admin/klara/cache - Clear KLARA cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/security';
import { klaraCache } from '@/lib/klara/cache';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


/**
 * GET - Get cache statistics
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const stats = klaraCache.getStats();

  return NextResponse.json({
    success: true,
    stats,
  });
}

/**
 * POST - Clear cache (force refresh)
 */
export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const { action } = await req.json();

  if (action === 'clear') {
    klaraCache.clear();

    return NextResponse.json({
      success: true,
      message: 'KLARA cache cleared successfully. Next request will fetch fresh data.',
    });
  }

  return NextResponse.json(
    { success: false, error: 'Invalid action' },
    { status: 400 }
  );
}
