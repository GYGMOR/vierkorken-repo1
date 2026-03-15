import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

/**
 * Public API to track order by order number
 * No authentication required - accessible to all customers
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'Bestellnummer fehlt' },
        { status: 400 }
      );
    }

    // Find order by order number - including tickets!
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          select: {
            id: true,
            wineName: true,
            winery: true,
            vintage: true,
            bottleSize: true,
            quantity: true,
          },
        },
        tickets: {
          include: {
            event: {
              select: {
                title: true,
                startDateTime: true,
                venue: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    // Build tracking timeline based on actual status
    const timeline = [];
    const status = order.status;
    const isShipping = order.deliveryMethod === 'SHIPPING';

    // Order placed
    timeline.push({
      status: 'PLACED',
      label: 'Bestellung aufgegeben',
      date: order.createdAt,
      completed: true,
    });

    // Order confirmed
    timeline.push({
      status: 'CONFIRMED',
      label: 'Bestellung bestätigt',
      date: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status) ? order.createdAt : null,
      completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status),
    });

    // Processing
    timeline.push({
      status: 'PROCESSING',
      label: 'In Bearbeitung',
      date: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status) ? order.createdAt : null,
      completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status),
    });

    if (isShipping) {
      // Shipped
      timeline.push({
        status: 'SHIPPED',
        label: 'Versendet',
        date: order.shippedAt,
        completed: ['SHIPPED', 'DELIVERED'].includes(status),
        trackingNumber: order.trackingNumber,
      });

      // Delivered
      timeline.push({
        status: 'DELIVERED',
        label: 'Zugestellt',
        date: order.deliveredAt,
        completed: status === 'DELIVERED',
      });
    } else {
      // Pickup ready (using PROCESSING status)
      timeline.push({
        status: 'READY',
        label: 'Bereit zur Abholung',
        date: ['PROCESSING', 'DELIVERED'].includes(status) ? order.createdAt : null,
        completed: ['PROCESSING', 'DELIVERED'].includes(status),
      });

      // Picked up
      timeline.push({
        status: 'DELIVERED',
        label: 'Abgeholt',
        date: order.deliveredAt,
        completed: status === 'DELIVERED',
      });
    }

    // Handle cancelled orders
    if (status === 'CANCELLED') {
      timeline.push({
        status: 'CANCELLED',
        label: 'Storniert',
        date: order.cancelledAt,
        completed: true,
        isCancelled: true,
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryMethod: order.deliveryMethod,
        trackingNumber: order.trackingNumber,
        customerFirstName: order.customerFirstName,
        customerEmail: order.customerEmail, // For registration
        shippingAddress: order.shippingAddress,
        items: order.items,
        tickets: order.tickets, // Include tickets!
        createdAt: order.createdAt,
      },
      timeline,
    });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Laden der Bestellung' },
      { status: 500 }
    );
  }
}
