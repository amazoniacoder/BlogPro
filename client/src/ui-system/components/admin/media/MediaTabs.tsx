import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '@/ui-system/icons/components';

type MediaCategory = 'images' | 'documents' | 'videos' | 'audio' | 'editor';

interface MediaTabsProps {
  activeTab: MediaCategory;
  onTabChange: (tab: MediaCategory) => void;
  counts?: Record<MediaCategory, number>;
}

const MediaTabs: React.FC<MediaTabsProps> = ({ activeTab, onTabChange, counts }) => {
  const { t } = useTranslation(['admin', 'common']);

  const tabs: Array<{ key: MediaCategory; label: string; icon: IconName }> = [
    { key: 'images', label: t('admin:images', { defaultValue: 'Images' }), icon: 'image' },
    { key: 'documents', label: t('admin:documents', { defaultValue: 'Documents' }), icon: 'file' },
    { key: 'videos', label: t('admin:videos', { defaultValue: 'Videos' }), icon: 'video' },
    { key: 'audio', label: t('admin:audio', { defaultValue: 'Audio' }), icon: 'audio' },
    { key: 'editor', label: t('admin:editor', { defaultValue: 'Editor' }), icon: 'edit' },
  ];

  return (
    <div className="admin-media__tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`admin-media__tab ${activeTab === tab.key ? 'admin-media__tab--active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          <Icon name={tab.icon} size={16} className="admin-media__tab-icon" />
          <span className="admin-media__tab-label whitespace-nowrap">{tab.label}</span>
          {counts && counts[tab.key] > 0 && (
            <span className="admin-media__tab-count">{counts[tab.key]}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MediaTabs;
