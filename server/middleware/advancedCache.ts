import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../db/redis';
import { logger } from '../utils/logger';

interface CacheOptions {
  ttl: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request, res: Response) => boolean;
  tags?: string[];
}

const memoryCache = new Map<string, { data: any; expires: number; tags: string[] }>();

// Clear all comment-related cache immediately
memoryCache.clear();
console.log('🧹 CACHE: Memory cache cleared for comments');

export const advancedCache = (options: CacheOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator ? options.keyGenerator(req) : `${req.method}:${req.originalUrl}`;
    
    // Check condition
    if (options.condition && !options.condition(req, res)) {
      return next();
    }

    try {
      // Try Redis first
      const redisClient = await getRedisClient();
      if (redisClient) {
        const cached = await redisClient.get(key);
        if (cached) {
          const parsedData = JSON.parse(cached);
          
          // Simple cache validation (same as blog system)
          logger.debug('Cache hit (Redis)', { key });
          return res.json(parsedData);
        }
      }

      // Fallback to memory cache
      const memoryCached = memoryCache.get(key);
      if (memoryCached && memoryCached.expires > Date.now()) {
        // Simple memory cache validation (same as blog system)
        logger.debug('Cache hit (Memory)', { key });
        return res.json(memoryCached.data);
      }

      // Cache miss - intercept response
      const originalSend = res.json;
      res.json = function(data: any) {
        // Store in Redis
        getRedisClient().then(redisClient => {
          if (redisClient) {
            redisClient.setEx(key, options.ttl, JSON.stringify(data));
          }
        });

        // Store in memory as fallback
        memoryCache.set(key, {
          data,
          expires: Date.now() + (options.ttl * 1000),
          tags: options.tags || []
        });

        logger.debug('Cache set', { key, ttl: options.ttl });
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache error', { error: error instanceof Error ? error.message : String(error), key });
      next();
    }
  };
};

export const invalidateCache = async (pattern: string) => {
  try {
    console.log(`🧹 CACHE: Invalidating cache pattern: ${pattern}`);
    
    const redisClient = await getRedisClient();
    if (redisClient) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info('Cache invalidated (Redis)', { pattern, count: keys.length });
        console.log(`🧹 CACHE: Cleared ${keys.length} Redis keys for pattern: ${pattern}`);
      }
    }

    // Clear memory cache
    let cleared = 0;
    for (const [key] of memoryCache) {
      if (key.includes(pattern.replace('*', ''))) {
        memoryCache.delete(key);
        cleared++;
      }
    }
    console.log(`🧹 CACHE: Cleared ${cleared} memory cache entries for pattern: ${pattern}`);
  } catch (error) {
    logger.error('Cache invalidation error', { error: error instanceof Error ? error.message : String(error), pattern });
  }
};

// Clear all comment-related cache on startup
invalidateCache('*comments*');
invalidateCache('DELETE:*');
invalidateCache('POST:*');

export const invalidateByTags = async (tags: string[]) => {
  for (const [key, value] of memoryCache) {
    if (value.tags.some(tag => tags.includes(tag))) {
      memoryCache.delete(key);
    }
  }
  logger.info('Cache invalidated by tags', { tags });
};