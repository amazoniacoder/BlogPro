import React, { useState, useEffect } from 'react';
import { MenuEditor } from '../../../../admin/pages/site-editor/components/MenuEditor';
import { FooterEditorEmbedded } from '../footer-editor/FooterEditorEmbedded';
import '../categories.css';

type TabType = 'menu' | 'footer';

export const WebsiteEditorTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('menu');

  // URL-based tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['menu', 'footer'].includes(tab)) {
      setActiveTab(tab as TabType);
    }
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  const handleAddClick = () => {
    if (activeTab === 'menu') {
      // Trigger menu item creation
      const event = new CustomEvent('createMenuItem');
      window.dispatchEvent(event);
    } else if (activeTab === 'footer') {
      // Trigger footer block creation
      const event = new CustomEvent('createFooterBlock');
      window.dispatchEvent(event);
    }
  };

  const tabs = [
    { id: 'menu' as TabType, label: 'Меню', icon: 'hamburger' },
    { id: 'footer' as TabType, label: 'Футер', icon: 'layout' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'menu':
        return <MenuEditor />;
      case 'footer':
        return <FooterEditorEmbedded />;
      default:
        return null;
    }
  };

  return (
    <div className="website-editor-tabs">
      <div className="website-editor-tabs__header">
        <div className="website-editor-tabs__tab-group">
          <nav className="website-editor-tabs__nav" role="tablist" aria-label="Site editor tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                className={`website-editor-tabs__tab ${
                  activeTab === tab.id ? 'website-editor-tabs__tab--active' : ''
                }`}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' && index > 0) {
                    e.preventDefault();
                    handleTabChange(tabs[index - 1].id);
                  } else if (e.key === 'ArrowRight' && index < tabs.length - 1) {
                    e.preventDefault();
                    handleTabChange(tabs[index + 1].id);
                  }
                }}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <span className="website-editor-tabs__tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="website-editor-tabs__actions">
          <button 
            className="admin-button admin-button--primary"
            onClick={handleAddClick}
          >
            {activeTab === 'menu' ? 'Add Menu Item' : 'Add Footer Block'}
          </button>
        </div>
      </div>

      <div className="website-editor-tabs__content">
        {renderTabContent()}
      </div>
    </div>
  );
};
