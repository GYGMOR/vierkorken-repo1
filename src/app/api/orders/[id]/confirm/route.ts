import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateUserLoyaltyLevel, POINT_REWARDS } from '@/lib/loyalty';
import { sendOrderConfirmationEmail, sendNewOrderNotificationToAdmin } from '@/lib/email';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {

    console.log('🎯 Confirming order:', id);

    // Check current order status first
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { paymentStatus: true, orderNumber: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // If already paid, don't send email again
    const alreadyPaid = existingOrder.paymentStatus === 'PAID';

    if (alreadyPaid) {
      console.log('⚠️ Order already confirmed, skipping email:', existingOrder.orderNumber);
    }

    // Update order to PAID and CONFIRMED
    const order = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        paidAt: alreadyPaid ? undefined : new Date(), // Only update paidAt if not already paid
      },
      include: {
        user: true,
        items: true,
      },
    });

    console.log('✅ Order confirmed:', order.orderNumber);
    console.log('👤 User ID:', order.userId);
    console.log('🎁 Points to earn from purchase:', order.pointsEarned);

    // Update user loyalty points if user exists AND order wasn't already paid
    if (order.userId && !alreadyPaid) {
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

    // Send order confirmation email ONLY if not already paid
    if (!alreadyPaid) {
      try {
        console.log('📧 Sending order confirmation email to:', order.customerEmail);

        // Prepare order data for email
        const orderData = {
          orderNumber: order.orderNumber,
          customerFirstName: order.customerFirstName,
          customerLastName: order.customerLastName,
          customerEmail: order.customerEmail,
          createdAt: order.createdAt,
          items: order.items,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          taxAmount: order.taxAmount,
          total: order.total,
          billingAddress: order.billingAddress,
          shippingAddress: order.shippingAddress,
        };

        await sendOrderConfirmationEmail(order.customerEmail, order.id, orderData);
        console.log('✅ Order confirmation email sent successfully');

        // Send admin notification
        try {
          console.log('📧 Sending admin notification for order:', order.orderNumber);
          await sendNewOrderNotificationToAdmin(order.id, orderData);
          console.log('✅ Admin notification sent successfully');
        } catch (adminEmailError) {
          console.error('❌ Failed to send admin notification:', adminEmailError);
          // Continue - admin email is non-critical
        }
      } catch (emailError) {
        // Log error but don't fail the order confirmation
        console.error('❌ Failed to send order confirmation email:', emailError);
        // Continue with order confirmation even if email fails
      }
    } else {
      console.log('⏭️ Skipping email - already sent for this order');
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
