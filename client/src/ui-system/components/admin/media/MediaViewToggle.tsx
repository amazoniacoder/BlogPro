import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';

type ViewMode = 'grid' | 'table';

interface MediaViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const MediaViewToggle: React.FC<MediaViewToggleProps> = ({
  viewMode,
  onViewModeChange
}) => {
  const { t } = useTranslation(['admin']);

  return (
    <div className="admin-view-toggle">
      <button
        className={`admin-view-toggle__button ${viewMode === 'grid' ? 'admin-view-toggle__button--active' : ''}`}
        onClick={() => onViewModeChange('grid')}
        aria-label={t('admin:gridView', { defaultValue: 'Grid view' })}
        title={t('admin:gridView', { defaultValue: 'Grid view' })}
      >
        <Icon name="grid" size={16} />
      </button>
      <button
        className={`admin-view-toggle__button ${viewMode === 'table' ? 'admin-view-toggle__button--active' : ''}`}
        onClick={() => onViewModeChange('table')}
        aria-label={t('admin:tableView', { defaultValue: 'Table view' })}
        title={t('admin:tableView', { defaultValue: 'Table view' })}
      >
        <Icon name="table" size={16} />
      </button>
    </div>
  );
};

export default MediaViewToggle;
