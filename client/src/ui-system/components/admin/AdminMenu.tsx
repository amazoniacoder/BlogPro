/**
 * BlogPro Admin Menu Component
 * Universal admin navigation menu
 */

import React from 'react';
import { Icon, IconName } from '../../icons/components';
import { Text, Badge } from '../index';

export interface AdminMenuItemProps {
  id: string;
  label: string;
  icon: IconName;
  href?: string;
  onClick?: () => void;
  badge?: string;
  active?: boolean;
  disabled?: boolean;
}

export interface AdminMenuProps {
  items: AdminMenuItemProps[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'tabs';
  className?: string;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({
  items,
  orientation = 'horizontal',
  variant = 'default',
  className = ''
}) => {
  const menuClasses = [
    'admin-menu',
    `admin-menu--${orientation}`,
    `admin-menu--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <nav className={menuClasses}>
      {items.map((item) => {
        const itemClasses = [
          'admin-menu__item',
          item.active && 'admin-menu__item--active',
          item.disabled && 'admin-menu__item--disabled'
        ].filter(Boolean).join(' ');

        return (
          <button
            key={item.id}
            className={`${itemClasses} p-2`}
            onClick={item.onClick}
            disabled={item.disabled}
          >
            <Icon name={item.icon} size={16} className="admin-menu__icon" />
            <Text size="sm" className="admin-menu__label">
              {item.label}
            </Text>
            {item.badge && (
              <Badge size="sm" variant="primary" className="admin-menu__badge">
                {item.badge}
              </Badge>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default AdminMenu;
