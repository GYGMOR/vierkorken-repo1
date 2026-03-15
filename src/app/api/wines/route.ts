import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


/**
 * GET /api/wines
 * Fetch wines with filtering, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const skip = (page - 1) * limit;

    // Filters
    const wineType = searchParams.get('type');
    const country = searchParams.get('country');
    const region = searchParams.get('region');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isBio = searchParams.get('bio') === 'true';
    const search = searchParams.get('search');

    // Sommelier mode filters
    const minBody = searchParams.get('minBody');
    const maxBody = searchParams.get('maxBody');
    const minAcidity = searchParams.get('minAcidity');
    const maxAcidity = searchParams.get('maxAcidity');

    // Sort
    const sortBy = searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (wineType) {
      where.wineType = wineType.toUpperCase();
    }

    if (country) {
      where.country = country;
    }

    if (region) {
      where.region = region;
    }

    if (isBio) {
      where.isBio = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { winery: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Sommelier filters
    if (minBody || maxBody) {
      where.body = {};
      if (minBody) where.body.gte = parseInt(minBody);
      if (maxBody) where.body.lte = parseInt(maxBody);
    }

    if (minAcidity || maxAcidity) {
      where.acidityLevel = {};
      if (minAcidity) where.acidityLevel.gte = parseInt(minAcidity);
      if (maxAcidity) where.acidityLevel.lte = parseInt(maxAcidity);
    }

    // Fetch wines
    const [wines, total] = await Promise.all([
      prisma.wine.findMany({
        where,
        include: {
          variants: {
            where: { isAvailable: true },
            orderBy: { price: 'asc' },
            take: 1,
          },
          images: {
            where: { imageType: 'PRODUCT' },
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.wine.count({ where }),
    ]);

    // Filter price after including variants
    let filteredWines = wines;
    if (minPrice || maxPrice) {
      filteredWines = wines.filter((wine) => {
        const variant = wine.variants[0];
        if (!variant) return false;

        const price = parseFloat(variant.price.toString());
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    return NextResponse.json({
      wines: filteredWines,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching wines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wines' },
      { status: 500 }
    );
  }
}
