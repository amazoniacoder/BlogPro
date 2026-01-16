/**
 * Optimized Documentation Hook
 * Performance-optimized content loading with caching and debouncing
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { LibraryType } from '../types/LibraryContext';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface PerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  totalRequests: number;
  averageResponseTime: number;
  lastRequestTime: number;
}

class DocumentationCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private metrics: PerformanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    lastRequestTime: 0
  };

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, { 
      data, 
      timestamp: Date.now(), 
      ttl,
      hits: 0
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.metrics.cacheMisses++;
      return null;
    }
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      return null;
    }
    
    entry.hits++;
    this.metrics.cacheHits++;
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getCacheInfo(): { size: number; entries: Array<{ key: string; hits: number; age: number }> } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      age: Date.now() - entry.timestamp
    }));
    
    return { size: this.cache.size, entries };
  }
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

interface UseOptimizedDocumentationReturn {
  loadContentWithCache: (endpoint: string, options?: RequestInit) => Promise<any>;
  debouncedSave: (contentId: string, content: string) => void;
  invalidateCache: (pattern?: string) => void;
  getPerformanceMetrics: () => PerformanceMetrics;
  getCacheInfo: () => { size: number; entries: Array<{ key: string; hits: number; age: number }> };
  preloadContent: (endpoints: string[]) => Promise<void>;
}

export const useOptimizedDocumentation = (
  libraryType: LibraryType
): UseOptimizedDocumentationReturn => {
  const cache = useMemo(() => new DocumentationCache(), []);
  const requestTimesRef = useRef<number[]>([]);
  const [, forceUpdate] = useState({});

  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce(async (contentId: string, content: string) => {
      const startTime = Date.now();
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/documentation/content/${contentId}`, {
          method: 'PUT',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content,
            library_type: libraryType,
            updated_by: 'editor'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save content');
        }

        // Invalidate related cache entries
        cache.clear();
        
        // Record performance metrics
        const responseTime = Date.now() - startTime;
        requestTimesRef.current.push(responseTime);
        
        // Keep only last 100 response times
        if (requestTimesRef.current.length > 100) {
          requestTimesRef.current.shift();
        }
        
      } catch (error) {
        console.error('Save failed:', error);
        throw error;
      }
    }, 1000),
    [libraryType, cache]
  );

  // Optimized content loading with caching
  const loadContentWithCache = useCallback(async (
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<any> => {
    const cacheKey = `${libraryType}-${endpoint}-${JSON.stringify(options)}`;
    const startTime = Date.now();
    
    // Try cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the result
      const ttl = endpoint.includes('/public/') ? 10 * 60 * 1000 : 5 * 60 * 1000; // 10min for public, 5min for private
      cache.set(cacheKey, data, ttl);
      
      // Record performance metrics
      const responseTime = Date.now() - startTime;
      requestTimesRef.current.push(responseTime);
      
      if (requestTimesRef.current.length > 100) {
        requestTimesRef.current.shift();
      }
      
      return data;
      
    } catch (error) {
      console.error('Failed to load content:', error);
      throw error;
    }
  }, [libraryType, cache]);

  // Cache invalidation
  const invalidateCache = useCallback((pattern?: string) => {
    if (!pattern) {
      cache.clear();
    } else {
      // Invalidate entries matching pattern
      const cacheInfo = cache.getCacheInfo();
      cacheInfo.entries.forEach(({ key }) => {
        if (key.includes(pattern)) {
          cache.get(key); // This will remove expired entries
        }
      });
    }
    forceUpdate({});
  }, [cache]);

  // Get performance metrics
  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    const cacheMetrics = cache.getMetrics();
    const avgResponseTime = requestTimesRef.current.length > 0
      ? requestTimesRef.current.reduce((a, b) => a + b, 0) / requestTimesRef.current.length
      : 0;
    
    return {
      ...cacheMetrics,
      totalRequests: cacheMetrics.cacheHits + cacheMetrics.cacheMisses,
      averageResponseTime: Math.round(avgResponseTime),
      lastRequestTime: requestTimesRef.current[requestTimesRef.current.length - 1] || 0
    };
  }, [cache]);

  // Get cache information
  const getCacheInfo = useCallback(() => {
    return cache.getCacheInfo();
  }, [cache]);

  // Preload content for better performance
  const preloadContent = useCallback(async (endpoints: string[]): Promise<void> => {
    const preloadPromises = endpoints.map(endpoint => 
      loadContentWithCache(endpoint).catch(error => {
        console.warn(`Failed to preload ${endpoint}:`, error);
        return null;
      })
    );
    
    await Promise.all(preloadPromises);
  }, [loadContentWithCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cache.clear();
    };
  }, [cache]);

  return {
    loadContentWithCache,
    debouncedSave,
    invalidateCache,
    getPerformanceMetrics,
    getCacheInfo,
    preloadContent
  };
};
