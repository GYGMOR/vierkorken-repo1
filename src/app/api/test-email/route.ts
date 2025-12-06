import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get the most recent order to test with
    const recentOrder = await prisma.order.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: true,
      },
    });

    if (!recentOrder) {
      return NextResponse.json(
        {
          success: false,
          error: 'No orders found in database. Please create an order first.',
        },
        { status: 404 }
      );
    }

    console.log('📧 Sending test email for order:', recentOrder.orderNumber);

    const orderData = {
      orderNumber: recentOrder.orderNumber,
      customerFirstName: recentOrder.customerFirstName,
      customerLastName: recentOrder.customerLastName,
      customerEmail: 'regideh221@gmail.com', // Überschreibe mit deiner E-Mail für Test
      createdAt: recentOrder.createdAt,
      items: recentOrder.items,
      subtotal: recentOrder.subtotal,
      shippingCost: recentOrder.shippingCost,
      taxAmount: recentOrder.taxAmount,
      total: recentOrder.total,
      billingAddress: recentOrder.billingAddress,
      shippingAddress: recentOrder.shippingAddress,
    };

    await sendOrderConfirmationEmail('regideh221@gmail.com', recentOrder.id, orderData);
    console.log('✅ Test email sent successfully!');

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      orderNumber: recentOrder.orderNumber,
    });
  } catch (error: any) {
    console.error('❌ Error sending test email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
