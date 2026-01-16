import { getRedisClient } from '../db/redis';
import type { AnalyticsOverview } from './analytics-service';

export class AnalyticsCacheService {
  private readonly TTL = {
    overview: 300,      // 5 minutes
    realtime: 30,       // 30 seconds
    chartData: 600      // 10 minutes
  };

  async getOverview(days: number): Promise<AnalyticsOverview | null> {
    try {
      const client = await getRedisClient();
      if (!client) return null;

      const key = `analytics:overview:${days}`;
      const cached = await client.get(key);
      
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get overview error:', error);
      return null;
    }
  }

  async setOverview(days: number, data: AnalyticsOverview): Promise<void> {
    try {
      const client = await getRedisClient();
      if (!client) return;

      const key = `analytics:overview:${days}`;
      await client.setEx(key, this.TTL.overview, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set overview error:', error);
    }
  }

  async getRealtimeStats(): Promise<any | null> {
    try {
      const client = await getRedisClient();
      if (!client) return null;

      const cached = await client.get('analytics:realtime');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get realtime error:', error);
      return null;
    }
  }

  async setRealtimeStats(data: any): Promise<void> {
    try {
      const client = await getRedisClient();
      if (!client) return;

      await client.setEx('analytics:realtime', this.TTL.realtime, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set realtime error:', error);
    }
  }

  async invalidateOverview(days?: number): Promise<void> {
    try {
      const client = await getRedisClient();
      if (!client) return;

      if (days) {
        await client.del(`analytics:overview:${days}`);
      } else {
        // Invalidate all overview caches
        const keys = await client.keys('analytics:overview:*');
        if (keys.length > 0) {
          await client.del(keys);
        }
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      const client = await getRedisClient();
      if (!client) return;

      const keys = await client.keys('analytics:*');
      if (keys.length > 0) {
        await client.del(keys);
        console.log(`🧹 Cleared ${keys.length} analytics cache keys`);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

export const analyticsCacheService = new AnalyticsCacheService();