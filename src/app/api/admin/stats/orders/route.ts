import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Get filter parameters
    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get('period') || 'monthly'; // daily, monthly, quarterly, yearly
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range based on period
    const now = new Date();
    let dateFilter: any = {};

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    } else {
      const periodDays: Record<string, number> = {
        daily: 30,
        monthly: 365,
        quarterly: 365,
        yearly: 365 * 3,
      };

      const daysAgo = periodDays[period] || 365;
      const startDateCalc = new Date(now);
      startDateCalc.setDate(startDateCalc.getDate() - daysAgo);

      dateFilter = {
        createdAt: {
          gte: startDateCalc,
        },
      };
    }

    // Fetch orders with items
    const orders = await prisma.order.findMany({
      where: {
        ...dateFilter,
        paymentStatus: 'PAID',
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group data by period
    const groupedData = groupOrdersByPeriod(orders, period);

    // Calculate summary stats
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Count new vs returning customers
    const uniqueCustomers = new Set(orders.map(o => o.userId).filter(Boolean));
    const newCustomers = await countNewCustomers(orders);
    const returningCustomers = totalOrders - newCustomers;

    // Get top selling wines
    const topWines = getTopSellingWines(orders);

    // Get revenue by wine type (estimate - this would need more data)
    const revenueByType = getRevenueByWineType(orders);

    return NextResponse.json({
      success: true,
      period,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          newCustomers,
          returningCustomers,
          uniqueCustomers: uniqueCustomers.size,
          conversionRate: 0, // Would need pageview data
        },
        timeSeriesData: groupedData,
        topWines,
        revenueByType,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching order stats:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken' },
      { status: 500 }
    );
  }
}

// Helper function to group orders by period
function groupOrdersByPeriod(orders: any[], period: string) {
  const grouped: Record<string, any> = {};

  orders.forEach(order => {
    const date = new Date(order.createdAt);
    let key: string;

    switch (period) {
      case 'daily':
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
        break;
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'yearly':
        key = String(date.getFullYear());
        break;
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        revenue: 0,
        orders: 0,
        items: 0,
      };
    }

    grouped[key].revenue += Number(order.total);
    grouped[key].orders += 1;
    grouped[key].items += order.items?.length || 0;
  });

  // Convert to array and sort by period
  return Object.values(grouped).sort((a: any, b: any) => a.period.localeCompare(b.period));
}

// Count new customers (first order in the period)
async function countNewCustomers(orders: any[]): Promise<number> {
  let newCount = 0;
  const checkedUsers = new Set<string>();

  for (const order of orders) {
    if (!order.userId || checkedUsers.has(order.userId)) continue;
    checkedUsers.add(order.userId);

    // Check if this is their first order ever
    const previousOrders = await prisma.order.count({
      where: {
        userId: order.userId,
        createdAt: {
          lt: order.createdAt,
        },
        paymentStatus: 'PAID',
      },
    });

    if (previousOrders === 0) {
      newCount++;
    }
  }

  return newCount;
}

// Get top selling wines
function getTopSellingWines(orders: any[]) {
  const wineStats: Record<string, any> = {};

  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const key = item.wineName;
      if (!wineStats[key]) {
        wineStats[key] = {
          name: item.wineName,
          winery: item.winery,
          quantity: 0,
          revenue: 0,
        };
      }
      wineStats[key].quantity += item.quantity;
      wineStats[key].revenue += Number(item.totalPrice);
    });
  });

  // Convert to array and sort by quantity
  return Object.values(wineStats)
    .sort((a: any, b: any) => b.quantity - a.quantity)
    .slice(0, 10);
}

// Get revenue by wine type (estimate based on wine name)
function getRevenueByWineType(orders: any[]) {
  const typeRevenue: Record<string, number> = {
    Rotwein: 0,
    Weisswein: 0,
    Roséwein: 0,
    Schaumwein: 0,
    Andere: 0,
  };

  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const name = item.wineName.toLowerCase();
      let type = 'Andere';

      if (name.includes('rot') || name.includes('red')) type = 'Rotwein';
      else if (name.includes('weiss') || name.includes('white')) type = 'Weisswein';
      else if (name.includes('rosé') || name.includes('rose')) type = 'Roséwein';
      else if (name.includes('schaum') || name.includes('champagne') || name.includes('prosecco')) type = 'Schaumwein';

      typeRevenue[type] += Number(item.totalPrice);
    });
  });

  // Convert to array for charts
  return Object.entries(typeRevenue)
    .map(([type, revenue]) => ({ type, revenue }))
    .filter(item => item.revenue > 0);
}
