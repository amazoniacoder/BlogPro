import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';

interface SiteEditorActionsProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

const SiteEditorActions: React.FC<SiteEditorActionsProps> = ({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete,
  onClearSelection
}) => {
  const { t } = useTranslation(['admin', 'common']);

  if (selectedCount === 0) return null;

  return (
    <div className="site-editor-actions">
      <div className="site-editor-actions__info">
        <Icon name="check" size={16} />
        {t('admin:selectedItems', { 
          count: selectedCount, 
          defaultValue: '{{count}} items selected' 
        })}
      </div>
      
      <div className="site-editor-actions__controls">
        <button
          className="site-editor-actions__button site-editor-actions__button--activate"
          onClick={onActivate}
          title={t('admin:activateSelected', { defaultValue: 'Activate selected' })}
        >
          <Icon name="check" size={16} />
          {t('admin:activate', { defaultValue: 'Activate' })}
        </button>

        <button
          className="site-editor-actions__button site-editor-actions__button--deactivate"
          onClick={onDeactivate}
          title={t('admin:deactivateSelected', { defaultValue: 'Deactivate selected' })}
        >
          <Icon name="x" size={16} />
          {t('admin:deactivate', { defaultValue: 'Deactivate' })}
        </button>

        <button
          className="site-editor-actions__button site-editor-actions__button--delete"
          onClick={onDelete}
          title={t('admin:deleteSelected', { defaultValue: 'Delete selected' })}
        >
          <Icon name="delete" size={16} />
          {t('admin:delete', { defaultValue: 'Delete' })}
        </button>

        <button
          className="site-editor-actions__button site-editor-actions__button--clear"
          onClick={onClearSelection}
          title={t('admin:clearSelection', { defaultValue: 'Clear selection' })}
        >
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
};

export default SiteEditorActions;
