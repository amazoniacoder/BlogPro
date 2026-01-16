/**
 * Enhanced Search Hook
 * 
 * Advanced search functionality with API integration and filtering.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  section_name?: string;
  section_slug?: string;
  rank: number;
  highlight?: string;
  type: 'content' | 'file';
}

export interface SearchFilters {
  sections: string[];
  tags: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  fileTypes: string[];
}

export const useEnhancedSearch = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [fileResults, setFileResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<Array<{ title: string; type: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sections: [],
    tags: [],
    fileTypes: []
  });
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const debouncedSearch = useCallback((query: string, currentFilters: SearchFilters) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query, currentFilters);
    }, 300);
  }, []);

  // Main search function
  const performSearch = useCallback(async (query: string, searchFilters: SearchFilters = filters) => {
    if (query.length < 2) {
      setSearchResults([]);
      setFileResults([]);
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        q: query,
        limit: '20'
      });

      if (searchFilters.sections.length > 0) {
        params.append('sections', searchFilters.sections.join(','));
      }

      if (searchFilters.tags.length > 0) {
        params.append('tags', searchFilters.tags.join(','));
      }

      if (searchFilters.dateRange) {
        params.append('dateStart', searchFilters.dateRange.start);
        params.append('dateEnd', searchFilters.dateRange.end);
      }

      if (searchFilters.fileTypes.length > 0) {
        params.append('fileTypes', searchFilters.fileTypes.join(','));
      }

      const response = await fetch(`/api/documentation/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.results || []);
        setFileResults(data.fileResults || []);
      } else {
        console.error('Search failed:', data.error);
        setSearchResults([]);
        setFileResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setFileResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Get search suggestions
  const getSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/documentation/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (response.ok) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  // Handle search input change
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (query.length >= 2) {
      debouncedSearch(query, filters);
      getSuggestions(query);
    } else {
      setSearchResults([]);
      setFileResults([]);
      setSuggestions([]);
    }
  }, [debouncedSearch, getSuggestions, filters]);

  // Toggle search panel
  const toggleSearch = useCallback(() => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Close search panel
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setFileResults([]);
    setSuggestions([]);
  }, []);

  // Handle result click
  const handleResultClick = useCallback((result: SearchResult) => {
    closeSearch();
    
    // Navigate to result
    if (result.type === 'content') {
      const url = result.section_slug 
        ? `#${result.section_slug}/${result.slug}`
        : `#${result.slug}`;
      
      window.history.pushState(null, '', url);
      
      // Scroll to element
      setTimeout(() => {
        const element = document.querySelector(`[data-slug="${result.slug}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (result.type === 'file') {
      // Handle file navigation
      console.log('Navigate to file:', result.slug);
    }
  }, [closeSearch]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Re-search with new filters if there's a query
    if (searchQuery.length >= 2) {
      performSearch(searchQuery, updatedFilters);
    }
  }, [filters, searchQuery, performSearch]);

  // Clear filters
  const clearFilters = useCallback(() => {
    const emptyFilters: SearchFilters = {
      sections: [],
      tags: [],
      fileTypes: []
    };
    setFilters(emptyFilters);
    
    // Re-search without filters
    if (searchQuery.length >= 2) {
      performSearch(searchQuery, emptyFilters);
    }
  }, [searchQuery, performSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        toggleSearch();
      }
      
      // Escape to close search
      if (event.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, toggleSearch, closeSearch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    isSearchOpen,
    searchQuery,
    searchResults,
    fileResults,
    suggestions,
    loading,
    filters,
    
    // Refs
    searchInputRef,
    
    // Actions
    handleSearch,
    toggleSearch,
    closeSearch,
    handleResultClick,
    updateFilters,
    clearFilters,
    performSearch,
    
    // Computed
    totalResults: searchResults.length + fileResults.length,
    hasResults: searchResults.length > 0 || fileResults.length > 0,
    hasFilters: filters.sections.length > 0 || filters.tags.length > 0 || filters.fileTypes.length > 0
  };
};
