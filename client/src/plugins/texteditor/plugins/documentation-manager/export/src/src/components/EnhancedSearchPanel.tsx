/**
 * Enhanced Search Panel Component
 * Real-time search with filters and suggestions
 */

import React, { useState, useCallback } from 'react';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_type: string;
  section_name: string;
  highlight?: string;
  rank?: number;
}

interface SearchFilters {
  section_id?: string;
  content_type?: string;
  tags?: string[];
}

interface EnhancedSearchPanelProps {
  onSearchResults: (results: SearchResult[]) => void;
  sections?: Array<{ id: string; name: string; slug: string }>;
}

export const EnhancedSearchPanel: React.FC<EnhancedSearchPanelProps> = ({ 
  onSearchResults, 
  sections = [] 
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters: SearchFilters) => {
      if (searchQuery.length < 2) {
        onSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch('/api/documentation/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            filters: searchFilters
          })
        });

        if (response.ok) {
          const data = await response.json();
          onSearchResults(data.results || []);
        }
      } catch (error) {
        console.error('Search failed:', error);
        onSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [onSearchResults]
  );

  // Get auto-complete suggestions
  const getSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/documentation/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.map((item: any) => item.title));
      }
    } catch (error) {
      console.error('Suggestions failed:', error);
    }
  }, []);

  // Handle query change
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(true);
    
    if (value.length >= 2) {
      getSuggestions(value);
      debouncedSearch(value, filters);
    } else {
      setSuggestions([]);
      onSearchResults([]);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (query.length >= 2) {
      debouncedSearch(query, newFilters);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    debouncedSearch(suggestion, filters);
  };

  return (
    <div className="enhanced-search-panel">
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search documentation..."
            className="search-input"
          />
          
          {isSearching && (
            <div className="search-loading">
              <span className="spinner">⏳</span>
            </div>
          )}
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onMouseDown={() => handleSuggestionClick(suggestion)}
              >
                <span className="suggestion-icon">📄</span>
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="search-filters">
        <div className="filter-group">
          <label htmlFor="section-filter">Section:</label>
          <select
            id="section-filter"
            value={filters.section_id || ''}
            onChange={(e) => handleFilterChange({ 
              ...filters, 
              section_id: e.target.value || undefined 
            })}
            className="filter-select"
          >
            <option value="">All Sections</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="type-filter">Type:</label>
          <select
            id="type-filter"
            value={filters.content_type || ''}
            onChange={(e) => handleFilterChange({ 
              ...filters, 
              content_type: e.target.value || undefined 
            })}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="markdown">Markdown</option>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
          </select>
        </div>
        
        {(filters.section_id || filters.content_type) && (
          <button
            onClick={() => {
              setFilters({});
              if (query.length >= 2) {
                debouncedSearch(query, {});
              }
            }}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        )}
      </div>
      
      {query && (
        <div className="search-info">
          Searching for: <strong>"{query}"</strong>
          {Object.keys(filters).length > 0 && (
            <span className="filter-info"> with filters applied</span>
          )}
        </div>
      )}
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
