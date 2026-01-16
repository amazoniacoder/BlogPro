import React from 'react';
import { SearchItem } from '../data/searchData';

interface SearchPanelProps {
  isOpen: boolean;
  query: string;
  results: SearchItem[];
  inputRef: React.RefObject<HTMLInputElement>;
  onSearch: (query: string) => void;
  onResultClick: (url: string) => void;
  onClose: () => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  isOpen,
  query,
  results,
  inputRef,
  onSearch,
  onResultClick,
  onClose
}) => {
  return (
    <>
      <div className={`search-panel ${isOpen ? 'search-panel--open' : ''}`}>
        <div className="search-panel__container">
          <div className="search">
            <input 
              ref={inputRef}
              type="text" 
              className="search__input" 
              placeholder="Введите запрос для поиска..." 
              aria-label="Поиск"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
            />
            <div className={`search__results ${results.length > 0 ? 'search__results--visible' : ''}`} role="listbox" aria-label="Результаты поиска">
              {query.length >= 2 && results.length === 0 && (
                <div className="search__no-results">
                  <p>Результаты не найдены</p>
                  <small>Попробуйте изменить поисковый запрос</small>
                </div>
              )}
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className="search__result" 
                  onClick={() => onResultClick(result.url)}
                >
                  <div className="search__result-header">
                    <div className="search__result-icon">
                      {result.type === 'feature' ? '🎯' : 
                       result.type === 'reference' ? '📚' : '📄'}
                    </div>
                    <div className="search__result-title">{result.title}</div>
                    <div className="search__result-type">
                      {result.type === 'feature' ? 'Функция' : 
                       result.type === 'reference' ? 'Справочник' : 'Концепция'}
                    </div>
                  </div>
                  <div className="search__result-snippet">{result.snippet}</div>
                  <div className="search__result-section">{result.section}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="search-panel-backdrop" onClick={onClose}></div>
      )}
    </>
  );
};
