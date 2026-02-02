/**
 * Cache Warmup Endpoint
 *
 * GET /api/warmup - Preload Klara API cache on startup
 * This ensures the first user gets instant loading!
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchKlaraArticles, fetchKlaraCategories } from '@/lib/klara/api-client';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('🔥 ========== CACHE WARMUP START ==========');

    // Preload categories (triggers cache)
    console.log('📂 Warming up categories cache...');
    const categoriesStart = Date.now();
    const categories = await fetchKlaraCategories();
    const categoriesTime = Date.now() - categoriesStart;
    console.log(`✅ Categories cached: ${categories.length} items (${categoriesTime}ms)`);

    // Preload all articles (triggers cache)
    console.log('📦 Warming up articles cache...');
    const articlesStart = Date.now();
    const articles = await fetchKlaraArticles();
    const articlesTime = Date.now() - articlesStart;
    console.log(`✅ Articles cached: ${articles.length} items (${articlesTime}ms)`);

    const totalTime = Date.now() - startTime;

    console.log('🎉 ========== CACHE WARMUP COMPLETE ==========');
    console.log(`⏱️  Total warmup time: ${totalTime}ms`);
    console.log('💡 Next requests will be INSTANT from cache!');

    return NextResponse.json({
      success: true,
      message: 'Cache warmed up successfully',
      stats: {
        categories: {
          count: categories.length,
          time: categoriesTime,
        },
        articles: {
          count: articles.length,
          time: articlesTime,
        },
        totalTime,
      },
    });
  } catch (error: any) {
    console.error('❌ Cache warmup failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Cache warmup failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
