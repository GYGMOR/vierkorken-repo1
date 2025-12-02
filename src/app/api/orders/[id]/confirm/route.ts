import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateUserLoyaltyLevel, POINT_REWARDS } from '@/lib/loyalty';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('🎯 Confirming order:', id);

    // Update order to PAID and CONFIRMED
    const order = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        paidAt: new Date(),
      },
      include: {
        user: true,
        items: true,
      },
    });

    console.log('✅ Order confirmed:', order.orderNumber);
    console.log('👤 User ID:', order.userId);
    console.log('🎁 Points to earn from purchase:', order.pointsEarned);

    // Update user loyalty points if user exists
    if (order.userId) {
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
      });

      console.log('👤 User found:', user ? user.email : 'NOT FOUND');

      if (user) {
        console.log('💰 Current points:', user.loyaltyPoints);

        // Check for event tickets to award additional points
        const tickets = await prisma.eventTicket.findMany({
          where: { orderId: order.id },
        });

        const eventPoints = tickets.length * POINT_REWARDS.EVENT_ATTENDANCE;
        const totalPointsToAward = order.pointsEarned + eventPoints;

        console.log('🎫 Event tickets found:', tickets.length);
        console.log('💰 Event points to add:', eventPoints);
        console.log('💰 Total points to add:', totalPointsToAward);

        await prisma.user.update({
          where: { id: order.userId },
          data: {
            loyaltyPoints: {
              increment: totalPointsToAward,
            },
            totalSpent: {
              increment: Number(order.total),
            },
          },
        });

        console.log('✅ Updated user points');

        // Create loyalty transaction for purchase points
        if (order.pointsEarned > 0) {
          await prisma.loyaltyTransaction.create({
            data: {
              userId: order.userId,
              points: order.pointsEarned,
              reason: 'Purchase',
              referenceId: order.id,
              balanceBefore: user.loyaltyPoints,
              balanceAfter: user.loyaltyPoints + order.pointsEarned,
            },
          });
          console.log('✅ Created loyalty transaction for purchase');
        }

        // Create loyalty transaction for event points
        if (eventPoints > 0) {
          await prisma.loyaltyTransaction.create({
            data: {
              userId: order.userId,
              points: eventPoints,
              reason: 'Event',
              referenceId: order.id,
              balanceBefore: user.loyaltyPoints + order.pointsEarned,
              balanceAfter: user.loyaltyPoints + totalPointsToAward,
            },
          });
          console.log('✅ Created loyalty transaction for event attendance');
        }

        // Check and update loyalty level
        const levelUpdate = await updateUserLoyaltyLevel(order.userId, prisma);
        if (levelUpdate.levelChanged) {
          console.log(`🎊 User leveled up from ${levelUpdate.oldLevel} to ${levelUpdate.newLevel}!`);
        }
      }
    } else {
      console.log('⚠️  No user ID on order - guest checkout');
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error: any) {
    console.error('Error confirming order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
