import React, { createContext, useContext, useState } from 'react';
import { cacheService } from './index';
import { blogService } from '../api/blog';
import { mediaService } from '../api/media';

// Context for cache management
interface CacheContextType {
  clearCache: (type?: 'all' | 'blog' | 'media') => Promise<void>;
  refreshData: (type: 'blog' | 'media') => Promise<void>;
  isCacheClearing: boolean;
  lastCacheCleared: string | null;
}

const CacheContext = createContext<CacheContextType>({
  clearCache: async () => {},
  refreshData: async () => {},
  isCacheClearing: false,
  lastCacheCleared: null,
});

// Hook for using cache management
export const useCacheManager = () => useContext(CacheContext);

// Provider component
export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCacheClearing, setIsCacheClearing] = useState(false);
  const [lastCacheCleared, setLastCacheCleared] = useState<string | null>(null);

  // Clear specific or all caches
  const clearCache = async (type?: 'all' | 'blog' | 'media') => {
    try {
      setIsCacheClearing(true);
      
      if (!type || type === 'all') {
        cacheService.clear();
        setLastCacheCleared('All caches cleared successfully');
      } else {
        switch (type) {
          case 'blog':
            cacheService.invalidate('/api/blog');
            cacheService.invalidate('/api/blog/all');
            setLastCacheCleared('Blog cache cleared successfully');
            break;
          case 'media':
            cacheService.invalidate('/api/media');
            setLastCacheCleared('Media cache cleared successfully');
            break;
        }
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      setLastCacheCleared('Failed to clear cache');
    } finally {
      setIsCacheClearing(false);
    }
  };

  // Refresh specific data
  const refreshData = async (type: 'blog' | 'media') => {
    try {
      setIsCacheClearing(true);
      
      switch (type) {
        case 'blog':
          await blogService.refreshBlog();
          setLastCacheCleared('Blog data refreshed successfully');
          break;
        case 'media':
          await mediaService.refreshMediaFiles();
          setLastCacheCleared('Media data refreshed successfully');
          break;
      }
    } catch (error) {
      console.error(`Error refreshing ${type} data:`, error);
      setLastCacheCleared(`Failed to refresh ${type} data`);
    } finally {
      setIsCacheClearing(false);
    }
  };

  return (
    <CacheContext.Provider
      value={{
        clearCache,
        refreshData,
        isCacheClearing,
        lastCacheCleared,
      }}
    >
      {children}
    </CacheContext.Provider>
  );
};
