/**
 * SupportEditor Layout Component
 * Professional documentation layout with header, sidebar, and content areas
 * Max 250 lines - strict TypeScript compliance
 */

import React from 'react';
import { LibraryType, Section } from '../../types/SharedTypes';
import { useUserRole } from '../../hooks/useUserRole';
import { useLibraryContent } from '../../hooks/useLibraryContent';
import { Header } from '../common/Header';
import { Sidebar } from '../common/Sidebar';
import { SearchPanel } from '../common/SearchPanel';

interface SupportEditorLayoutProps {
  readonly libraryType: LibraryType;
  readonly children: React.ReactNode;
  readonly className?: string;
}

/**
 * Main layout component following SupportEditor design patterns
 * Provides consistent structure across all library pages
 */
export const SupportEditorLayout: React.FC<SupportEditorLayoutProps> = ({
  libraryType,
  children,
  className = ''
}) => {
  const { userRole, canEdit } = useUserRole();
  const { sections, loading } = useLibraryContent(libraryType);

  const layoutClasses = [
    'documentation',
    `documentation-library--${libraryType}`,
    className
  ].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className={layoutClasses}>
        <div className="documentation__loading">
          <span className="loading-spinner">⏳</span>
          <p>Loading documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={layoutClasses}>
      <Header 
        libraryType={libraryType} 
        userRole={userRole}
        canEdit={canEdit} 
      />
      
      <SearchPanel libraryType={libraryType} />
      
      <main className="main">
        <Sidebar 
          sections={sections.map(s => ({
            ...s,
            orderIndex: s.order_index,
            isActive: s.is_active,
            libraryType: s.library_type || libraryType
          } as Section))}
          libraryType={libraryType}
        />
        
        <article className="content">
          {children}
        </article>
      </main>
    </div>
  );
};

export default SupportEditorLayout;
