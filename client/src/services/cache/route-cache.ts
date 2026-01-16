import { httpClient } from './http-client';
import { cacheService } from './cache-service';

/**
 * Route cache service to optimize route data loading
 * Integrates with the centralized cache system for admin routes
 */
class RouteCacheService {
  private routeDataCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes default TTL
  
  /**
   * Preload data for a specific route
   * @param route Route path
   * @param apiEndpoint API endpoint to fetch data from
   */
  async preloadRouteData(route: string, apiEndpoint: string): Promise<void> {
    try {
      // Check if we already have this data in the main cache service
      const cachedData = cacheService.get(apiEndpoint);
      if (cachedData) {
        console.log(`Using cached data for ${route} from main cache service`);
        this.routeDataCache.set(route, {
          data: cachedData,
          timestamp: Date.now()
        });
        return;
      }
      
      // If not in main cache, fetch from API
      console.log(`Preloading data for route ${route} from ${apiEndpoint}`);
      const response = await httpClient.get(apiEndpoint);
      
      // Store in both caches
      const responseData = response.data || response;
      this.routeDataCache.set(route, {
        data: responseData,
        timestamp: Date.now()
      });
      
      // Also store in main cache service
      cacheService.set(apiEndpoint, responseData);
    } catch (error) {
      console.error(`Failed to preload data for route ${route}:`, error);
    }
  }
  
  /**
   * Get cached data for a route
   * @param route Route path
   * @returns Cached data or null if not found/expired
   */
  getRouteData(route: string): any | null {
    const cached = this.routeDataCache.get(route);
    if (!cached) return null;
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.routeDataCache.delete(route);
      return null;
    }
    
    return cached.data;
  }
  
  /**
   * Clear cache for a specific route
   * @param route Route path
   */
  clearRouteCache(route: string): void {
    this.routeDataCache.delete(route);
  }
  
  /**
   * Clear all route caches
   */
  clearAllRouteCaches(): void {
    this.routeDataCache.clear();
  }
  
  /**
   * Set custom TTL for route caching
   * @param milliseconds TTL in milliseconds
   */
  setTTL(milliseconds: number): void {
    this.cacheTTL = milliseconds;
  }
}

export const routeCacheService = new RouteCacheService();
