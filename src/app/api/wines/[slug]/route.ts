import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


/**
 * GET /api/wines/[slug]
 * Fetch single wine by slug with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const wine = await prisma.wine.findUnique({
      where: {
        slug: slug,
        isActive: true,
      },
      include: {
        variants: {
          where: { isAvailable: true },
          orderBy: { bottleSize: 'asc' },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!wine) {
      return NextResponse.json(
        { error: 'Wine not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const avgRating = wine.reviews.length > 0
      ? wine.reviews.reduce((sum, r) => sum + r.rating, 0) / wine.reviews.length
      : 0;

    return NextResponse.json({
      wine,
      avgRating,
      reviewCount: wine.reviews.length,
    });
  } catch (error) {
    console.error('Error fetching wine:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wine' },
      { status: 500 }
    );
  }
}
