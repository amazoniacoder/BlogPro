// client/src/admin/components/AdminSlidingMenu.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminRoutes } from '../utils/routePatterns';
import { Icon } from '@/ui-system/icons/components';

interface AdminSlidingMenuProps {
  activeSection: string;
  onSectionChange: (section: string, path: string) => void;
}

export const AdminSlidingMenu: React.FC<AdminSlidingMenuProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const slidingMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(['admin', 'nav']);

  useEffect(() => {
    const updatePosition = () => {
      if (slidingMenuRef.current && isOpen) {
        const sidebarItems = document.querySelectorAll('.admin-sidebar__item');
        if (sidebarItems.length > 0) {
          const itemHeight = 56;
          const baseTop = 25;
          const calculatedPosition = baseTop + (sidebarItems.length * itemHeight) + 8;
          slidingMenuRef.current.style.setProperty('--dynamic-bottom-position', `${calculatedPosition}px`);
        }
      }
    };

    if (isOpen) {
      const timer = setTimeout(updatePosition, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSectionClick = (section: string, path: string) => {
    onSectionChange(section, path);
    setIsOpen(false); // Close sidebar after clicking menu item
  };

  return (
    <>
      <div 
        ref={slidingMenuRef}
        className={`admin-sliding-menu ${isOpen ? 'admin-sliding-menu--open' : ''}`}
      >
        <button
          className={`admin-sliding-menu__toggle ${isOpen ? 'admin-sliding-menu__toggle--open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle admin menu"
        >
          <Icon 
            name="gear" 
            size={20} 
            className="admin-sliding-menu__gear-icon"
          />
        </button>
      </div>
      
      {isOpen && (
        <div
          className={`admin-sidebar admin-sidebar--open ${expanded ? 'admin-sidebar--expanded' : ''}`}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          <nav className="admin-sidebar__nav">
            <ul className="admin-sidebar__list">
              <li className={`admin-sidebar__item ${activeSection === 'dashboard' ? 'admin-sidebar__item--active' : ''}`}>
                <a className="admin-sidebar__link" onClick={() => handleSectionClick('dashboard', AdminRoutes.DASHBOARD)}>
                  <span className="admin-sidebar__icon"><Icon name="admin" size={24} /></span>
                  <span className="admin-sidebar__text">{t('admin:dashboard')}</span>
                </a>
              </li>
              
              <li className={`admin-sidebar__item ${activeSection === 'blog' ? 'admin-sidebar__item--active' : ''}`}>
                <a className="admin-sidebar__link" onClick={() => handleSectionClick('blog', AdminRoutes.BLOG)}>
                  <span className="admin-sidebar__icon"><Icon name="edit" size={24} /></span>
                  <span className="admin-sidebar__text">{t('admin:blogPosts')}</span>
                </a>
              </li>
              
              <li className={`admin-sidebar__item ${activeSection === 'categories' ? 'admin-sidebar__item--active' : ''}`}>
                <a className="admin-sidebar__link" onClick={() => handleSectionClick('categories', AdminRoutes.CATEGORIES)}>
                  <span className="admin-sidebar__icon"><Icon name="folder" size={24} /></span>
                  <span className="admin-sidebar__text">{t('admin:categories')}</span>
                </a>
              </li>
              
              <li className={`admin-sidebar__item ${activeSection === 'documentation' ? 'admin-sidebar__item--active' : ''}`}>
                <a className="admin-sidebar__link" onClick={() => handleSectionClick('documentation', '/admin/documentation')}>
                  <span className="admin-sidebar__icon"><Icon name="book" size={24} /></span>
                  <span className="admin-sidebar__text">Документация</span>
                </a>
              </li>
              
              <li className={`admin-sidebar__item ${activeSection === 'analytics' ? 'admin-sidebar__item--active' : ''}`}>
                <a className="admin-sidebar__link" onClick={() => handleSectionClick('analytics', '/admin/analytics')}>
                  <span className="admin-sidebar__icon"><Icon name="chart" size={24} /></span>
                  <span className="admin-sidebar__text">Analytics</span>
                </a>
              </li>
              
              <li className={`admin-sidebar__item ${activeSection === 'media' ? 'admin-sidebar__item--active' : ''}`}>
                <a className="admin-sidebar__link" onClick={() => handleSectionClick('media', AdminRoutes.MEDIA)}>
                  <span className="admin-sidebar__icon"><Icon name="image" size={24} /></span>
                  <span className="admin-sidebar__text">{t('admin:media', { defaultValue: 'Медиа' })}</span>
                </a>
              </li>
              
              <li className={`admin-sidebar__item ${activeSection === 'users' ? 'admin-sidebar__item--active' : ''}`}>
                <a className="admin-sidebar__link" onClick={() => handleSectionClick('users', AdminRoutes.USERS)}>
                  <span className="admin-sidebar__icon"><Icon name="users" size={24} /></span>
                  <span className="admin-sidebar__text">{t('admin:users', { defaultValue: 'Пользователи' })}</span>
                </a>
              </li>
              
              <li className={`admin-sidebar__item ${activeSection === 'comments' ? 'admin-sidebar__item--active' : ''}`}>
                <a className="admin-sidebar__link" onClick={() => handleSectionClick('comments', '/admin/comments')}>
                  <span className="admin-sidebar__icon"><Icon name="reply" size={24} /></span>
                  <span className="admin-sidebar__text">Comments</span>
                </a>
              </li>
              
              <li className={`admin-sidebar__item ${activeSection === 'shop' ? 'admin-sidebar__item--active' : ''}`}>
                <a className="admin-sidebar__link" onClick={() => handleSectionClick('shop', '/admin/shop')}>
                  <span className="admin-sidebar__icon"><Icon name="shopping-cart" size={24} /></span>
                  <span className="admin-sidebar__text">Shop</span>
                </a>
              </li>
              
              <li className={`admin-sidebar__item ${activeSection === 'site-editor' ? 'admin-sidebar__item--active' : ''}`}>
                <a className="admin-sidebar__link" onClick={() => handleSectionClick('site-editor', '/admin/site-editor')}>
                  <span className="admin-sidebar__icon"><Icon name="gear" size={24} /></span>
                  <span className="admin-sidebar__text">Редактор сайта</span>
                </a>
              </li>
              
              <li className={`admin-sidebar__item ${activeSection === 'settings' ? 'admin-sidebar__item--active' : ''}`}>
                <a className="admin-sidebar__link" onClick={() => handleSectionClick('settings', AdminRoutes.SETTINGS)}>
                  <span className="admin-sidebar__icon"><Icon name="wrench" size={24} /></span>
                  <span className="admin-sidebar__text">{t('nav:settings')}</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
      
      <div className={`admin-layout-shift hidden ${isOpen ? 'admin-layout-shift--active' : ''}`} />
    </>
  );
};
