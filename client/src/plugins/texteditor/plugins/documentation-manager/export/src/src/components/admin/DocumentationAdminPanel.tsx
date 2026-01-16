/**
 * Documentation Admin Panel
 * 
 * Main admin interface for documentation management.
 */

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { SectionsManager } from './SectionsManager';
import { ContentManager } from './ContentManager';
import { MenuBuilder } from './MenuBuilder';
import { FileManager } from './FileManager';
import { DocumentConverter } from './DocumentConverter';
import { SearchManager } from './SearchManager';

export type AdminView = 'content' | 'sections' | 'menu' | 'files' | 'converter' | 'search';

interface DocumentationAdminPanelProps {
  activeView?: AdminView;
  onClose?: () => void;
  onMenuUpdate?: () => void;
}

export const DocumentationAdminPanel: React.FC<DocumentationAdminPanelProps> = ({
  activeView: initialView = 'content',
  onMenuUpdate
}) => {
  const [activeView, setActiveView] = useState<AdminView>(initialView);

  // Update active view when prop changes
  React.useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'content':
        return (
          <ContentManager 
            libraryType="texteditor"
            textEditor={<div>Text Editor Placeholder</div>}
          />
        );
      case 'sections':
        return <SectionsManager />;
      case 'menu':
        return <MenuBuilder onMenuUpdate={onMenuUpdate} />;
      case 'files':
        return <FileManager />;
      case 'converter':
        return <DocumentConverter />;
      case 'search':
        return <SearchManager />;
      default:
        return (
          <ContentManager 
            libraryType="texteditor"
            textEditor={<div>Text Editor Placeholder</div>}
          />
        );
    }
  };

  return (
    <div className="doc-admin-panel">
      <AdminSidebar 
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <main className="admin-content">
        {renderActiveView()}
      </main>
    </div>
  );
};
