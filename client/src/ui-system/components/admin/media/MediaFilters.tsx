import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MediaAction } from '@/admin/pages/media/state/types';

interface MediaFiltersProps {
  filters: {
    search: string;
    type: string;
    category: 'images' | 'documents' | 'videos' | 'audio' | 'editor';
  };
  dispatch: React.Dispatch<MediaAction>;
}

const MediaFilters: React.FC<MediaFiltersProps> = ({ filters, dispatch }) => {
  const { t } = useTranslation(['admin', 'common']);

  return (
    <div className="admin-filters">
      <div className="admin-filters__group">
        <label htmlFor="media-search" className="admin-filters__label">
          {t('common:search')}:
        </label>
        <input
          id="media-search"
          type="text"
          placeholder={t('admin:searchMediaPlaceholder', { defaultValue: 'Search media...' })}
          value={filters.search}
          onChange={(e) => dispatch({ type: 'SET_FILTER', field: 'search', value: e.target.value })}
          className="admin-filters__input"
        />
      </div>
    </div>
  );
};

export default React.memo(MediaFilters);
