/**
 * User Detail API
 * GET /api/admin/users/[id] - Get user details with loyalty history
 * PATCH /api/admin/users/[id] - Update user (add/remove points)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { updateUserLoyaltyLevel } from '@/lib/loyalty';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user?.role === 'ADMIN';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!await checkAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        eventTickets: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            event: {
              select: {
                title: true,
                startDateTime: true,
              },
            },
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        badges: {
          include: {
            badge: true,
          },
        },
        loyaltyHistory: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: {
          select: {
            orders: true,
            eventTickets: true,
            reviews: true,
            badges: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('❌ Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!await checkAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { points, reason } = body;

    if (typeof points !== 'number' || !reason) {
      return NextResponse.json(
        { success: false, error: 'Points (number) and reason (string) are required' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        loyaltyPoints: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const balanceBefore = user.loyaltyPoints;
    const balanceAfter = balanceBefore + points;

    // Update user points and create transaction
    const [updatedUser, transaction] = await Promise.all([
      prisma.user.update({
        where: { id },
        data: {
          loyaltyPoints: balanceAfter,
        },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          userId: id,
          points,
          reason,
          balanceBefore,
          balanceAfter,
          referenceId: 'ADMIN_ADJUSTMENT',
        },
      }),
    ]);

    // Check and update loyalty level
    const levelUpdate = await updateUserLoyaltyLevel(id, prisma);
    if (levelUpdate.levelChanged) {
      console.log(`🎊 User leveled up from ${levelUpdate.oldLevel} to ${levelUpdate.newLevel}!`);
    }

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        transaction,
        levelUpdate,
      },
      message: `${points > 0 ? 'Added' : 'Removed'} ${Math.abs(points)} points`,
    });
  } catch (error: any) {
    console.error('❌ Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
