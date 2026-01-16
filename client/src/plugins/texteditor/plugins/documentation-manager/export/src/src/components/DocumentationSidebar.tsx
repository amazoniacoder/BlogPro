/**
 * Documentation Sidebar Component
 */

import React from 'react';

interface DocumentationSidebarProps {
  sections: any[];
  renderDynamicMenu: (items: any[]) => React.ReactNode;
  handleNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export const DocumentationSidebar: React.FC<DocumentationSidebarProps> = ({
  sections,
  renderDynamicMenu,
  handleNavClick
}) => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {sections.length > 0 ? (
          sections.map(section => (
            <div key={section.id}>
              <h3 className="sidebar-nav__title">{section.name}</h3>
              <ul className="sidebar-nav__list">
                {renderDynamicMenu(section.children || [])}
              </ul>
            </div>
          ))
        ) : (
          <div>
            <h3 className="sidebar-nav__title">Документация</h3>
            <ul className="sidebar-nav__list">
              <li><a href="#overview" className="sidebar-nav__link sidebar-nav__link--active" onClick={(e) => handleNavClick(e, '#overview')}>Обзор</a></li>
              <li><a href="#features" className="sidebar-nav__link" onClick={(e) => handleNavClick(e, '#features')}>Ключевые функции</a></li>
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
};
