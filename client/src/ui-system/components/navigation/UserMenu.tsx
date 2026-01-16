/**
 * BlogPro User Menu Component
 * Universal user dropdown menu
 */

import React, { useState, useRef, useEffect } from 'react';
import { Icon, IconName } from '../../icons/components';

export interface UserMenuItem {
  id: string;
  label: string;
  icon?: IconName;
  href?: string;
  onClick?: () => void;
  divider?: boolean;
}

export interface UserMenuProps {
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  items: UserMenuItem[];
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  items,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: UserMenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={`bp-user-menu ${className}`} ref={menuRef}>
      <button
        className="user-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user?.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name}
            className="user-menu__avatar"
          />
        ) : (
          <Icon name="user" size={20} />
        )}
        <Icon name="arrow-down" size={12} />
      </button>

      {isOpen && (
        <div className="user-menu__dropdown">
          {user && (
            <div className="user-menu__header">
              <div className="user-menu__name">{user.name}</div>
              {user.email && (
                <div className="user-menu__email">{user.email}</div>
              )}
            </div>
          )}
          
          <div className="user-menu__items">
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.divider ? (
                  <div className="user-menu__divider" />
                ) : (
                  <button
                    className="user-menu__item"
                    onClick={() => handleItemClick(item)}
                  >
                    {item.icon && <Icon name={item.icon} size={16} />}
                    <span>{item.label}</span>
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
