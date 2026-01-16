import React from 'react';
import { Icon } from '@/ui-system/icons/components';
import type { IconName } from '@/ui-system/icons/components';

export interface AdminTab {
  id: string;
  label: string;
  icon?: IconName;
}

export interface AdminTabBarProps {
  tabs: AdminTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  hasUnsavedChanges?: boolean;
  className?: string;
}

export const AdminTabBar: React.FC<AdminTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  hasUnsavedChanges = false,
  className = ''
}) => {
  return (
    <div className={`admin-tab-bar ${className}`}>
      <div className="admin-tab-bar__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab-bar__tab ${
              activeTab === tab.id ? 'admin-tab-bar__tab--active' : ''
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && (
              <Icon 
                name={tab.icon} 
                className={`admin-tab-bar__tab-icon ${
                  activeTab === tab.id ? 'admin-tab-bar__tab-icon--active' : ''
                }`}
              />
            )}
            <span className="admin-tab-bar__tab-label">{tab.label}</span>
            {hasUnsavedChanges && activeTab === tab.id && (
              <span className="admin-tab-bar__tab-badge" />
            )}
          </button>
        ))}
      </div>
      <div className="admin-tab-bar__indicator" />
    </div>
  );
};

export default AdminTabBar;