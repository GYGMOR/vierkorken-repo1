/**
 * Admin Review Management API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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

export async function GET(request: NextRequest) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const isApproved = searchParams.get('isApproved');
  const wineId = searchParams.get('wineId');
  const minRating = searchParams.get('minRating');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  // Build where clause
  const where: any = {};

  if (isApproved !== null && isApproved !== undefined && isApproved !== '') {
    where.isApproved = isApproved === 'true';
  }

  if (wineId) {
    where.wineId = wineId;
  }

  if (minRating) {
    where.rating = { gte: parseInt(minRating) };
  }

  // Build orderBy clause
  let orderBy: any = {};

  if (sortBy === 'rating') {
    orderBy = { rating: sortOrder };
  } else if (sortBy === 'wineName') {
    orderBy = { wine: { name: sortOrder } };
  } else {
    orderBy = { createdAt: sortOrder };
  }

  const [reviews, total, stats] = await Promise.all([
    prisma.review.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        wine: { select: { id: true, name: true, winery: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy,
    }),
    prisma.review.count({ where }),
    // Get statistics
    prisma.review.aggregate({
      where,
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  // Get rating distribution
  const ratingDistribution = await prisma.review.groupBy({
    by: ['rating'],
    where,
    _count: { rating: true },
  });

  return NextResponse.json({
    success: true,
    data: reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: {
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count.rating || 0,
      distribution: ratingDistribution.map(r => ({
        rating: r.rating,
        count: r._count.rating,
      })),
    },
  });
}
