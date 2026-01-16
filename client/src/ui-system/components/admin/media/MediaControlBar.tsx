import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';
import MediaTabs from './MediaTabs';
import MediaViewToggle from './MediaViewToggle';

type MediaCategory = 'images' | 'documents' | 'videos' | 'audio' | 'editor';
type ViewMode = 'grid' | 'table';

interface MediaControlBarProps {
  activeTab: MediaCategory;
  onTabChange: (tab: MediaCategory) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
  onUploadClick: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  counts?: Record<MediaCategory, number>;
}

const MediaControlBar: React.FC<MediaControlBarProps> = ({
  activeTab,
  onTabChange,
  searchValue,
  onSearchChange,
  itemsPerPage,
  onItemsPerPageChange,
  onUploadClick,
  viewMode,
  onViewModeChange,
  counts
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchExpanded(false);
      }
    };

    if (searchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchExpanded]);

  // Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && searchExpanded) {
        setSearchExpanded(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchExpanded]);

  return (
    <div className="admin-media-controls">
      <div className="admin-media-controls__top">
        <div className="admin-media-controls__section admin-media-controls__tabs">
          <MediaTabs 
            activeTab={activeTab}
            onTabChange={onTabChange}
            counts={counts}
          />
        </div>

        <div className="admin-media-controls__section admin-media-controls__search" ref={searchRef}>
          <button
            className="admin-search-dropdown__trigger"
            onClick={() => setSearchExpanded(!searchExpanded)}
            aria-expanded={searchExpanded}
            aria-label={t('admin:searchMedia', { defaultValue: 'Search media' })}
          >
            <Icon name="search" size={16} />
          </button>
          
          {searchExpanded && (
            <div className="admin-search-dropdown">
              <div className="admin-search-dropdown__content">
                <input
                  type="text"
                  placeholder={t('admin:searchMediaPlaceholder', { defaultValue: 'Search media...' })}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="admin-search-dropdown__input"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchExpanded(false);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="admin-media-controls__section admin-media-controls__filters">
          <MediaViewToggle 
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
          
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value, 10))}
            className="admin-media-controls__select"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="admin-media-controls__section admin-media-controls__actions">
        <button
          className="admin-button admin-button--primary"
          onClick={onUploadClick}
        >
          <Icon name="upload" size={16} />
          {t('admin:uploadMedia', { defaultValue: 'Upload' })}
        </button>
      </div>
    </div>
  );
};

export default MediaControlBar;
