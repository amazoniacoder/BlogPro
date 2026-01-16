/**
 * BlogPro Admin Sidebar Component
 * Universal admin navigation sidebar
 */

import React from 'react';
import { Icon, IconName } from '../../icons/components';
import { Text, Badge } from '../index';

export interface AdminMenuItem {
  id: string;
  label: string;
  icon: IconName;
  href?: string;
  onClick?: () => void;
  badge?: string;
  active?: boolean;
  children?: AdminMenuItem[];
}

export interface AdminSidebarProps {
  items: AdminMenuItem[];
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  items,
  collapsed = false,
  onToggle,
  className = ''
}) => {
  const sidebarClasses = [
    'admin-sidebar',
    collapsed && 'admin-sidebar--collapsed',
    className
  ].filter(Boolean).join(' ');

  const renderMenuItem = (item: AdminMenuItem, level = 0) => {
    const itemClasses = [
      'admin-sidebar__item',
      item.active && 'admin-sidebar__item--active',
      level > 0 && 'admin-sidebar__item--nested'
    ].filter(Boolean).join(' ');

    const handleItemClick = () => {
      if (item.onClick) {
        item.onClick();
      }
      // Close sidebar on mobile after clicking menu item
      if (onToggle) {
        onToggle();
      }
    };

    return (
      <div key={item.id} className={itemClasses}>
        <button
          className="admin-sidebar__link bg-none"
          onClick={handleItemClick}
        >
          <Icon name={item.icon} size={20} className="admin-sidebar__icon" />
          {!collapsed && (
            <>
              <Text className="admin-sidebar__label">{item.label}</Text>
              {item.badge && (
                <Badge size="sm" variant="primary" className="admin-sidebar__badge">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </button>
        
        {!collapsed && item.children && (
          <div className="admin-sidebar__submenu">
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={sidebarClasses}>
      <div className="admin-sidebar__header">
        <div className="admin-sidebar__logo">
          {!collapsed && <Text weight="bold">BlogPro Admin</Text>}
        </div>
        {onToggle && (
          <button
            className="admin-sidebar__toggle p-2"
            onClick={onToggle}
          >
            <Icon name={collapsed ? 'hamburger' : 'arrow-left'} size={20} />
          </button>
        )}
      </div>
      
      <nav className="admin-sidebar__nav">
        {items.map(item => renderMenuItem(item))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
