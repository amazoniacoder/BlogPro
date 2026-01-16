/**
 * Optimized Library Content Hook
 * Enhanced version of useLibraryContent with performance optimizations
 */

import { useState, useEffect, useCallback } from 'react';
import { LibraryType } from '../types/LibraryContext';
import { useOptimizedDocumentation } from './useOptimizedDocumentation';
import { Section, Content } from './useLibraryContent';

interface OptimizedLibraryContentData {
  sections: Section[];
  content: Content[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isStale: boolean;
}

interface UseOptimizedLibraryContentReturn extends OptimizedLibraryContentData {
  reload: () => Promise<void>;
  preload: () => Promise<void>;
  getContentBySlug: (slug: string) => Content | undefined;
  getSectionBySlug: (slug: string) => Section | undefined;
  getPerformanceInfo: () => {
    cacheHitRate: string;
    averageLoadTime: number;
    totalRequests: number;
  };
}

export const useOptimizedLibraryContent = (
  libraryType: LibraryType
): UseOptimizedLibraryContentReturn => {
  const [data, setData] = useState<OptimizedLibraryContentData>({
    sections: [],
    content: [],
    loading: true,
    error: null,
    lastUpdated: null,
    isStale: false
  });

  const {
    loadContentWithCache,
    getPerformanceMetrics,
    preloadContent,
    invalidateCache
  } = useOptimizedDocumentation(libraryType);

  // Memoized content lookup functions
  const getContentBySlug = useCallback((slug: string): Content | undefined => {
    return data.content.find(item => item.slug === slug);
  }, [data.content]);

  const getSectionBySlug = useCallback((slug: string): Section | undefined => {
    const findInSections = (sections: Section[]): Section | undefined => {
      for (const section of sections) {
        if (section.slug === slug) return section;
        if (section.children) {
          const found = findInSections(section.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findInSections(data.sections);
  }, [data.sections]);

  // Optimized content loading
  const loadLibraryContent = useCallback(async (useCache: boolean = true) => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      if (!useCache) {
        invalidateCache(libraryType);
      }

      const [sectionsResponse, contentResponse] = await Promise.all([
        loadContentWithCache(`/api/documentation/public/sections/${libraryType}`),
        loadContentWithCache(`/api/documentation/public/content/${libraryType}`)
      ]);

      setData({
        sections: sectionsResponse || [],
        content: contentResponse || [],
        loading: false,
        error: null,
        lastUpdated: new Date(),
        isStale: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        isStale: true
      }));
    }
  }, [libraryType, loadContentWithCache, invalidateCache]);

  // Force reload without cache
  const reload = useCallback(async () => {
    await loadLibraryContent(false);
  }, [loadLibraryContent]);

  // Preload content for better performance
  const preload = useCallback(async () => {
    const endpoints = [
      `/api/documentation/public/sections/${libraryType}`,
      `/api/documentation/public/content/${libraryType}`,
      `/api/documentation/public/stats/${libraryType}`
    ];
    
    try {
      await preloadContent(endpoints);
    } catch (error) {
      console.warn('Preload failed:', error);
    }
  }, [libraryType, preloadContent]);

  // Get performance information
  const getPerformanceInfo = useCallback(() => {
    const metrics = getPerformanceMetrics();
    const total = metrics.cacheHits + metrics.cacheMisses;
    const hitRate = total > 0 ? ((metrics.cacheHits / total) * 100).toFixed(1) : '0';
    
    return {
      cacheHitRate: hitRate,
      averageLoadTime: metrics.averageResponseTime,
      totalRequests: metrics.totalRequests
    };
  }, [getPerformanceMetrics]);

  // Initial load and library type change handling
  useEffect(() => {
    loadLibraryContent();
  }, [loadLibraryContent]);

  // Stale data detection (mark as stale after 10 minutes)
  useEffect(() => {
    if (!data.lastUpdated) return;

    const staleTimeout = setTimeout(() => {
      setData(prev => ({ ...prev, isStale: true }));
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearTimeout(staleTimeout);
  }, [data.lastUpdated]);

  // Auto-refresh stale data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && data.isStale && !data.loading) {
        loadLibraryContent();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [data.isStale, data.loading, loadLibraryContent]);

  return {
    ...data,
    reload,
    preload,
    getContentBySlug,
    getSectionBySlug,
    getPerformanceInfo
  };
};
