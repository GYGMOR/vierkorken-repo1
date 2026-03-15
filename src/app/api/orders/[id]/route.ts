import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Nicht angemeldet' },
        { status: 401 }
      );
    }


    // Get order with items and event tickets
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: true,
        tickets: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    // Check if order belongs to this user
    if (order.userId !== (await prisma.user.findUnique({ where: { email: session.user.email }}))?.id) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        date: order.createdAt.toISOString(),
        status: order.status.toLowerCase(),
        paymentStatus: order.paymentStatus.toLowerCase(),

        // Customer
        customerFirstName: order.customerFirstName,
        customerLastName: order.customerLastName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,

        // Addresses
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,

        // Items
        items: order.items.map(item => ({
          id: item.id,
          wineName: item.wineName,
          winery: item.winery,
          vintage: item.vintage,
          bottleSize: Number(item.bottleSize),
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),

        // Event Tickets
        eventTickets: order.tickets.map(ticket => ({
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          qrCode: ticket.qrCode,
          price: Number(ticket.price),
          status: ticket.status,
          holderFirstName: ticket.holderFirstName,
          holderLastName: ticket.holderLastName,
          holderEmail: ticket.holderEmail,
          event: ticket.event ? {
            title: ticket.event.title,
            subtitle: ticket.event.subtitle,
            eventType: ticket.event.eventType,
            venue: ticket.event.venue,
            startDateTime: ticket.event.startDateTime.toISOString(),
            endDateTime: ticket.event.endDateTime?.toISOString(),
            duration: ticket.event.duration,
          } : null,
        })),

        // Pricing
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        taxAmount: Number(order.taxAmount),
        taxRate: 8.1, // Swiss VAT
        discountAmount: Number(order.discountAmount),
        total: Number(order.total),

        // Shipping
        deliveryMethod: order.deliveryMethod,
        shippingMethod: order.shippingMethod,
        trackingNumber: order.trackingNumber,
        shippedAt: order.shippedAt?.toISOString(),
        deliveredAt: order.deliveredAt?.toISOString(),

        // Payment
        paymentMethod: order.paymentMethod,
      },
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Bestellung', details: error.message },
      { status: 500 }
    );
  }
}
