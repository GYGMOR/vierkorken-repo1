/**
 * KLARA Articles API Endpoint
 *
 * GET /api/klara/articles - Fetch wines from KLARA API + merge with DB overrides
 * Query params:
 *  - categoryId: Filter by KLARA category ID
 *  - search: Search in name/articleNumber
 *  - onlyActive: Show only active wines (from DB override isActive flag)
 *
 * This works exactly like the old PHP version:
 * 1. Fetch all ~187 products from KLARA API
 * 2. Merge with extended data from klaraproductoverride table
 * 3. Respect isActive flag for admin portal control
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchKlaraArticles } from '@/lib/klara/api-client';
import { applyRateLimit } from '@/lib/security';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  // Rate limiting: 100 requests per minute to prevent API abuse
  const rateLimitResponse = await applyRateLimit(request, 100, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId') || undefined;
    const search = searchParams.get('search') || undefined;
    const onlyActive = searchParams.get('onlyActive') === 'true';

    console.log('📦 Fetching KLARA articles...', { categoryId, search, onlyActive });

    // 1. Fetch all articles from KLARA API (~187 products)
    const klaraArticles = await fetchKlaraArticles(categoryId, search);

    console.log(`✅ KLARA API returned ${klaraArticles.length} articles`);

    // 2. Fetch all overrides from database (optional - for local dev without DB)
    let overrides: any[] = [];
    let overrideMap = new Map();

    try {
      overrides = await prisma.klaraProductOverride.findMany();
      overrideMap = new Map(overrides.map(o => [o.klaraArticleId, o]));
      console.log(`✅ Found ${overrides.length} product overrides in DB`);
    } catch (dbError: any) {
      console.warn('⚠️  Database not available (local dev mode) - showing KLARA products without overrides');
      console.warn('   Error:', dbError.message);
    }

    // 3. Merge KLARA data with DB overrides (exactly like old PHP version)
    const articles = klaraArticles.map((article) => {
      const override = overrideMap.get(article.id);

      // Base article from KLARA
      const merged: any = {
        id: article.id,
        articleNumber: article.articleNumber,
        name: article.name,
        price: article.price,
        description: article.description,
        categories: article.categories,
        stock: article.stock,
        images: [],
        hasOverride: !!override,

        // Default values for extended fields
        winery: '',
        region: '',
        country: '',
        vintage: null,
        wineType: '',
        isActive: true, // Default: active unless override says otherwise
      };

      // If override exists, merge extended data
      if (override) {
        // Custom name overrides KLARA name
        if (override.customName) {
          merged.name = override.customName;
        }

        // Custom price overrides KLARA price
        if (override.customPrice !== null && override.customPrice > 0) {
          merged.price = Number(override.customPrice);
        }

        // Custom description overrides KLARA description
        if (override.customDescription) {
          merged.description = override.customDescription;
        }

        // Add images if available (customImages is a JSON array)
        if (override.customImages && Array.isArray(override.customImages) && override.customImages.length > 0) {
          merged.images = override.customImages;
          merged.imageUrl = override.customImages[0];
        }

        // Pass customData (Grapes, Nose, etc.)
        if (override.customData) {
          merged.customData = override.customData;
        }

        // IMPORTANT: isActive flag controls visibility (for admin portal checkbox)
        merged.isActive = override.isActive;
        merged.isFeatured = override.isFeatured || false;
      }

      return merged;
    });

    // 4. Filter by active status if requested
    let finalArticles = articles;
    if (onlyActive) {
      finalArticles = articles.filter(a => a.isActive);
      console.log(`✅ Filtered to ${finalArticles.length} active articles`);
    }

    console.log(`✅ Returning ${finalArticles.length} KLARA articles`);

    return NextResponse.json({
      success: true,
      data: finalArticles,
      count: finalArticles.length,
      source: 'klara_api_with_overrides',
    });
  } catch (error: any) {
    console.error('❌ KLARA Articles API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
