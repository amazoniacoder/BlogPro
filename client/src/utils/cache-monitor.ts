// Cache monitoring utility for debugging and testing
import { cacheService } from '@/services/cache';
import { httpClient } from '@/services/cache/http-client';

export class CacheMonitor {
  private static instance: CacheMonitor;
  private logs: Array<{ timestamp: string; action: string; key?: string; details?: any }> = [];

  static getInstance(): CacheMonitor {
    if (!CacheMonitor.instance) {
      CacheMonitor.instance = new CacheMonitor();
    }
    return CacheMonitor.instance;
  }

  /**
   * Log cache activity
   */
  log(action: string, key?: string, details?: any): void {
    this.logs.push({
      timestamp: new Date().toISOString(),
      action,
      key,
      details
    });
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const cacheStats = cacheService.getStats();
    const httpCacheKeys = httpClient.getCacheKeys();
    
    return {
      centralCache: cacheStats,
      httpCache: {
        keys: httpCacheKeys.length,
        keysList: httpCacheKeys
      },
      recentActivity: this.logs.slice(-10)
    };
  }

  /**
   * Test cache behavior for users endpoint
   */
  async testUsersCache() {
    console.log('🧪 Testing Users Cache Behavior...');
    
    // Clear logs
    this.logs = [];
    
    // Test 1: Initial request (should miss cache)
    this.log('TEST_START', '/api/users', 'Initial request');
    const start1 = performance.now();
    
    try {
      const response1 = await fetch('/api/users', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data1 = await response1.json();
      const time1 = performance.now() - start1;
      
      this.log('CACHE_MISS', '/api/users', { responseTime: `${time1.toFixed(2)}ms`, count: data1.data?.length });
      
      // Test 2: Immediate second request (should hit cache)
      const start2 = performance.now();
      const response2 = await fetch('/api/users', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data2 = await response2.json();
      const time2 = performance.now() - start2;
      
      this.log('CACHE_HIT', '/api/users', { responseTime: `${time2.toFixed(2)}ms`, count: data2.data?.length });
      
      // Test 3: Cache invalidation
      cacheService.invalidateByPattern('/api/users');
      this.log('CACHE_INVALIDATE', '/api/users', 'Pattern invalidation');
      
      // Test 4: Request after invalidation (should miss cache)
      const start3 = performance.now();
      const response3 = await fetch('/api/users', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data3 = await response3.json();
      const time3 = performance.now() - start3;
      
      this.log('CACHE_MISS_AFTER_INVALIDATION', '/api/users', { responseTime: `${time3.toFixed(2)}ms`, count: data3.data?.length });
      
      console.log('✅ Cache test completed. Results:', {
        initialRequest: `${time1.toFixed(2)}ms`,
        cachedRequest: `${time2.toFixed(2)}ms`,
        afterInvalidation: `${time3.toFixed(2)}ms`,
        speedImprovement: `${((time1 - time2) / time1 * 100).toFixed(1)}%`
      });
      
    } catch (error) {
      this.log('TEST_ERROR', '/api/users', error);
      console.error('❌ Cache test failed:', error);
    }
  }

  /**
   * Monitor cache activity in real-time
   */
  startMonitoring(): void {
    // Override cache service methods to add logging
    const originalGet = cacheService.get.bind(cacheService);
    const originalSet = cacheService.set.bind(cacheService);
    const originalInvalidateByPattern = cacheService.invalidateByPattern.bind(cacheService);

    cacheService.get = <T>(key: string): T | null => {
      const result = originalGet<T>(key);
      this.log(result ? 'CACHE_HIT' : 'CACHE_MISS', key);
      return result;
    };

    cacheService.set = (key: string, data: any, ttl?: number): void => {
      originalSet(key, data, ttl);
      this.log('CACHE_SET', key, { ttl });
    };

    cacheService.invalidateByPattern = (pattern: string): void => {
      originalInvalidateByPattern(pattern);
      this.log('CACHE_INVALIDATE_PATTERN', pattern);
    };

    console.log('🔍 Cache monitoring started');
  }

  /**
   * Get recent cache activity logs
   */
  getRecentActivity(count = 20) {
    return this.logs.slice(-count);
  }

  /**
   * Clear monitoring logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const cacheMonitor = CacheMonitor.getInstance();

// Add to window for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).cacheMonitor = cacheMonitor;
}
