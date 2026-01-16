import { getRedisClient } from "../db/redis";

let redisDisabled = false;

export class CacheService {
  private prefix: string;

  constructor(prefix: string = "app:") {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (redisDisabled) {
      return null;
    }

    try {
      const client = await getRedisClient();
      if (!client) {
        redisDisabled = true;
        return null;
      }

      const data = await client.get(this.getKey(key));

      if (!data) {
        return null;
      }
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(
    key: string,
    data: T,
    ttlSeconds: number = 300
  ): Promise<boolean> {
    if (redisDisabled) {
      return false;
    }

    try {
      const client = await getRedisClient();
      if (!client) {
        redisDisabled = true;
        return false;
      }

      await client.set(this.getKey(key), JSON.stringify(data), {
        EX: ttlSeconds,
      });
      return true;
    } catch (error) {
      console.error(`Error setting cache for key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (redisDisabled) {
      return true;
    }

    try {
      const client = await getRedisClient();
      if (!client) {
        redisDisabled = true;
        return true; // Consider it deleted if Redis is not available
      }

      await client.del(this.getKey(key));
      return true;
    } catch (error) {
      console.error(`Error deleting cache for key ${key}:`, error);
      return false;
    }
  }

  async deleteByPattern(pattern: string): Promise<boolean> {
    if (redisDisabled) {
      return true;
    }

    try {
      const client = await getRedisClient();
      if (!client) {
        redisDisabled = true;
        return true; // Consider it deleted if Redis is not available
      }

      const keys = await client.keys(this.getKey(pattern));

      if (keys.length > 0) {
        await client.del(keys);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting cache by pattern ${pattern}:`, error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    if (redisDisabled) {
      return true;
    }

    try {
      const client = await getRedisClient();
      if (!client) {
        redisDisabled = true;
        return true; // Consider it cleared if Redis is not available
      }

      const keys = await client.keys(`${this.prefix}*`);

      if (keys.length > 0) {
        await client.del(keys);
      }

      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
  }

  async getStats(): Promise<{ keys: number; memory: string }> {
    if (redisDisabled) {
      return { keys: 0, memory: "0B (Redis disabled)" };
    }

    try {
      const client = await getRedisClient();
      if (!client) {
        redisDisabled = true;
        return { keys: 0, memory: "0B (Redis disabled)" };
      }

      const keys = await client.keys(`${this.prefix}*`);
      const info = await client.info("memory");

      // Extract used_memory from info string
      const memoryMatch = info.match(/used_memory_human:(.+)\r\n/);
      const memory = memoryMatch ? memoryMatch[1].trim() : "unknown";

      return {
        keys: keys.length,
        memory,
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return { keys: 0, memory: "unavailable" };
    }
  }
}

// Create and export a default instance
export const cacheService = new CacheService();
