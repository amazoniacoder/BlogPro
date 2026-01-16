import React, { useState } from 'react';
import { Icon } from '../icons/components';

interface ProductSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onSearch,
  placeholder = 'Search products...'
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="product-search">
      <form className="product-search__form" onSubmit={handleSubmit}>
        <div className="product-search__input-group">
          <Icon name="search" size={18} className="product-search__icon" />
          <input
            type="text"
            className="product-search__input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="product-search__clear"
              onClick={handleClear}
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
        <button type="submit" className="product-search__submit">
          Search
        </button>
      </form>
    </div>
  );
};
