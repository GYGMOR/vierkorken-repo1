import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Get current month start
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get stats
    const [
      totalOrders,
      ordersThisMonth,
      totalRevenue,
      revenueThisMonth,
      totalUsers,
      newUsersThisMonth,
      totalTickets,
      ticketsThisMonth,
      recentOrders,
      upcomingEvents,
    ] = await Promise.all([
      // Total orders
      prisma.order.count({
        where: { paymentStatus: 'PAID' },
      }),
      // Orders this month
      prisma.order.count({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: monthStart },
        },
      }),
      // Total revenue
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
      // Revenue this month
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: monthStart },
        },
        _sum: { total: true },
      }),
      // Total users
      prisma.user.count(),
      // New users this month
      prisma.user.count({
        where: { createdAt: { gte: monthStart } },
      }),
      // Total tickets
      prisma.eventTicket.count(),
      // Tickets this month
      prisma.eventTicket.count({
        where: { createdAt: { gte: monthStart } },
      }),
      // Recent orders
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          customerFirstName: true,
          customerLastName: true,
          total: true,
          createdAt: true,
        },
      }),
      // Upcoming events
      prisma.event.findMany({
        where: {
          startDateTime: { gte: new Date() },
          status: 'PUBLISHED',
        },
        orderBy: { startDateTime: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          startDateTime: true,
          maxCapacity: true,
          currentCapacity: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        ordersThisMonth,
        totalRevenue: Number(totalRevenue._sum.total || 0),
        revenueThisMonth: Number(revenueThisMonth._sum.total || 0),
        totalUsers,
        newUsersThisMonth,
        totalTickets,
        ticketsThisMonth,
        recentOrders: recentOrders.map(order => ({
          ...order,
          customerName: `${order.customerFirstName} ${order.customerLastName}`,
          total: Number(order.total),
        })),
        upcomingEvents,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken', details: error.message },
      { status: 500 }
    );
  }
}
