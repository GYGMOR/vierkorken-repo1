/**
 * KLARA Sync API Endpoint
 *
 * POST /api/klara/sync - Trigger manual sync from KLARA Excel
 */

import { NextRequest, NextResponse } from 'next/server';
import { importFromKlaraExcel } from '@/lib/klara/excel-importer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    console.log('🔄 KLARA Sync triggered by:', session.user.email);

    // Run import
    const result = await importFromKlaraExcel();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        stats: result.stats,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('KLARA Sync Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/klara/sync - Get sync status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Implement sync status tracking
    return NextResponse.json({
      status: 'idle',
      lastSync: null,
      nextSync: null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
