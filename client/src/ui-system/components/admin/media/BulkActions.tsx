import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';

interface BulkActionsProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  totalCount: number;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  totalCount
}) => {
  const { t } = useTranslation(['admin', 'common']);

  if (selectedCount === 0) return null;

  return (
    <div className="admin-bulk-actions">
      <div className="admin-bulk-actions__info">
        <span className="admin-bulk-actions__count">
          {t('admin:selectedItems', { count: selectedCount, defaultValue: '{{count}} selected' })}
        </span>
      </div>
      
      <div className="admin-bulk-actions__controls">
        <button
          className="admin-button admin-button--secondary admin-button--small"
          onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
        >
          <Icon name={selectedCount === totalCount ? "circle" : "check"} size={16} />
          {selectedCount === totalCount 
            ? t('admin:deselectAll', { defaultValue: 'Deselect All' })
            : t('admin:selectAll', { defaultValue: 'Select All' })
          }
        </button>
        
        <button
          className="admin-button admin-button--danger admin-button--small"
          onClick={onBulkDelete}
        >
          <Icon name="delete" size={16} />
          {t('admin:deleteSelected', { defaultValue: 'Delete Selected' })}
        </button>
      </div>
    </div>
  );
};

export default BulkActions;
