import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Nicht angemeldet' },
        { status: 401 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Get orders for this user with items and event tickets
    // Show PAID and PENDING orders (pending = cash payment on pickup)
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        paymentStatus: {
          in: ['PAID', 'PENDING'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to 10 most recent orders
      include: {
        items: true,
        tickets: true,
      },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        date: order.createdAt.toISOString(),
        total: Number(order.total),
        status: order.status.toLowerCase(),
        paymentStatus: order.paymentStatus,
        itemsCount: order.items.length + order.tickets.length,
        wineItemsCount: order.items.length,
        eventTicketsCount: order.tickets.length,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Bestellungen', details: error.message },
      { status: 500 }
    );
  }
}
