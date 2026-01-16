import { useState, useRef } from 'react';
import { searchData, SearchItem } from '../data/searchData';

export const useSearch = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const filtered = searchData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.snippet.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleResultClick = (url: string) => {
    closeSearch();
    const element = document.querySelector(url);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return {
    isSearchOpen,
    searchQuery,
    searchResults,
    searchInputRef,
    handleSearch,
    toggleSearch,
    closeSearch,
    handleResultClick,
    setSearchResults
  };
};
