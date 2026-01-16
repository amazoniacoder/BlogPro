/**
 * BlogPro Admin Header Component
 * Universal admin header with user menu and actions
 */

import React from 'react';
import { Heading, UserMenu, Button } from '../index';
import { Icon, IconName } from '../../icons/components';

export interface AdminUser {
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface AdminHeaderProps {
  title: string;
  user: AdminUser;
  onMenuToggle?: () => void;
  onLogout?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  user,
  onMenuToggle,
  onLogout,
  actions,
  className = ''
}) => {
  const userMenuItems: Array<{
    id: string;
    label: string;
    icon?: IconName;
    href?: string;
    onClick?: () => void;
    divider?: boolean;
  }> = [
    { id: 'profile', label: 'Profile', icon: 'user' as IconName, href: '/admin/profile' },
    { id: 'settings', label: 'Settings', icon: 'gear' as IconName, href: '/admin/settings' },
    { id: 'divider', label: '', divider: true },
    { id: 'logout', label: 'Logout', icon: 'arrow-right' as IconName, onClick: onLogout }
  ];

  return (
    <header className={`admin-header ${className}`}>
      <div className="admin-header__left">
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="admin-header__menu-toggle"
          >
            <Icon name="hamburger" size={20} />
          </Button>
        )}
        
        <Heading level={1} className="admin-header__title">
          {title}
        </Heading>
      </div>
      
      <div className="admin-header__right">
        {actions && (
          <div className="admin-header__actions">
            {actions}
          </div>
        )}
        
        <UserMenu
          user={user}
          items={userMenuItems}
          className="admin-header__user-menu"
        />
      </div>
    </header>
  );
};

export default AdminHeader;
