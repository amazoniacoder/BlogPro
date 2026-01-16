export interface CacheTTLConfig {
  [key: string]: number;
}

export interface CacheSizeConfig {
  maxItems: number;
  maxSize: number; // in bytes
}

// Time-to-live configurations in milliseconds
export const cacheTTL: CacheTTLConfig = {
  // API endpoints
  "api/blog": 15 * 60 * 1000, // 15 minutes
  "api/media": 30 * 60 * 1000, // 30 minutes
  "api/users": 60 * 60 * 1000, // 60 minutes

  // Default TTL
  default: 5 * 60 * 1000, // 5 minutes
};

// Cache size limits
export const cacheSize: CacheSizeConfig = {
  maxItems: 100,
  maxSize: 50 * 1024 * 1024, // 50MB
};

// Cache version - increment when data structure changes
export const CACHE_VERSION = "v1";

// Cache persistence configuration
export const PERSISTENCE_ENABLED = true;
export const PERSISTENCE_SYNC_INTERVAL = 60000; // 1 minute

// Cache groups for selective invalidation
export const cacheGroups = {
  blog: ["api/blog", "api/blog/all"],
  media: ["api/media"],
  users: ["api/users"],
};
