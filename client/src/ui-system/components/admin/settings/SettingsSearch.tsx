import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';
import type { IconName } from '@/ui-system/icons/components';

interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  keywords?: string[];
  icon?: IconName;
}

interface SettingsSearchProps {
  items: SearchableItem[];
  onItemSelect: (item: SearchableItem) => void;
  placeholder?: string;
  className?: string;
}

const SettingsSearch: React.FC<SettingsSearchProps> = ({
  items,
  onItemSelect,
  placeholder,
  className = ''
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    return items
      .filter(item => {
        const titleMatch = item.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = item.description?.toLowerCase().includes(searchTerm);
        const categoryMatch = item.category.toLowerCase().includes(searchTerm);
        const keywordMatch = item.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm)
        );
        
        return titleMatch || descriptionMatch || categoryMatch || keywordMatch;
      })
      .slice(0, 8); // Limit results
  }, [items, query]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  }, []);

  const handleItemClick = useCallback((item: SearchableItem) => {
    onItemSelect(item);
    setQuery('');
    setIsOpen(false);
  }, [onItemSelect]);

  const handleInputFocus = useCallback(() => {
    if (query.length > 0) {
      setIsOpen(true);
    }
  }, [query]);

  const handleInputBlur = useCallback(() => {
    // Delay closing to allow item clicks
    setTimeout(() => setIsOpen(false), 200);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setIsOpen(false);
  }, []);

  return (
    <div className={`settings-search ${className}`}>
      <div className="settings-search__input-wrapper">
        <Icon name="search" size={16} className="settings-search__icon" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder || t('admin:searchSettings', { 
            defaultValue: 'Search settings...' 
          })}
          className="settings-search__input"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="settings-search__clear"
            title={t('common:clear', { defaultValue: 'Clear' })}
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div className="settings-search__results">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="settings-search__result"
            >
              {item.icon && (
                <Icon name={item.icon} size={16} className="settings-search__result-icon" />
              )}
              <div className="settings-search__result-content">
                <div className="settings-search__result-title">{item.title}</div>
                {item.description && (
                  <div className="settings-search__result-description">
                    {item.description}
                  </div>
                )}
                <div className="settings-search__result-category">{item.category}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && filteredItems.length === 0 && (
        <div className="settings-search__no-results">
          <Icon name="search" size={16} />
          <span>{t('admin:noSettingsFound', { defaultValue: 'No settings found' })}</span>
        </div>
      )}
    </div>
  );
};

export default SettingsSearch;
