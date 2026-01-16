/**
 * Admin Header Component
 * Header with library switcher and view controls
 * Max 150 lines - strict TypeScript compliance
 */

import React from 'react';
import { LibraryType, AdminView, UserRole } from '../../types/SharedTypes';

interface AdminHeaderProps {
  readonly activeLibrary: LibraryType;
  readonly activeView: AdminView;
  readonly userRole: UserRole;
  readonly canManage: boolean;
  readonly onLibrarySwitch: (library: LibraryType) => void;
  readonly onViewSwitch: (view: AdminView) => void;
}

/**
 * Admin header with navigation and controls
 */
export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeLibrary,
  activeView,
  userRole,
  canManage,
  onLibrarySwitch,
  onViewSwitch
}) => {
  const getLibraryIcon = (library: LibraryType): string => {
    return library === 'texteditor' ? '📝' : '🌐';
  };

  const getLibraryName = (library: LibraryType): string => {
    return library === 'texteditor' ? 'Text Editor' : 'Website';
  };

  return (
    <header className="admin-header">
      <div className="admin-header__brand">
        <h1 className="admin-header__title">
          📚 Documentation Manager
        </h1>
        <span className="admin-header__role">({userRole})</span>
      </div>

      <div className="admin-header__controls">
        {/* Library Switcher */}
        <div className="library-switcher">
          <label className="library-switcher__label">Library:</label>
          <div className="library-switcher__buttons">
            <button
              className={`library-switcher__button ${activeLibrary === 'texteditor' ? 'library-switcher__button--active' : ''}`}
              onClick={() => onLibrarySwitch('texteditor')}
            >
              {getLibraryIcon('texteditor')} {getLibraryName('texteditor')}
            </button>
            <button
              className={`library-switcher__button ${activeLibrary === 'site' ? 'library-switcher__button--active' : ''}`}
              onClick={() => onLibrarySwitch('site')}
            >
              {getLibraryIcon('site')} {getLibraryName('site')}
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="view-switcher">
          <label className="view-switcher__label">View:</label>
          <div className="view-switcher__buttons">
            <button
              className={`view-switcher__button ${activeView === 'content' ? 'view-switcher__button--active' : ''}`}
              onClick={() => onViewSwitch('content')}
            >
              📝 Content
            </button>
            
            {canManage && (
              <button
                className={`view-switcher__button ${activeView === 'sections' ? 'view-switcher__button--active' : ''}`}
                onClick={() => onViewSwitch('sections')}
              >
                🗂️ Sections
              </button>
            )}
            
            <button
              className={`view-switcher__button ${activeView === 'versions' ? 'view-switcher__button--active' : ''}`}
              onClick={() => onViewSwitch('versions')}
            >
              📋 Versions
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-header__actions">
          <a
            href={`/plugins/texteditor/documentation-${activeLibrary}`}
            target="_blank"
            className="admin-header__action"
            title="View library page"
          >
            👁️ View
          </a>
          
          <button
            className="admin-header__action"
            onClick={() => window.location.reload()}
            title="Refresh"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
