import React, { useEffect, useState } from 'react';

interface SettingsContentProps {
  activeTab: string;
  children: React.ReactNode;
}

const SettingsContent: React.FC<SettingsContentProps> = ({
  activeTab,
  children
}) => {
  const [previousTab, setPreviousTab] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (previousTab && previousTab !== activeTab) {
      setIsTransitioning(true);
      
      // Reset transition state after animation completes
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
      
      return () => clearTimeout(timer);
    }
    setPreviousTab(activeTab);
  }, [activeTab, previousTab]);

  return (
    <div className={`settings-content ${isTransitioning ? 'settings-content--transitioning' : ''}`}>
      {children}
    </div>
  );
};

export default SettingsContent;
