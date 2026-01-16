import { Icon } from '../../../../../../../ui-system/icons/components';
/**
 * Search Panel Component
 * Sliding search panel with library-specific search
 * Max 200 lines - strict TypeScript compliance
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LibraryType, SearchResult } from '../../types/SharedTypes';

interface SearchPanelProps {
  readonly libraryType: LibraryType;
}

/**
 * Sliding search panel with real-time search functionality
 */
export const SearchPanel: React.FC<SearchPanelProps> = ({ libraryType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Perform search with debouncing
   */
  const performSearch = useCallback(async (searchQuery: string): Promise<void> => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/documentation/public/search/${libraryType}?q=${encodeURIComponent(searchQuery)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [libraryType]);

  /**
   * Debounced search handler
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  /**
   * Handle search result click
   */
  const handleResultClick = (result: SearchResult): void => {
    const element = document.querySelector(`#${result.slug}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
      setQuery('');
    }
  };

  /**
   * Listen for toggle search events
   */
  useEffect(() => {
    const handleToggleSearch = (): void => {
      setIsOpen(prev => !prev);
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('toggleSearch', handleToggleSearch);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('toggleSearch', handleToggleSearch);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`search-panel ${isOpen ? 'search-panel--open' : ''}`}>
      <div className="search-panel__container">
        <div className="search">
          <input
            type="text"
            className="search__input"
            placeholder={`Search ${libraryType} documentation...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search documentation"
            autoFocus={isOpen}
          />
          
          <div className="search__results" role="listbox" aria-label="Search results">
            {loading && (
              <div className="search__loading">
                <Icon name="search" size={16} /> Searching...
              </div>
            )}
            
            {!loading && results.length > 0 && (
              <ul className="search__results-list">
                {results.map(result => (
                  <li key={result.id} className="search__result-item">
                    <button
                      className="search__result-button"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="search__result-title">{result.title}</div>
                      <div className="search__result-excerpt">{result.excerpt}</div>
                      {result.sectionName && (
                        <div className="search__result-section">{result.sectionName}</div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            
            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="search__no-results">
                <span>📭</span> No results found for "{query}"
              </div>
            )}
          </div>
        </div>
        
        <button
          className="search-panel__close"
          onClick={() => setIsOpen(false)}
          aria-label="Close search"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SearchPanel;
