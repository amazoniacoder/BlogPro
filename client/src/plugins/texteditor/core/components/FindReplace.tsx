import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ServiceFactory } from '../services/ServiceFactory';
import { SearchOptions } from '../services/content/SearchService';
import { Icon } from '../../../../ui-system/icons/components';
import './FindReplace.css';

interface FindReplaceProps {
  onCommand?: (command: string, data?: any) => void;
  disabled?: boolean;
}

const FindReplace: React.FC<FindReplaceProps> = ({ disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false
  });
  const [searchStats, setSearchStats] = useState({ current: 0, total: 0, query: '' });
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle search
  const handleSearch = useCallback(() => {
    const editor = document.querySelector('.editor-content') as HTMLElement;
    if (!editor || !searchQuery.trim()) {
      setSearchStats({ current: 0, total: 0, query: '' });
      return;
    }

    ServiceFactory.getSearchService().findAll(editor, searchQuery, searchOptions);
    setSearchStats(ServiceFactory.getSearchService().getSearchStats());
  }, [searchQuery, searchOptions]);

  // Handle find next
  const handleFindNext = useCallback(() => {
    ServiceFactory.getSearchService().findNext();
    setSearchStats(ServiceFactory.getSearchService().getSearchStats());
  }, []);

  // Handle find previous
  const handleFindPrevious = useCallback(() => {
    ServiceFactory.getSearchService().findPrevious();
    setSearchStats(ServiceFactory.getSearchService().getSearchStats());
  }, []);

  // Handle replace current
  const handleReplaceCurrent = useCallback(() => {
    console.log('🔄 COMPONENT: Replace button clicked');
    
    const editor = document.querySelector('.editor-content') as HTMLElement;
    if (!editor) {
      console.log('❌ No editor element found');
      return;
    }
    
    if (!searchQuery.trim()) {
      console.log('❌ No search query');
      return;
    }
    
    console.log('📊 Component state:', {
      searchQuery,
      replaceText,
      searchOptions
    });
    
    // Ensure we have a current selection
    const stats = ServiceFactory.getSearchService().getSearchStats();
    console.log('📈 Current search stats:', stats);
    
    if (stats.total === 0) {
      console.log('⚠️ No search results, performing search first');
      ServiceFactory.getSearchService().findAll(editor, searchQuery, searchOptions);
      ServiceFactory.getSearchService().findNext(); // Select first result
    }
    
    console.log('🎯 Calling ServiceFactory.getSearchService().replaceCurrent with:', replaceText);
    const success = ServiceFactory.getSearchService().replaceCurrent(replaceText);
    console.log('✅ Replace result:', success);
    
    if (success) {
      console.log('🔄 Refreshing search results...');
      // After replacement, refresh the search to update results
      setTimeout(() => {
        if (searchQuery.trim()) {
          ServiceFactory.getSearchService().findAll(editor, searchQuery, searchOptions);
          const newStats = ServiceFactory.getSearchService().getSearchStats();
          console.log('📊 Updated stats:', newStats);
          setSearchStats(newStats);
        }
      }, 10);
    } else {
      console.log('❌ Replace operation failed');
    }
  }, [replaceText, searchQuery, searchOptions]);

  // Handle replace all
  const handleReplaceAll = useCallback(() => {
    const editor = document.querySelector('.editor-content') as HTMLElement;
    if (!editor) return;

    const count = ServiceFactory.getSearchService().replaceAll(editor, searchQuery, replaceText, searchOptions);
    setSearchStats({ current: 0, total: 0, query: '' });
    
    // Show feedback
    if (count > 0) {
      console.log(`Replaced ${count} occurrences`);
    }
  }, [searchQuery, replaceText, searchOptions]);

  // Handle close
  const handleClose = useCallback(() => {
    const editor = document.querySelector('.editor-content') as HTMLElement;
    if (editor) {
      ServiceFactory.getSearchService().clearSearch(editor);
    }
    setIsOpen(false);
    setSearchQuery('');
    setReplaceText('');
    setSearchStats({ current: 0, total: 0, query: '' });
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsOpen(true);
        setIsReplaceMode(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setIsOpen(true);
        setIsReplaceMode(true);
      } else if (e.key === 'Escape' && isOpen) {
        handleClose();
      } else if (isOpen && e.key === 'Enter') {
        if (e.shiftKey) {
          handleFindPrevious();
        } else {
          handleFindNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handleFindNext, handleFindPrevious]);

  // Auto-search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(handleSearch, 300);
      return () => clearTimeout(timeoutId);
    } else {
      const editor = document.querySelector('.editor-content') as HTMLElement;
      if (editor) {
        ServiceFactory.getSearchService().clearSearch(editor);
      }
      setSearchStats({ current: 0, total: 0, query: '' });
    }
  }, [searchQuery, handleSearch]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [isOpen]);

  // Close when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  return (
    <div className="find-replace-dropdown" ref={dropdownRef}>
      <button
        className={`toolbar-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        title="Find & Replace (Ctrl+F)"
        type="button"
      >
        <Icon name="search" size={16} />
      </button>

      {isOpen && (
        <div className="find-replace-panel">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsReplaceMode(false)}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: !isReplaceMode ? '#3b82f6' : 'transparent',
              color: !isReplaceMode ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Find
          </button>
          <button
            onClick={() => setIsReplaceMode(true)}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: isReplaceMode ? '#3b82f6' : 'transparent',
              color: isReplaceMode ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Replace
          </button>
        </div>
        <button
          onClick={handleClose}
          style={{
            border: 'none',
            background: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find..."
            style={{
              flex: 1,
              padding: '6px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleFindPrevious}
            disabled={searchStats.total === 0}
            title="Previous (Shift+Enter)"
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ↑
          </button>
          <button
            onClick={handleFindNext}
            disabled={searchStats.total === 0}
            title="Next (Enter)"
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ↓
          </button>
        </div>
        {searchStats.total > 0 && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {searchStats.current} of {searchStats.total}
          </div>
        )}
      </div>

      {/* Replace Input */}
      {isReplaceMode && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              style={{
                flex: 1,
                padding: '6px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleReplaceCurrent}
              disabled={searchStats.total === 0}
              title="Replace current"
              style={{
                padding: '6px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Replace
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={searchStats.total === 0}
              title="Replace all"
              style={{
                padding: '6px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#dc2626',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              All
            </button>
          </div>
        </div>
      )}

      {/* Options */}
      <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={searchOptions.caseSensitive}
            onChange={(e) => setSearchOptions(prev => ({ ...prev, caseSensitive: e.target.checked }))}
          />
          Case sensitive
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={searchOptions.wholeWord}
            onChange={(e) => setSearchOptions(prev => ({ ...prev, wholeWord: e.target.checked }))}
          />
          Whole word
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={searchOptions.useRegex}
            onChange={(e) => setSearchOptions(prev => ({ ...prev, useRegex: e.target.checked }))}
          />
          Regex
        </label>
      </div>
        </div>
      )}
    </div>
  );
};

export { FindReplace };
export default FindReplace;
