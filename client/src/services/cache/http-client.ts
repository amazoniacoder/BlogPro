import { getApiUrl } from '@/config/api';

/**
 * Extended RequestInit interface to include custom bypassCache option
 */
interface ExtendedRequestInit extends RequestInit {
  bypassCache?: boolean;
}

/**
 * Simple HTTP client with integrated caching for API requests
 * Used by all API services to ensure consistent caching behavior
 */
class HttpClient {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  cacheService: { get<T>(key: string): T | null; set(key: string, data: any, ttl?: number): void } | null = null; // Will be set after import to avoid circular dependency
  setCacheService!: (service: { get<T>(key: string): T | null; set(key: string, data: any, ttl?: number): void }) => void;
  
  /**
   * Generate cache key from request config
   */
  private getCacheKey(url: string, params?: Record<string, any>): string {
    return `${url}${params ? JSON.stringify(params) : ''}`;
  }
  
  /**
   * Check if cache entry is valid
   */
  private isCacheValid(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp < ttl;
  }
  
  /**
   * Make GET request with caching
   */
  async get<T = any>(url: string, options?: ExtendedRequestInit, ttl?: number): Promise<T> {
    const fullUrl = getApiUrl(url);
    const cacheKey = this.getCacheKey(fullUrl);
    const cacheTTL = ttl || this.defaultTTL;
    const bypassCache = options?.bypassCache || false;
    
    // Check cache first if not bypassing
    if (!bypassCache) {
      // First check the centralized cache service if available
      if (this.cacheService) {
        const centralCachedData = this.cacheService.get<T>(cacheKey);
        if (centralCachedData) {
          console.log(`Cache hit from central cache service: ${fullUrl}`);
          return Promise.resolve(centralCachedData);
        }
      }
      
      // Then check the local cache
      const cachedResponse = this.cache.get(cacheKey);
      if (cachedResponse && this.isCacheValid(cachedResponse.timestamp, cacheTTL)) {
        console.log(`Cache hit from HTTP client cache: ${fullUrl}`);
        return Promise.resolve(cachedResponse.data);
      }
    } else {
      console.log(`Bypassing cache for: ${fullUrl}`);
    }
    
    // If not in cache or expired or bypassing, make actual request
    const headers = this.getHeaders(fullUrl);
    const requestOptions = { ...options };
    delete requestOptions.bypassCache; // Remove non-standard option
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
        // Remove credentials since we're using JWT tokens
        ...requestOptions
      });
      
      if (!response.ok) {
        // Only log errors that aren't auth-related (401, 403) or 404 to avoid spam
        if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
          console.error(`HTTP error for ${fullUrl}: status ${response.status}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      try {
        const data = await response.json();
        
        // Cache successful responses if not bypassing
        if (!bypassCache) {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
          });
          
          // Also store in central cache service if available
          if (this.cacheService) {
            this.cacheService.set(cacheKey, data, cacheTTL);
          }
        }
        
        return data;
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        return {} as T; // Return empty object as fallback
      }
    } catch (error) {
      // Only log errors that aren't auth-related to avoid spam
      if (!(error instanceof Error && (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')))) {
        console.error(`Request failed for ${fullUrl}:`, error);
      }
      throw error; // Re-throw to allow proper error handling
    }
  }
  
  /**
   * Make POST request (no caching)
   */
  async post<T = any>(url: string, data?: any, options?: ExtendedRequestInit): Promise<T> {
    const fullUrl = getApiUrl(url);
    const headers = this.getHeaders(fullUrl);
    
    // Don't set Content-Type for FormData (multipart/form-data)
    if (data instanceof FormData) {
      delete (headers as Record<string, string>)['Content-Type'];
    }
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options
    });
    
    // Always try to parse the response body first
    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return {} as T;
    }
    
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Invalidate related GET caches
    this.invalidateRelatedCaches(url);
    
    return responseData;
  }
  
  /**
   * Make PUT request (no caching)
   */
  async put<T = any>(url: string, data?: any, options?: ExtendedRequestInit): Promise<T> {
    const fullUrl = getApiUrl(url);
    const headers = this.getHeaders(fullUrl);
    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Invalidate related GET caches
    this.invalidateRelatedCaches(url);
    
    return await response.json();
  }
  
  /**
   * Make DELETE request (no caching)
   */
  async delete<T = any>(url: string, options?: ExtendedRequestInit): Promise<T> {
    const fullUrl = getApiUrl(url);
    const headers = this.getHeaders(fullUrl);
    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers,
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Invalidate related GET caches
    this.invalidateRelatedCaches(url);
    
    return await response.json();
  }
  
  /**
   * Get default headers including auth token
   */
  private getHeaders(url?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add cache-busting headers for admin endpoints
    if (url && (url.includes('/api/auth') || url.includes('/api/blog') || url.includes('/api/menu') || url.includes('/api/categories') || url.includes('/api/documentation') || url.includes('/api/products'))) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    }
    
    // Add JWT token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
  
  /**
   * Invalidate caches related to a specific URL
   */
  private invalidateRelatedCaches(url: string): void {
    const urlParts = url.split('/');
    let resourceType = urlParts[1]; // e.g., 'blog', 'media', etc.
    
    // Handle admin endpoints specially
    if (resourceType === 'api' && urlParts.length > 2) {
      if (urlParts[2] === 'admin' && urlParts.length > 3) {
        // For admin endpoints, use the resource type after 'admin'
        // e.g., for '/api/admin/users', use 'users' as resource type
        resourceType = urlParts[3];
      } else {
        // For regular API endpoints
        resourceType = urlParts[2];
      }
    }
    

    
    // Remove all cache entries related to this resource type
    for (const key of this.cache.keys()) {
      if (key.includes(`/${resourceType}/`) || key.includes(`/${resourceType}?`) || 
          key.includes(`/admin/${resourceType}`) || key.includes(`/${resourceType}`) ||
          (resourceType === 'menu' && key.includes('/menu/tree')) ||
          (resourceType === 'products' && key.includes('/products'))) {
        this.cache.delete(key);
      }
    }
    
    // Also clear central cache service if available
    if (this.cacheService) {
      // Clear all documentation-related cache entries
      if (resourceType === 'documentation') {
        console.log('🧹 Clearing documentation cache entries');
        // Note: We can't iterate over cache service keys, so we rely on TTL expiration
      }
    }
  }
  
  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Set default TTL for caching
   */
  setDefaultTTL(milliseconds: number): void {
    this.defaultTTL = milliseconds;
  }
  
  /**
   * Get cache keys
   * @returns Array of cache keys
   */
  getCacheKeys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Delete a specific cache entry
   * @param key Cache key to delete
   */
  deleteCacheEntry(key: string): void {
    this.cache.delete(key);
  }
}

export const httpClient = new HttpClient();

// Set up cache service integration after export to avoid circular dependency
import { cacheService } from './cache-service';
httpClient.setCacheService = (service) => {
  httpClient.cacheService = service;
};
httpClient.setCacheService(cacheService);

export default httpClient;
