import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';
import type { IconName } from '@/ui-system/icons/components';

interface Tab {
  id: string;
  label: string;
  icon: IconName;
}

interface SettingsMobileNavProps {
  activeTab: string;
  tabs: Tab[];
  onTabChange: (tabId: string) => void;
  hasUnsavedChanges?: boolean;
}

const SettingsMobileNav: React.FC<SettingsMobileNavProps> = ({
  activeTab,
  tabs,
  onTabChange,
  hasUnsavedChanges = false
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [isOpen, setIsOpen] = useState(false);

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const handleTabSelect = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <div className="settings-mobile-nav">
      <button
        className="settings-mobile-nav__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="settings-mobile-nav__trigger-content">
          <Icon name={activeTabData?.icon || 'gear'} size={16} />
          <span className="settings-mobile-nav__trigger-label">
            {activeTabData?.label || t('admin:settings', { defaultValue: 'Settings' })}
          </span>
          {hasUnsavedChanges && (
            <div className="settings-mobile-nav__badge" />
          )}
        </div>
        <Icon 
          name="arrow-down" 
          size={16} 
          className={`settings-mobile-nav__chevron ${isOpen ? 'settings-mobile-nav__chevron--open' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="settings-mobile-nav__backdrop" 
            onClick={() => setIsOpen(false)}
          />
          <div className="settings-mobile-nav__menu">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`settings-mobile-nav__item ${
                  tab.id === activeTab ? 'settings-mobile-nav__item--active' : ''
                }`}
                onClick={() => handleTabSelect(tab.id)}
              >
                <Icon name={tab.icon} size={16} />
                <span className="settings-mobile-nav__item-label">{tab.label}</span>
                {tab.id === activeTab && (
                  <Icon name="check" size={14} className="settings-mobile-nav__check" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsMobileNav;
