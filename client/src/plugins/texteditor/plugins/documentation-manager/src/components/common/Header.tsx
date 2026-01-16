import { Icon } from '../../../../../../../ui-system/icons/components';
/**
 * Documentation Header Component
 * Professional header with navigation and admin controls
 * Max 200 lines - strict TypeScript compliance
 */

import React, { useState } from 'react';
import { LibraryType, UserRole } from '../../types/SharedTypes';

interface HeaderProps {
  readonly libraryType: LibraryType;
  readonly userRole: UserRole;
  readonly canEdit: boolean;
}

/**
 * Header component with library-specific branding and admin controls
 */
export const Header: React.FC<HeaderProps> = ({
  libraryType,
  userRole,
  canEdit
}) => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  const getLibraryTitle = (): string => {
    return libraryType === 'texteditor' 
      ? 'BlogPro Text Editor Documentation'
      : 'BlogPro Website Documentation';
  };

  const getLibraryIcon = (): string => {
    return libraryType === 'texteditor' ? '📝' : '🌐';
  };

  const handleAdminToggle = (): void => {
    setIsAdminMode(!isAdminMode);
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('adminModeToggle', { 
      detail: { isAdminMode: !isAdminMode } 
    }));
  };

  const openAdminPanel = (): void => {
    window.open('/plugins/texteditor/documentation-manager', '_blank');
  };

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__icon">{getLibraryIcon()}</span>
        <h1 className="header__title">{getLibraryTitle()}</h1>
      </div>

      <nav className="header__nav">
        <ul className="nav">
          <li className="nav__item">
            <a 
              href="/plugins/texteditor/documentation-texteditor" 
              className={`nav__link ${libraryType === 'texteditor' ? 'nav__link--active' : ''}`}
            >
              Text Editor
            </a>
          </li>
          <li className="nav__item">
            <a 
              href="/plugins/texteditor/documentation-site" 
              className={`nav__link ${libraryType === 'site' ? 'nav__link--active' : ''}`}
            >
              Website
            </a>
          </li>
        </ul>
      </nav>

      <div className="header__controls">
        <button 
          className="search-toggle" 
          aria-label="Open search"
          onClick={() => window.dispatchEvent(new CustomEvent('toggleSearch'))}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>

        {canEdit && (
          <>
            <button
              className={`admin-toggle ${isAdminMode ? 'admin-toggle--active' : ''}`}
              onClick={handleAdminToggle}
              title="Toggle admin mode"
            >
              {isAdminMode ? '🔓' : '🔒'} Admin
            </button>
            
            <button
              className="admin-panel-btn"
              onClick={openAdminPanel}
              title="Open admin panel"
            >
              <Icon name="gear" size={16} /> Panel
            </button>
          </>
        )}

        {userRole && (
          <div className="header__user">
            <span className="user-role user-role--{userRole}">{userRole}</span>
          </div>
        )}

        <button className="menu-toggle" aria-label="Toggle mobile menu">
          ☰
        </button>
      </div>
    </header>
  );
};

export default Header;
