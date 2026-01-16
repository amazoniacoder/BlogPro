/**
 * BlogPro Admin Sliding Menu Component
 * Sliding menu toggle button that moves between header and bottom positions
 */

import React, { useState } from 'react';
import { Icon } from '../../icons/components';
import { AdminSidebar } from './AdminSidebar';
import type { AdminMenuItem } from './AdminSidebar';

export interface AdminSlidingMenuProps {
  items: AdminMenuItem[];
  className?: string;
}

export const AdminSlidingMenu: React.FC<AdminSlidingMenuProps> = ({
  items,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleClasses = [
    'admin-sliding-menu__toggle',
    isOpen && 'admin-sliding-menu__toggle--open',
    className
  ].filter(Boolean).join(' ');

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className={toggleClasses}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close admin menu' : 'Open admin menu'}
      >
        <Icon 
          name="gear" 
          size={20} 
          className="admin-sliding-menu__gear-icon"
        />
      </button>

      {isOpen && (
        <AdminSidebar
          items={items}
          collapsed={false}
          onToggle={handleToggle}
          className="admin-sidebar--open"
        />
      )}
    </>
  );
};

export default AdminSlidingMenu;
