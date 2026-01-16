// Export all cache-related services
export { routeCacheService } from './route-cache';
export { default as httpClient } from './http-client';
export { cacheService } from './cache-service';

// Cache configuration constants
export const CACHE_TTL = {
  DEFAULT: 5 * 60 * 1000, // 5 minutes 
  BLOG_POSTS: 15 * 60 * 1000, // 15 minutes
  MEDIA_FILES: 30 * 60 * 1000, // 30 minutes
  ADMIN_ROUTES: 5 * 60 * 1000 // 5 minutes
};
