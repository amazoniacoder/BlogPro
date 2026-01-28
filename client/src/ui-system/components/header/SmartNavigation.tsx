/**
 * BlogPro Smart Navigation Component
 * Dynamically shows/hides navigation items based on available space
 */

import React, { useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useHeader, NavigationItem } from './HeaderContext';
import { useHeaderSpace } from '../../hooks/useHeaderSpace';
import { HeaderDropdown, type DropdownItem } from '../navigation/HeaderDropdown';
import type { MenuItem } from '../../../../../shared/types/menu';

interface SmartNavigationProps {
  items: NavigationItem[];
  menuItems?: MenuItem[]; // Original menu items with children
  onLinkClick?: () => void;
  className?: string;
}

export const SmartNavigation: React.FC<SmartNavigationProps> = ({
  items,
  menuItems = [],
  onLinkClick,
  className = ''
}) => {
  const navRef = useRef<HTMLDivElement>(null);
  const { visibleItems } = useHeader();
  const [location] = useLocation();

  // Initialize space calculation
  useHeaderSpace({
    navigationItems: items,
    containerRef: navRef,
  });

  const handleLinkClick = () => {
    onLinkClick?.();
  };

  const isActive = (url?: string) => {
    if (!url) return false;
    if (url === '/' && location === '/') return true;
    if (url !== '/' && location.startsWith(url)) return true;
    return false;
  };

  const hasActiveChild = (item: MenuItem): boolean => {
    if (item.children) {
      return item.children.some(child => isActive(child.url) || hasActiveChild(child));
    }
    return false;
  };

  // Convert MenuItem to DropdownItem structure (only active items)
  const convertToDropdownItems = (items: MenuItem[]): DropdownItem[] => {
    return items
      .filter(item => item.is_active) // Only show active menu items
      .map(item => ({
        id: item.id.toString(),
        label: item.title,
        href: item.url,
        children: item.children ? convertToDropdownItems(item.children) : undefined,
        active: isActive(item.url)
      }));
  };

  // Find corresponding MenuItem for each visible NavigationItem
  const getMenuItemById = (id: string) => {
    return menuItems.find(item => item.id.toString() === id);
  };

  return (
    <div className={`header__nav-content ${className}`} ref={navRef}>
      {/* Visible navigation items */}
      <div className="header__nav-list list-none m-0 p-0">
        {visibleItems.map((item) => {
          const menuItem = getMenuItemById(item.id);
          
          // Skip inactive menu items
          if (menuItem && !menuItem.is_active) {
            return null;
          }
          
          return (
            <div 
              key={item.id} 
              className="header__nav-item"
            >
              {menuItem && menuItem.children && menuItem.children.length > 0 ? (
                <HeaderDropdown
                  label={menuItem.title}
                  href={menuItem.url}
                  items={convertToDropdownItems(menuItem.children)}
                  active={isActive(menuItem.url) || hasActiveChild(menuItem)}
                  onLinkClick={handleLinkClick}
                />
              ) : (
                <Link
                  href={item.href || '#'}
                  className={`header__nav-link bg-hover ${isActive(item.href) ? 'header__nav-link--active' : ''}`}
                  onClick={(e) => {
                    if (item.href === '/' && location === '/') {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    handleLinkClick();
                  }}
                >
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </div>


    </div>
  );
};
