/**
 * Documentation Header Component
 */

import React from 'react';

interface DocumentationHeaderProps {
  userRole?: string;
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  toggleSearch: () => void;
  openExportModal: (contentId: string, title: string) => void;
  openAdminPanel: (panel: 'content' | 'sections' | 'menu' | 'files' | 'converter' | 'search') => void;
  handleNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export const DocumentationHeader: React.FC<DocumentationHeaderProps> = ({
  userRole,
  isAdminMode,
  setIsAdminMode,
  toggleSearch,
  openExportModal,
  openAdminPanel,
  handleNavClick
}) => {
  return (
    <header className="header">
      <a href="#" className="header__logo">BlogPro Редактор</a>
      <nav className="header__nav">
        <ul className="nav">
          <li className="nav__item">
            <a href="#architecture" className="nav__link" onClick={(e) => handleNavClick(e, '#architecture')}>Архитектура</a>
          </li>
          <li className="nav__item">
            <a href="#service-factory" className="nav__link" onClick={(e) => handleNavClick(e, '#service-factory')}>Сервисы</a>
          </li>
          <li className="nav__item">
            <a href="#zero-dictionary" className="nav__link" onClick={(e) => handleNavClick(e, '#zero-dictionary')}>Zero-Dictionary</a>
          </li>
          <li className="nav__item">
            <a href="#api-reference" className="nav__link" onClick={(e) => handleNavClick(e, '#api-reference')}>API</a>
          </li>
        </ul>
      </nav>
      
      <button className="search-toggle" aria-label="Открыть поиск" onClick={toggleSearch}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </button>
      
      {/* Admin Controls */}
      {userRole === 'admin' && (
        <div className="admin-controls">
          <button 
            className={`admin-toggle ${isAdminMode ? 'active' : ''}`}
            onClick={() => setIsAdminMode(!isAdminMode)}
            title={isAdminMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
          >
            {isAdminMode ? '👁️ View' : '<Icon name="edit" size={16} /> Edit'}
          </button>
          
          {isAdminMode && (
            <div className="admin-actions">
              <button 
                className="admin-panel-btn"
                onClick={() => openAdminPanel('content')}
                title="Content Management"
              >
                📄 Content
              </button>
              
              <button 
                className="admin-panel-btn"
                onClick={() => openAdminPanel('sections')}
                title="Sections Management"
              >
                📋 Sections
              </button>
              
              <button 
                className="admin-panel-btn"
                onClick={() => openAdminPanel('menu')}
                title="Menu Builder"
              >
                🔗 Menu
              </button>
              
              <button 
                className="export-all-btn"
                onClick={() => openExportModal('all', 'All Documentation')}
                title="Export All Documentation"
              >
                📥 Export
              </button>
            </div>
          )}
        </div>
      )}
      
      <button className="menu-toggle" aria-label="Переключить мобильное меню">☰</button>
    </header>
  );
};
