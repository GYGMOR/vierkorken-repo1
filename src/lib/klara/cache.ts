/**
 * KLARA API Cache Layer
 *
 * Implements in-memory caching for KLARA API responses
 * to dramatically improve performance and reduce API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class KlaraCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 60 * 60 * 1000; // 1 hour for MUCH better performance!

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ Cache HIT for key: ${key} (age: ${Math.round((Date.now() - entry.timestamp) / 1000)}s)`);
    return entry.data as T;
  }

  /**
   * Store data in cache with TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp,
      expiresAt,
    });

    console.log(`💾 Cached data for key: ${key} (TTL: ${(ttl || this.defaultTTL) / 1000}s)`);
  }

  /**
   * Invalidate specific cache key
   */
  invalidate(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`🗑️  Invalidated cache for key: ${key}`);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️  Cleared ${size} cache entries`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    return {
      totalEntries: entries.length,
      entries: entries.map(([key, entry]) => ({
        key,
        age: Math.round((now - entry.timestamp) / 1000),
        expiresIn: Math.round((entry.expiresAt - now) / 1000),
        expired: now > entry.expiresAt,
      })),
    };
  }

  /**
   * Clean up expired entries (called periodically)
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }
  }
}

// Singleton instance
export const klaraCache = new KlaraCache();

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    klaraCache.cleanup();
  }, 10 * 60 * 1000);
}

// Cache keys
export const CACHE_KEYS = {
  ARTICLES: (categoryId?: string, search?: string) => {
    let key = 'klara:articles';
    if (categoryId) key += `:cat:${categoryId}`;
    if (search) key += `:search:${search}`;
    return key;
  },
  CATEGORIES: 'klara:categories',
  ARTICLE_BY_ID: (id: string) => `klara:article:${id}`,
};
