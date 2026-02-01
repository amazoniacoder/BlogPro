import React from 'react';
import { Button } from '../button';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface AdminTabsProps {
  items: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
  items,
  activeTab,
  onTabChange
}) => {
  const [currentTab, setCurrentTab] = React.useState(activeTab || items[0]?.id);

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    onTabChange?.(tabId);
  };

  const activeTabContent = items.find(item => item.id === currentTab)?.content;

  return (
    <div className="admin-tabs">
      <div className="admin-tabs__header">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={currentTab === item.id ? 'primary' : 'secondary'}
            onClick={() => handleTabChange(item.id)}
            className="admin-tabs__tab"
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </div>
      <div className="admin-tabs__content">
        {activeTabContent}
      </div>
    </div>
  );
};