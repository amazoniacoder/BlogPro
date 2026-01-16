import { getRedisClient } from '../db/redis';
import { logger } from './logger';

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
}

class CacheManager {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    invalidations: 0
  };

  async get(key: string): Promise<any> {
    try {
      const redisClient = await getRedisClient();
      if (redisClient) {
        const result = await redisClient.get(key);
        if (result) {
          this.stats.hits++;
          return JSON.parse(result);
        }
      }
      this.stats.misses++;
      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error instanceof Error ? error.message : String(error) });
      this.stats.misses++;
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
        this.stats.sets++;
        logger.debug('Cache set', { key, ttl });
      }
    } catch (error) {
      logger.error('Cache set error', { key, error: error instanceof Error ? error.message : String(error) });
    }
  }

  async invalidate(pattern: string): Promise<number> {
    try {
      const redisClient = await getRedisClient();
      if (redisClient) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
          this.stats.invalidations += keys.length;
          logger.info('Cache invalidated', { pattern, count: keys.length });
          return keys.length;
        }
      }
      return 0;
    } catch (error) {
      logger.error('Cache invalidation error', { pattern, error: error instanceof Error ? error.message : String(error) });
      return 0;
    }
  }

  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0
    };
  }

  resetStats(): void {
    this.stats = { hits: 0, misses: 0, sets: 0, invalidations: 0 };
  }
}

export const cacheManager = new CacheManager();