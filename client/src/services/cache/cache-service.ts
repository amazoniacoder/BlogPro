/**
 * Cache service for managing application-wide caching
 */
class CacheService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  private stats = {
    hits: 0,
    misses: 0,
    keys: 0,
    lastCleared: new Date().toISOString()
  };
  
  /**
   * Get item from cache
   * @param key Cache key
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      this.stats.misses++;
      return null;
    }
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.keys = this.cache.size;
      return null;
    }
    
    this.stats.hits++;
    return cached.data as T;
  }
  
  /**
   * Set item in cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Optional TTL in milliseconds
   */
  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    this.stats.keys = this.cache.size;
    
    // Set expiration if TTL provided
    if (ttl) {
      setTimeout(() => {
        this.cache.delete(key);
        this.stats.keys = this.cache.size;
      }, ttl);
    }
  }
  
  /**
   * Remove item from cache
   * @param key Cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
    this.stats.keys = this.cache.size;
  }
  
  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.keys = 0;
    this.stats.lastCleared = new Date().toISOString();
  }
  
  /**
   * Set default TTL for cache entries
   * @param milliseconds TTL in milliseconds
   */
  setDefaultTTL(milliseconds: number): void {
    this.defaultTTL = milliseconds;
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      keys: this.stats.keys,
      hitRatio: this.stats.hits + this.stats.misses > 0 
        ? Math.round((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100) 
        : 0,
      lastCleared: this.stats.lastCleared
    };
  }
  
  /**
   * Invalidate cache entries that match a pattern
   * @param pattern String pattern to match against cache keys
   */
  invalidateByPattern(pattern: string): void {
    const keysToRemove: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToRemove.push(key);
      }
    });
    
    console.log(`🗑️ Cache invalidation: Pattern '${pattern}' matched ${keysToRemove.length} keys`);
    if (keysToRemove.length > 0) {
      console.log('Keys being removed:', keysToRemove);
    }
    
    keysToRemove.forEach(key => this.cache.delete(key));
    this.stats.keys = this.cache.size;
  }
  
  /**
   * Invalidate a specific cache entry
   * @param key Cache key to invalidate
   */
  invalidate(key: string): void {
    this.remove(key);
  }
}

export const cacheService = new CacheService();
