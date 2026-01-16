interface CacheItem<T> {
  data: T;
  expires: number;
  tags: string[];
}

class ClientCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly maxSize = 100;

  set<T>(key: string, data: T, ttlSeconds: number = 300, tags: string[] = []): void {
    // Clean expired entries
    this.cleanup();
    
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + (ttlSeconds * 1000),
      tags
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  invalidate(pattern: string): void {
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateByTags(tags: string[]): void {
    for (const [key, item] of this.cache) {
      if (item.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (item.expires < now) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

export const clientCache = new ClientCache();

// Cache-aware fetch wrapper
export const cachedFetch = async <T>(
  url: string, 
  options: RequestInit = {}, 
  cacheOptions: { ttl?: number; tags?: string[] } = {}
): Promise<T> => {
  const cacheKey = `${options.method || 'GET'}:${url}`;
  
  // Try cache first
  const cached = clientCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch and cache
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  clientCache.set(cacheKey, data, cacheOptions.ttl || 300, cacheOptions.tags || []);
  
  return data;
};
