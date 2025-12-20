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
    const period = searchParams.get('period') || 'daily'; // daily, monthly, quarterly, yearly
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range
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

      const daysAgo = periodDays[period] || 30;
      const startDateCalc = new Date(now);
      startDateCalc.setDate(startDateCalc.getDate() - daysAgo);

      dateFilter = {
        createdAt: {
          gte: startDateCalc,
        },
      };
    }

    // Fetch page views
    const pageViews = await prisma.pageView.findMany({
      where: dateFilter,
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate summary stats
    const totalViews = pageViews.length;
    const uniqueSessions = new Set(pageViews.map(pv => pv.sessionId)).size;
    const uniqueUsers = new Set(pageViews.map(pv => pv.userId).filter(Boolean)).size;

    // Calculate bounce rate (sessions with only 1 page view)
    const sessionPageCounts: Record<string, number> = {};
    pageViews.forEach(pv => {
      sessionPageCounts[pv.sessionId] = (sessionPageCounts[pv.sessionId] || 0) + 1;
    });
    const bouncedSessions = Object.values(sessionPageCounts).filter(count => count === 1).length;
    const bounceRate = uniqueSessions > 0 ? (bouncedSessions / uniqueSessions) * 100 : 0;

    // Calculate average time on page
    const viewsWithTime = pageViews.filter(pv => pv.timeOnPage !== null);
    const avgTimeOnPage = viewsWithTime.length > 0
      ? viewsWithTime.reduce((sum, pv) => sum + (pv.timeOnPage || 0), 0) / viewsWithTime.length
      : 0;

    // Group data by period
    const timeSeriesData = groupPageViewsByPeriod(pageViews, period);

    // Get top pages
    const topPages = getTopPages(pageViews, 10);

    // Get traffic by country
    const trafficByCountry = getTrafficByCountry(pageViews);

    // Get traffic by region
    const trafficByRegion = getTrafficByRegion(pageViews);

    // Get device types
    const deviceStats = getDeviceStats(pageViews);

    // Get browser stats
    const browserStats = getBrowserStats(pageViews);

    // Get peak hours
    const peakHours = getPeakHours(pageViews);

    // Get referrer sources
    const topReferrers = getTopReferrers(pageViews, 10);

    return NextResponse.json({
      success: true,
      period,
      data: {
        summary: {
          totalViews,
          uniqueSessions,
          uniqueUsers,
          bounceRate,
          avgTimeOnPage,
        },
        timeSeriesData,
        topPages,
        trafficByCountry,
        trafficByRegion,
        deviceStats,
        browserStats,
        peakHours,
        topReferrers,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching web stats:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Web-Statistiken' },
      { status: 500 }
    );
  }
}

// Helper functions

function groupPageViewsByPeriod(pageViews: any[], period: string) {
  const grouped: Record<string, any> = {};

  pageViews.forEach(pv => {
    const date = new Date(pv.createdAt);
    let key: string;

    switch (period) {
      case 'daily':
        key = date.toISOString().split('T')[0];
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'yearly':
        key = String(date.getFullYear());
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        views: 0,
        sessions: new Set(),
        users: new Set(),
      };
    }

    grouped[key].views += 1;
    grouped[key].sessions.add(pv.sessionId);
    if (pv.userId) grouped[key].users.add(pv.userId);
  });

  // Convert sets to counts
  return Object.values(grouped).map((item: any) => ({
    period: item.period,
    views: item.views,
    sessions: item.sessions.size,
    users: item.users.size,
  })).sort((a: any, b: any) => a.period.localeCompare(b.period));
}

function getTopPages(pageViews: any[], limit: number) {
  const pageCounts: Record<string, any> = {};

  pageViews.forEach(pv => {
    if (!pageCounts[pv.path]) {
      pageCounts[pv.path] = {
        path: pv.path,
        title: pv.pageTitle || pv.path,
        views: 0,
      };
    }
    pageCounts[pv.path].views += 1;
  });

  return Object.values(pageCounts)
    .sort((a: any, b: any) => b.views - a.views)
    .slice(0, limit);
}

function getTrafficByCountry(pageViews: any[]) {
  const countryCounts: Record<string, number> = {};

  pageViews.forEach(pv => {
    const country = pv.country || 'Unbekannt';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  return Object.entries(countryCounts)
    .map(([country, views]) => ({ country, views }))
    .sort((a, b) => b.views - a.views);
}

function getTrafficByRegion(pageViews: any[]) {
  const regionCounts: Record<string, number> = {};

  pageViews.forEach(pv => {
    const region = pv.region || 'Unbekannt';
    if (pv.country) {
      const key = pv.region ? `${pv.region}, ${pv.country}` : pv.country;
      regionCounts[key] = (regionCounts[key] || 0) + 1;
    }
  });

  return Object.entries(regionCounts)
    .map(([region, views]) => ({ region, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
}

function getDeviceStats(pageViews: any[]) {
  const deviceCounts: Record<string, number> = {
    mobile: 0,
    desktop: 0,
    tablet: 0,
    unknown: 0,
  };

  pageViews.forEach(pv => {
    const type = pv.deviceType || 'unknown';
    deviceCounts[type] = (deviceCounts[type] || 0) + 1;
  });

  return Object.entries(deviceCounts)
    .map(([device, count]) => ({ device, count }))
    .filter(item => item.count > 0);
}

function getBrowserStats(pageViews: any[]) {
  const browserCounts: Record<string, number> = {};

  pageViews.forEach(pv => {
    const browser = pv.browser || 'Unbekannt';
    browserCounts[browser] = (browserCounts[browser] || 0) + 1;
  });

  return Object.entries(browserCounts)
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getPeakHours(pageViews: any[]) {
  const hourCounts: Record<number, number> = {};

  pageViews.forEach(pv => {
    const hour = new Date(pv.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  // Create array with all 24 hours
  const result = [];
  for (let i = 0; i < 24; i++) {
    result.push({
      hour: i,
      views: hourCounts[i] || 0,
    });
  }

  return result;
}

function getTopReferrers(pageViews: any[], limit: number) {
  const referrerCounts: Record<string, number> = {};

  pageViews.forEach(pv => {
    if (pv.referrer && pv.referrer !== '') {
      try {
        const url = new URL(pv.referrer);
        const domain = url.hostname;
        referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
      } catch {
        referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1;
      }
    } else {
      referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1;
    }
  });

  return Object.entries(referrerCounts)
    .map(([referrer, views]) => ({ referrer, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}
