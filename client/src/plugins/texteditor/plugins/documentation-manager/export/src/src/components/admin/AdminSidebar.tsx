/**
 * Admin Sidebar Navigation
 * 
 * Navigation component for admin panel sections.
 */

import React from 'react';
import { AdminView } from './DocumentationAdminPanel';

interface AdminSidebarProps {
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
}

interface NavItem {
  id: AdminView;
  icon: string;
  label: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'content',
    icon: '📝',
    label: 'Content',
    description: 'Manage documentation content'
  },
  {
    id: 'sections',
    icon: '📁',
    label: 'Sections',
    description: 'Organize content sections'
  },
  {
    id: 'menu',
    icon: '🗂️',
    label: 'Menu',
    description: 'Build navigation menu'
  },
  {
    id: 'files',
    icon: '📂',
    label: 'Files',
    description: 'File system integration'
  },
  {
    id: 'converter',
    icon: '🔄',
    label: 'Converter',
    description: 'Document format conversion'
  },
  {
    id: 'search',
    icon: '🔍',
    label: 'Search',
    description: 'Search management'
  }
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeView,
  onViewChange
}) => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__header">
        <h2>📚 Documentation Admin</h2>
      </div>
      
      <nav className="admin-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`admin-nav__item ${activeView === item.id ? 'admin-nav__item--active' : ''}`}
            onClick={() => onViewChange(item.id)}
            title={item.description}
          >
            <span className="admin-nav__icon">{item.icon}</span>
            <span className="admin-nav__label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="admin-sidebar__footer">
        <div className="admin-status">
          <div className="status-indicator status-indicator--online"></div>
          <span>System Online</span>
        </div>
      </div>
    </aside>
  );
};
