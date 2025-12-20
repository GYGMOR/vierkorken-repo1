/**
 * KLARA Product Overrides API
 *
 * Returns all products from klaraproductoverride table
 * Used when no real KLARA API key is available
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const onlyActive = searchParams.get('onlyActive') === 'true';

    console.log('📦 Fetching KLARA product overrides from DB...');

    // Load all overrides from database
    let overrides = await prisma.klaraProductOverride.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ Found ${overrides.length} product overrides in DB`);

    // Filter for active products if requested
    if (onlyActive) {
      overrides = overrides.filter(o => o.isActive === true);
      console.log(`🔍 After filtering: ${overrides.length} active products`);
    }

    // Transform to KlaraProduct format
    const products = overrides.map(override => ({
      id: override.klaraArticleId,
      articleNumber: override.klaraArticleId,
      name: override.customName || `Product ${override.klaraArticleId}`,
      price: override.customPrice ? Number(override.customPrice) : 0,
      description: override.customDescription || '',
      categories: [], // TODO: Add categories if needed
      stock: 999,
      images: Array.isArray(override.customImages) ? override.customImages : [],
      isActive: override.isActive,
      hasOverride: true,
    }));

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      source: 'database_overrides',
    });
  } catch (error: any) {
    console.error('❌ Error fetching overrides:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
