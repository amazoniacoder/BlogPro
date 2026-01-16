import { Request, Response, NextFunction } from "express";
import { cacheService } from "../services/cacheService";

interface ApiCacheOptions {
  ttl?: number;
  keyFn?: (req: Request) => string;
}

const defaultKeyFn = (req: Request): string => {
  return `api:${req.method}:${req.originalUrl}`;
};

export const apiCache = (options: ApiCacheOptions = {}) => {
  const ttl = options.ttl || 300; // Default 5 minutes
  const keyFn = options.keyFn || defaultKeyFn;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip cache for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Skip cache if explicitly requested
    if (req.query.noCache === "true" || req.headers["x-no-cache"]) {
      return next();
    }

    const cacheKey = keyFn(req);

    try {
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        // Add cache hit header
        res.setHeader("X-Cache", "HIT");
        return res.json(cachedData);
      }

      // Cache miss, continue to handler but intercept the response
      res.setHeader("X-Cache", "MISS");

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json method
      res.json = function (body) {
        // Restore original method to avoid recursion
        res.json = originalJson;

        // Cache the response if status is successful
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, body, ttl).catch((err) => {
            console.error(`Error caching response for ${cacheKey}:`, err);
          });
        }

        // Call the original method
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error(`Cache middleware error for ${cacheKey}:`, error);
      next();
    }
  };
};

export const clearApiCache = async (
  pattern: string = "*"
): Promise<boolean> => {
  return cacheService.deleteByPattern(`api:${pattern}`);
};
