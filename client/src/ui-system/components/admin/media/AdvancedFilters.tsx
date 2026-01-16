import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';

interface AdvancedFiltersProps {
  filters: {
    search: string;
    type: string;
    category: string;
    dateFrom?: string;
    dateTo?: string;
    sizeMin?: number;
    sizeMax?: number;
  };
  onFilterChange: (field: string, value: any) => void;
  onReset: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  onReset
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  return (
    <div className="admin-advanced-filters">
      <button
        className="admin-advanced-filters__toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Icon name={isExpanded ? "arrow-up" : "arrow-down"} size={16} />
        {t('admin:advancedFilters', { defaultValue: 'Advanced Filters' })}
      </button>

      {isExpanded && (
        <div className="admin-advanced-filters__content">
          <div className="admin-advanced-filters__row">
            <div className="admin-filters__group">
              <label className="admin-filters__label">
                {t('admin:dateFrom', { defaultValue: 'Date From' })}:
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                className="admin-filters__input"
              />
            </div>

            <div className="admin-filters__group">
              <label className="admin-filters__label">
                {t('admin:dateTo', { defaultValue: 'Date To' })}:
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => onFilterChange('dateTo', e.target.value)}
                className="admin-filters__input"
              />
            </div>
          </div>

          <div className="admin-advanced-filters__row">
            <div className="admin-filters__group">
              <label className="admin-filters__label">
                {t('admin:minSize', { defaultValue: 'Min Size' })}:
              </label>
              <select
                value={filters.sizeMin || ''}
                onChange={(e) => onFilterChange('sizeMin', e.target.value ? parseInt(e.target.value) : undefined)}
                className="admin-filters__select"
              >
                <option value="">{t('admin:any', { defaultValue: 'Any' })}</option>
                <option value="1024">{formatFileSize(1024)}</option>
                <option value="102400">{formatFileSize(102400)}</option>
                <option value="1048576">{formatFileSize(1048576)}</option>
                <option value="5242880">{formatFileSize(5242880)}</option>
              </select>
            </div>

            <div className="admin-filters__group">
              <label className="admin-filters__label">
                {t('admin:maxSize', { defaultValue: 'Max Size' })}:
              </label>
              <select
                value={filters.sizeMax || ''}
                onChange={(e) => onFilterChange('sizeMax', e.target.value ? parseInt(e.target.value) : undefined)}
                className="admin-filters__select"
              >
                <option value="">{t('admin:any', { defaultValue: 'Any' })}</option>
                <option value="1048576">{formatFileSize(1048576)}</option>
                <option value="5242880">{formatFileSize(5242880)}</option>
                <option value="10485760">{formatFileSize(10485760)}</option>
                <option value="52428800">{formatFileSize(52428800)}</option>
              </select>
            </div>
          </div>

          <div className="admin-advanced-filters__actions">
            <button
              className="admin-button admin-button--secondary admin-button--small"
              onClick={onReset}
            >
              {t('admin:resetFilters', { defaultValue: 'Reset Filters' })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
