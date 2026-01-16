/**
 * Documentation Sidebar Component
 * Dynamic navigation sidebar with hierarchical sections
 * Max 200 lines - strict TypeScript compliance
 */

import React from 'react';
import { Section, LibraryType } from '../../types/SharedTypes';

interface SidebarProps {
  readonly sections: Section[];
  readonly libraryType: LibraryType;
}

/**
 * Sidebar navigation component with hierarchical section display
 */
export const Sidebar: React.FC<SidebarProps> = ({
  sections,
  libraryType
}) => {
  /**
   * Handle navigation click with smooth scrolling
   */
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string): void => {
    e.preventDefault();
    
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Update active link
      document.querySelectorAll('.sidebar-nav__link').forEach(link => {
        link.classList.remove('sidebar-nav__link--active');
      });
      e.currentTarget.classList.add('sidebar-nav__link--active');
    }
  };

  /**
   * Render hierarchical menu items recursively
   */
  const renderMenuItems = (items: Section[], level: number = 0): React.ReactNode => {
    if (!items || items.length === 0) return null;

    return items.map(item => (
      <li key={item.id} className={`sidebar-nav__item sidebar-nav__item--level-${level}`}>
        <a 
          href={`#${item.slug}`}
          className="sidebar-nav__link"
          onClick={(e) => handleNavClick(e, `#${item.slug}`)}
        >
          {item.icon && <span className="sidebar-nav__icon">{item.icon}</span>}
          <span className="sidebar-nav__text">{item.name}</span>
        </a>
        
        {item.children && item.children.length > 0 && (
          <ul className="sidebar-nav__sublist">
            {renderMenuItems(item.children, level + 1)}
          </ul>
        )}
      </li>
    ));
  };

  /**
   * Get fallback sections when database is empty
   */
  const getFallbackSections = (): Section[] => {
    const baseSection: Omit<Section, 'id' | 'name' | 'slug' | 'icon'> = {
      description: '',
      level: 0,
      orderIndex: 0,
      isActive: true,
      libraryType
    };

    if (libraryType === 'texteditor') {
      return [
        { ...baseSection, id: '1', name: 'Getting Started', slug: 'getting-started', icon: '🚀' },
        { ...baseSection, id: '2', name: 'API Reference', slug: 'api-reference', icon: '📚' },
        { ...baseSection, id: '3', name: 'Examples', slug: 'examples', icon: '💡' }
      ];
    }

    return [
      { ...baseSection, id: '1', name: 'User Guide', slug: 'user-guide', icon: '<Icon name="book" size={16} />' },
      { ...baseSection, id: '2', name: 'Features', slug: 'features', icon: '✨' },
      { ...baseSection, id: '3', name: 'Support', slug: 'support', icon: '🆘' }
    ];
  };

  const displaySections = sections.length > 0 ? sections : getFallbackSections();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <h3 className="sidebar-nav__title">
          {libraryType === 'texteditor' ? 'Text Editor Docs' : 'Website Docs'}
        </h3>
        
        <ul className="sidebar-nav__list">
          {renderMenuItems(displaySections)}
        </ul>

        {sections.length === 0 && (
          <div className="sidebar-nav__notice">
            <p className="sidebar-nav__notice-text">
              📝 Content is being loaded from the database. 
              <br />
              <a href="/plugins/texteditor/documentation-manager">
                Create content in admin panel
              </a>
            </p>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
