import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';

interface SiteEditorControlBarProps {
  onAddMenuItem: () => void;
  loading?: boolean;
}

const SiteEditorControlBar: React.FC<SiteEditorControlBarProps> = ({
  onAddMenuItem,
  loading = false
}) => {
  const { t } = useTranslation(['admin', 'common']);

  return (
    <div className="site-editor-controls">
      <div className="site-editor-controls__actions">
        <button
          className="admin-button admin-button--primary"
          onClick={onAddMenuItem}
          disabled={loading}
        >
          <Icon name="add" size={16} />
          <span className="site-editor-controls__button-text">{t('admin:addMenuItem', { defaultValue: 'Add Menu Item' })}</span>
        </button>
      </div>
    </div>
  );
};

export default SiteEditorControlBar;
