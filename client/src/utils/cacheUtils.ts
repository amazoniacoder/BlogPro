/**
 * Cache utilities for manual cache management
 */

import { cacheService } from '@/services/cache/cache-service';
import { httpClient } from '@/services/cache/http-client';
import { clientCache } from '@/utils/clientCache';

export const cacheUtils = {
  /**
   * Clear all caches completely
   */
  clearAllCaches: () => {
    console.log('🧹 Clearing all caches...');
    
    // Clear central cache service
    cacheService.clear();
    
    // Clear HTTP client cache
    httpClient.clearCache();
    
    // Clear client cache
    clientCache.clear();
    
    // Clear browser cache for the current domain (if possible)
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    console.log('✅ All caches cleared');
  },

  /**
   * Clear blog-specific caches
   */
  clearBlogCaches: () => {
    console.log('🧹 Clearing blog caches...');
    
    // Clear blog patterns from central cache
    cacheService.invalidateByPattern('blog');
    cacheService.invalidateByPattern('/api/blog');
    
    // Clear blog patterns from client cache
    clientCache.invalidate('blog');
    clientCache.invalidate('/api/blog');
    
    // Clear specific blog cache keys from HTTP client
    const cacheKeys = httpClient.getCacheKeys();
    cacheKeys.forEach(key => {
      if (key.includes('blog') || key.includes('/api/blog')) {
        httpClient.deleteCacheEntry(key);
      }
    });
    
    console.log('✅ Blog caches cleared');
  },

  /**
   * Force refresh by clearing caches and reloading
   */
  forceRefresh: () => {
    cacheUtils.clearAllCaches();
    
    // Add a small delay to ensure cache clearing completes
    setTimeout(() => {
      window.location.reload();
    }, 100);
  },

  /**
   * Get cache statistics
   */
  getCacheStats: () => {
    return {
      centralCache: cacheService.getStats(),
      clientCache: clientCache.getStats(),
      httpClientKeys: httpClient.getCacheKeys().length
    };
  }
};

// Export individual functions for convenience
export const { clearAllCaches, clearBlogCaches, forceRefresh, getCacheStats } = cacheUtils;
