/**
 * BlogPro Header Dropdown Component
 * Multi-level dropdown menu for header navigation
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Icon, IconName } from '../../icons/components';
import { useTranslation } from '@/hooks/useTranslation';

export interface DropdownItem {
  id: string;
  label: string;
  href?: string;
  icon?: IconName;
  children?: DropdownItem[];
  active?: boolean;
}

export interface HeaderDropdownProps {
  label: string;
  items: DropdownItem[];
  href?: string;
  icon?: IconName;
  active?: boolean;
  className?: string;
  onLinkClick?: () => void;
}

export const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  label,
  items,
  href,
  icon,
  active = false,
  className = '',
  onLinkClick
}) => {
  const { t } = useTranslation('nav');
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (window.innerWidth > 768) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 768) {
      setTimeout(() => setIsOpen(false), 100);
    }
  };

  const handleClick = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(!isOpen);
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Function to translate menu item labels
  const translateLabel = (label: string): string => {
    const menuTranslations: Record<string, string> = {
      'Home': t('home'),
      'About': t('about'),
      'About Us': t('about'),
      'Blog': t('blog'),
      'Contact': t('contact'),
      'Services': t('services', 'Services'),
      'Products': t('products', 'Products'),
      'Portfolio': t('portfolio', 'Portfolio'),
      'News': t('news', 'News'),
      'Support': t('support', 'Support'),
      'Documentation': t('documentation', 'Documentation'),
      'Главная': t('home'),
      'О нас': t('about'),
      'Блог': t('blog'),
      'Контакты': t('contact'),
      'Услуги': t('services', 'Services'),
      'Продукты': t('products', 'Products'),
      'Портфолио': t('portfolio', 'Portfolio'),
      'Новости': t('news', 'News'),
      'Поддержка': t('support', 'Support'),
      'Документация': t('documentation', 'Documentation')
    };
    
    return menuTranslations[label] || label;
  };

  const renderDropdownItems = (items: DropdownItem[], level = 0) => {
    return items.map((item) => {
      const isExpanded = expandedItems.has(item.id);
      const hasChildren = item.children && item.children.length > 0;
      
      return (
        <div key={item.id} className={`menu-dropdown-item menu-dropdown-item--level-${level}`}>
          {hasChildren ? (
            <>
              <div className={`menu-dropdown-link menu-dropdown-link--expandable ${item.active ? 'menu-dropdown-link--active' : ''}`}>
                <Link 
                  href={item.href || '#'}
                  className="menu-dropdown-link-text"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLinkClick?.();
                  }}
                >
                  {item.icon && (
                    <Icon name={item.icon} size={16} className="menu-dropdown-icon" />
                  )}
                  <span className="menu-dropdown-label">{translateLabel(item.label)}</span>
                </Link>
                <button
                  className="menu-dropdown-toggle"
                  onClick={() => toggleExpanded(item.id)}
                  aria-label="Toggle submenu"
                >
                  <Icon 
                    name="arrow-right" 
                    size={12} 
                    className="menu-dropdown-arrow"
                    style={{
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </button>
              </div>
              <div className={`menu-dropdown-children ${isExpanded ? 'menu-dropdown-children--open' : ''}`}>
                {isExpanded && item.children && renderDropdownItems(item.children, level + 1)}
              </div>
            </>
          ) : (
            <Link
              href={item.href || '#'}
              className={`menu-dropdown-link ${level > 0 ? 'menu-dropdown-link--child' : ''} ${item.active ? 'menu-dropdown-link--active' : ''}`}
              onClick={onLinkClick}
            >
              {item.icon && (
                <Icon name={item.icon} size={16} className="menu-dropdown-icon" />
              )}
              <span className="menu-dropdown-label">{translateLabel(item.label)}</span>
            </Link>
          )}
        </div>
      );
    });
  };

  return (
    <div
      className={`menu-item ${isOpen ? 'menu-item--open' : ''} ${className}`.trim()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={menuRef}
    >
      <div className="menu-item__wrapper">
        <Link
          href={href || '#'}
          className={`header__nav-link ${active ? 'header__nav-link--active' : ''}`}
          onClick={(e) => {
            if (!href || href === '#') {
              e.preventDefault();
            }
            onLinkClick?.();
          }}
        >
          {icon && <Icon name={icon} size={16} className="header__nav-icon" />}
          {translateLabel(label)}
        </Link>
        <button
          className="menu-dropdown-toggle"
          onClick={handleClick}
          aria-label="Toggle submenu"
        >
          <Icon 
            name="arrow-right" 
            size={12} 
            className="menu-dropdown-arrow"
            style={{
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          />
        </button>
      </div>

      <div 
        className="menu-dropdown"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {renderDropdownItems(items)}
      </div>
    </div>
  );
};

export default HeaderDropdown;
