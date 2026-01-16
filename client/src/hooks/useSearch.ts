import { useState, useCallback } from 'react';
import { blogService } from '@/services/api/blog';
import { SearchResponse } from '@/../../shared/types/api';
import { debounce } from '@/utils/debounce';

interface UseSearchState {
  results: SearchResponse['results'];
  isLoading: boolean;
  error: string | null;
  query: string;
}

export const useSearch = () => {
  const [state, setState] = useState<UseSearchState>({
    results: [],
    isLoading: false,
    error: null,
    query: '',
  });

  const debouncedSearch = useCallback(
    debounce(async (query: string, category?: string) => {
      if (!query.trim()) {
        setState(prev => ({ ...prev, results: [], isLoading: false }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await blogService.searchBlogPosts(query, category);
        setState(prev => ({
          ...prev,
          results: response.results || [],
          isLoading: false,
        }));
      } catch (error) {
        console.error('Search error:', error);
        setState(prev => ({
          ...prev,
          error: 'Search failed',
          isLoading: false,
          results: [],
        }));
      }
    }, 300),
    []
  );

  const search = useCallback((query: string, category?: string) => {
    setState(prev => ({ ...prev, query }));
    debouncedSearch(query, category);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setState({
      results: [],
      isLoading: false,
      error: null,
      query: '',
    });
  }, []);

  return {
    ...state,
    search,
    clearSearch,
  };
};
