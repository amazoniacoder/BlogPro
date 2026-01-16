import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '@/ui-system/icons/components';
import SettingsMobileNav from './SettingsMobileNav';

interface Tab {
  id: string;
  label: string;
  icon: IconName;
  badge?: boolean;
  disabled?: boolean;
}

interface SettingsTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Tab[];
  hasUnsavedChanges?: boolean;
  onBeforeTabChange?: (fromTab: string, toTab: string) => Promise<boolean> | boolean;
}

const SettingsTabBar: React.FC<SettingsTabBarProps> = ({
  activeTab,
  onTabChange,
  tabs,
  hasUnsavedChanges = false,
  onBeforeTabChange
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const updateIndicator = useCallback(() => {
    if (!indicatorRef.current || !tabsRef.current) return;

    const activeTabElement = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
      indicatorRef.current.style.width = `${offsetWidth}px`;
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    
    // Update indicator on window resize
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateIndicator]);

  const handleTabChange = useCallback(async (newTabId: string) => {
    if (newTabId === activeTab || isAnimating) return;
    
    const tab = tabs.find(t => t.id === newTabId);
    if (tab?.disabled) return;

    if (onBeforeTabChange) {
      const canChange = await onBeforeTabChange(activeTab, newTabId);
      if (!canChange) return;
    }

    setIsAnimating(true);
    onTabChange(newTabId);
    
    // Reset animation state after transition
    setTimeout(() => setIsAnimating(false), 300);
  }, [activeTab, isAnimating, tabs, onBeforeTabChange, onTabChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, tabId: string) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabChange(tabId);
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        e.preventDefault();
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        const direction = e.key === 'ArrowLeft' ? -1 : 1;
        const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
        const nextTab = tabs[nextIndex];
        if (!nextTab.disabled) {
          handleTabChange(nextTab.id);
        }
        break;
    }
  }, [tabs, activeTab, handleTabChange]);

  return (
    <>
      {/* Mobile Navigation */}
      <SettingsMobileNav
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={handleTabChange}
        hasUnsavedChanges={hasUnsavedChanges}
      />
      
      {/* Desktop Tab Bar */}
      <div className="settings-tab-bar scrollbar-hidden">
        <div className="settings-tab-bar__tabs" ref={tabsRef}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const showBadge = tab.badge || (hasUnsavedChanges && isActive);
          
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              className={`settings-tab-bar__tab ${
                isActive ? 'settings-tab-bar__tab--active' : ''
              } ${
                tab.disabled ? 'settings-tab-bar__tab--disabled' : ''
              } ${
                isAnimating ? 'settings-tab-bar__tab--animating' : ''
              }`}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              disabled={tab.disabled}
              role="tab"
              aria-selected={isActive}
              aria-disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              title={tab.disabled ? t('admin:tabDisabled', { defaultValue: 'Tab disabled' }) : undefined}
            >
              <Icon 
                name={tab.icon} 
                size={16} 
                className={`settings-tab-bar__tab-icon ${
                  isActive ? 'settings-tab-bar__tab-icon--active' : ''
                }`} 
              />
              <span className="settings-tab-bar__tab-label">{tab.label}</span>
              {showBadge && (
                <span 
                  className={`settings-tab-bar__tab-badge ${
                    hasUnsavedChanges && isActive ? 'settings-tab-bar__tab-badge--warning' : ''
                  }`} 
                />
              )}
            </button>
          );
        })}
      </div>
      <div 
        ref={indicatorRef}
        className={`settings-tab-bar__indicator ${
          isAnimating ? 'settings-tab-bar__indicator--sliding' : ''
        }`}
      />
      </div>
    </>
  );
};

export default SettingsTabBar;
