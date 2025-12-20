/**
 * KLARA Categories API Endpoint
 *
 * GET /api/klara/categories - Return categories from KLARA API
 * ONLY returns categories that have active products
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchKlaraCategories, fetchKlaraArticles } from '@/lib/klara/api-client';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  try {
    console.log('📂 Fetching KLARA categories...');

    // 1. Fetch all categories from KLARA API
    const allCategories = await fetchKlaraCategories();

    console.log(`✅ Found ${allCategories.length} total KLARA categories`);

    // 2. Fetch all articles to count active products per category
    const allArticles = await fetchKlaraArticles();

    // 3. Fetch overrides from database to check isActive flag
    let overrides: any[] = [];
    try {
      overrides = await prisma.klaraProductOverride.findMany({
        select: {
          klaraArticleId: true,
          isActive: true,
        },
      });
      console.log(`✅ Found ${overrides.length} product overrides in DB`);
    } catch (dbError: any) {
      console.warn('⚠️  Database not available (local dev mode) - all products count as active');
    }

    const overrideMap = new Map(overrides.map(o => [o.klaraArticleId, o.isActive]));

    // 4. Count active articles per category
    const categoryCounts = new Map<string, number>();

    allArticles.forEach((article) => {
      // Check if product is active (default true if no override)
      const isActive = overrideMap.has(article.id)
        ? overrideMap.get(article.id)
        : true;

      if (isActive) {
        // Count this article in its categories
        article.categories.forEach((categoryId) => {
          categoryCounts.set(
            categoryId,
            (categoryCounts.get(categoryId) || 0) + 1
          );
        });
      }
    });

    // 5. Filter categories to only include those with active products
    const categoriesWithProducts = allCategories
      .filter((cat) => (categoryCounts.get(cat.id) || 0) > 0)
      .map((cat) => ({
        id: cat.id,
        nameDE: cat.nameDE,
        nameEN: cat.nameEN,
        count: categoryCounts.get(cat.id) || 0,
      }));

    console.log(`✅ Returning ${categoriesWithProducts.length} categories with active products`);

    return NextResponse.json({
      success: true,
      data: categoriesWithProducts,
      count: categoriesWithProducts.length,
      source: 'klara_api_with_active_filter',
    });
  } catch (error: any) {
    console.error('❌ KLARA Categories API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
