import React, { useState } from 'react';
import { Button } from '../button';
import { Icon } from '../../icons/components';
import './documentation-layout.css';

interface DocumentationLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export const DocumentationLayout: React.FC<DocumentationLayoutProps> = ({
  sidebar,
  children,
  breadcrumbs,
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`documentation-layout ${className}`}>
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        className="documentation-layout__mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Icon name="hamburger" size={20} />
      </Button>

      <div className="documentation-layout__container">
        {/* Sidebar */}
        <aside className={`documentation-layout__sidebar ${sidebarOpen ? 'documentation-layout__sidebar--open' : ''}`}>
          {sidebar}
        </aside>

        {/* Main content */}
        <main className="documentation-layout__main">
          {breadcrumbs && (
            <div className="documentation-layout__breadcrumbs">
              {breadcrumbs}
            </div>
          )}
          <div className="documentation-layout__content">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="documentation-layout__overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
