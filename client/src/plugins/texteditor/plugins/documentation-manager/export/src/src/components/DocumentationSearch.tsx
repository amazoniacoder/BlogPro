/**
 * Documentation Search Component
 */

import React, { useRef, useEffect } from 'react';

interface SearchResult {
  title: string;
  content_type?: string;
  excerpt?: string;
  snippet?: string;
  section_name?: string;
  section?: string;
  url: string;
}

interface DocumentationSearchProps {
  isSearchOpen: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  onSearch: (query: string) => void;
  onResultClick: (url: string) => void;
  onClose: () => void;
  onQueryChange: (query: string) => void;
}

export const DocumentationSearch: React.FC<DocumentationSearchProps> = ({
  isSearchOpen,
  searchQuery,
  searchResults,
  onSearch,
  onResultClick,
  onClose,
  onQueryChange
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Handle search input with debouncing
  const handleSearchInput = (value: string) => {
    onQueryChange(value);
    // Debounce search calls
    clearTimeout((window as any).searchTimeout);
    (window as any).searchTimeout = setTimeout(() => onSearch(value), 300);
  };

  return (
    <>
      <div className={`search-panel ${isSearchOpen ? 'search-panel--open' : ''}`}>
        <div className="search-panel__container">
          <div className="search">
            <input 
              ref={searchInputRef}
              type="text" 
              className="search__input" 
              placeholder="Введите запрос для поиска..." 
              aria-label="Поиск"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
            />
            <div className={`search__results ${searchResults.length > 0 ? 'search__results--visible' : ''}`} role="listbox" aria-label="Результаты поиска">
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="search__no-results">
                  <p>Результаты не найдены</p>
                  <small>Попробуйте изменить поисковый запрос</small>
                </div>
              )}
              {searchResults.map((result, index) => (
                <div 
                  key={index} 
                  className="search__result" 
                  onClick={() => onResultClick(result.url)}
                >
                  <div className="search__result-header">
                    <div className="search__result-icon">
                      {result.content_type === 'markdown' ? '📄' : 
                       result.content_type === 'html' ? '🌐' : '📚'}
                    </div>
                    <div className="search__result-title">{result.title}</div>
                    <div className="search__result-type">
                      {result.content_type || 'Document'}
                    </div>
                  </div>
                  <div className="search__result-snippet">{result.excerpt || result.snippet}</div>
                  <div className="search__result-section">{result.section_name || result.section}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {isSearchOpen && (
        <div className="search-panel-backdrop" onClick={onClose}></div>
      )}
    </>
  );
};
