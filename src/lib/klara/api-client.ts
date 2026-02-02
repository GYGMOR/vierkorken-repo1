/**
 * KLARA API Client
 *
 * Modern TypeScript client for KLARA POS API
 * Fetches products in real-time from KLARA system
 * WITH IN-MEMORY CACHING for performance
 */

import { klaraCache, CACHE_KEYS } from './cache';

// KLARA API Types
export interface KlaraArticle {
  id: string;
  articleNumber: string;
  nameDE?: string;
  nameEN?: string;
  descriptionDE?: string;
  descriptionEN?: string;
  pricePeriods?: Array<{
    price: number;
    currency?: string;
  }>;
  posCategories?: Array<{
    id: string;
    nameDE?: string;
  }>;
}

export interface KlaraCategory {
  id: string;
  nameDE: string;
  nameEN?: string;
}

export interface ParsedArticle {
  id: string;
  articleNumber: string;
  name: string;
  price: number;
  description: string;
  categories: string[];
  stock: number; // KLARA doesn't provide stock, we set to 999
}

/**
 * Fetch all articles from KLARA API
 * WITH IN-MEMORY CACHING (5 minute TTL)
 * Exactly like the old PHP version (api/klara-articles.php)
 */
export async function fetchKlaraArticles(
  categoryId?: string,
  search?: string
): Promise<ParsedArticle[]> {
  // Check cache first
  const cacheKey = CACHE_KEYS.ARTICLES(categoryId, search);
  const cached = klaraCache.get<ParsedArticle[]>(cacheKey);

  if (cached) {
    console.log(`🚀 Returning ${cached.length} articles from cache (FAST!)`);
    return cached;
  }

  console.log('⏳ Cache MISS - fetching fresh data from KLARA API...');

  // Check if mock mode is enabled
  const useMock = process.env.USE_MOCK_KLARA === 'true';

  if (useMock) {
    console.log('🎭 Using MOCK KLARA data');
    const { getMockArticles } = await import('./mock-data');
    return getMockArticles(categoryId, search);
  }

  const apiUrl = process.env.KLARA_API_URL || 'https://api.klara.ch';
  const apiKey = process.env.KLARA_API_KEY;
  const apiSecret = process.env.KLARA_API_SECRET;

  console.log('🔑 KLARA API Config:', {
    apiUrl,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length,
    hasApiSecret: !!apiSecret,
    apiSecretLength: apiSecret?.length,
  });

  if (!apiKey || apiKey === 'mock_mode') {
    console.log('⚠️  KLARA_API_KEY not configured, returning empty array');
    return [];
  }

  // Fetch articles from KLARA API (limit=1000 to get all ~187 products)
  const url = `${apiUrl}/core/latest/articles?limit=1000`;

  console.log('📡 Calling KLARA API:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Accept-Language': 'de',
        'X-API-KEY': apiKey, // WICHTIG: X-API-KEY (uppercase KEY)
      },
      // Next.js cache disabled - we use our own cache layer
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ KLARA API Error Response:', errorText);
      console.error('❌ Status:', response.status, response.statusText);
      console.error('❌ Headers:', Object.fromEntries(response.headers.entries()));

      // Return empty array instead of throwing to prevent 500 errors
      console.log('⚠️  Returning empty array due to KLARA API error');
      return [];
    }

    const rawArticles: KlaraArticle[] = await response.json();
    console.log(`✅ KLARA API returned ${rawArticles.length} articles`);

    // Parse and filter articles (exactly like old PHP version)
    const articles: ParsedArticle[] = [];

    for (const article of rawArticles) {
    // Get price from pricePeriods
    let price = 0;
    if (article.pricePeriods && article.pricePeriods.length > 0) {
      price = article.pricePeriods[0].price || 0;
    }

    // Get category IDs
    const categoryIds: string[] = [];
    if (article.posCategories) {
      for (const cat of article.posCategories) {
        if (cat.id) {
          categoryIds.push(cat.id);
        }
      }
    }

    const parsed: ParsedArticle = {
      id: article.id,
      articleNumber: article.articleNumber || '',
      name: article.nameDE || article.nameEN || 'Artikel',
      price: price,
      description: article.descriptionDE || article.descriptionEN || '',
      categories: categoryIds,
      stock: 999, // KLARA doesn't provide stock - set to 999 like old version
    };

    // Apply category filter
    if (categoryId && !categoryIds.includes(categoryId)) {
      continue;
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const nameLower = parsed.name.toLowerCase();
      const articleNumberLower = parsed.articleNumber.toLowerCase();

      if (
        !nameLower.includes(searchLower) &&
        !articleNumberLower.includes(searchLower)
      ) {
        continue;
      }
    }

      articles.push(parsed);
    }

    console.log(`✅ Processed ${articles.length} filtered KLARA articles`);

    // Store in cache for 1 HOUR for MUCH better performance
    klaraCache.set(cacheKey, articles, 60 * 60 * 1000);

    return articles;
  } catch (fetchError: any) {
    console.error('❌ KLARA API Fetch Error:', fetchError.message);
    console.error('❌ This could be a network issue or invalid API configuration');

    // Return empty array instead of throwing to prevent 500 errors
    console.log('⚠️  Returning empty array due to fetch error');
    return [];
  }
}

/**
 * Fetch categories from KLARA API
 * WITH IN-MEMORY CACHING (5 minute TTL)
 * Exactly like the old PHP version (api/klara-categories.php)
 */
export async function fetchKlaraCategories(): Promise<KlaraCategory[]> {
  // Check cache first
  const cacheKey = CACHE_KEYS.CATEGORIES;
  const cached = klaraCache.get<KlaraCategory[]>(cacheKey);

  if (cached) {
    console.log(`🚀 Returning ${cached.length} categories from cache (FAST!)`);
    return cached;
  }

  console.log('⏳ Cache MISS - fetching fresh categories from KLARA API...');

  // Check if mock mode is enabled
  const useMock = process.env.USE_MOCK_KLARA === 'true';

  if (useMock) {
    console.log('🎭 Using MOCK KLARA categories');
    const { getMockCategories } = await import('./mock-data');
    return getMockCategories();
  }

  const apiUrl = process.env.KLARA_API_URL || 'https://api.klara.ch';
  const apiKey = process.env.KLARA_API_KEY;

  if (!apiKey || apiKey === 'mock_mode') {
    console.log('⚠️  KLARA_API_KEY not configured, returning empty categories');
    return [];
  }

  // KLARA has a dedicated categories endpoint
  const url = `${apiUrl}/core/latest/article-categories?limit=1000`;

  console.log('📡 Calling KLARA Categories API:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Accept-Language': 'de',
        'X-API-KEY': apiKey, // WICHTIG: X-API-KEY (uppercase KEY)
      },
      // Next.js cache disabled - we use our own cache layer
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ KLARA Categories API Error Response:', errorText);
      console.error('❌ Status:', response.status, response.statusText);

      // Return empty array instead of throwing to prevent 500 errors
      console.log('⚠️  Returning empty categories due to KLARA API error');
      return [];
    }

    const rawCategories: any[] = await response.json();

    console.log(`✅ KLARA API returned ${rawCategories.length} categories`);

    // Parse categories (exactly like old PHP version)
    const categories: KlaraCategory[] = rawCategories.map((cat) => ({
      id: cat.id,
      nameDE: cat.nameDE || cat.nameEN || 'Kategorie',
      nameEN: cat.nameEN,
    }));

    // Sort by order field (like old PHP version)
    categories.sort((a: any, b: any) => {
      const orderA = a.order ?? 9999;
      const orderB = b.order ?? 9999;
      return orderA - orderB;
    });

    console.log(`✅ Processed ${categories.length} KLARA categories`);

    // Store in cache for 1 HOUR for MUCH better performance
    klaraCache.set(cacheKey, categories, 60 * 60 * 1000);

    return categories;
  } catch (fetchError: any) {
    console.error('❌ KLARA Categories Fetch Error:', fetchError.message);
    console.error('❌ This could be a network issue or invalid API configuration');

    // Return empty array instead of throwing to prevent 500 errors
    console.log('⚠️  Returning empty categories due to fetch error');
    return [];
  }
}

/**
 * Count articles in a category
 */
export async function countArticlesInCategory(categoryId: string): Promise<number> {
  const articles = await fetchKlaraArticles(categoryId);
  return articles.length;
}
