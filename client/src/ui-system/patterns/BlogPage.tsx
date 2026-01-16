/**
 * BlogPro Blog Page Pattern
 * Complete blog page with sidebar, filtering, and grid layout
 */

import React from 'react';
import { Icon } from '../icons/components';
import { useTranslation } from '@/hooks/useTranslation';
import { Breadcrumb } from '../components/navigation/Breadcrumb';
import './blog-page.css';

export interface BlogPageProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  sidebar?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  title,
  description,
  children,
  sidebarOpen,
  onToggleSidebar,
  sidebar,
  loading = false,
  error = null,
  className = ''
}) => {
  const { t } = useTranslation('blog');
  
  const handleMainClick = () => {
    if (sidebarOpen) {
      onToggleSidebar();
    }
  };
  
  return (
    <div className={`blog-page ${className}`}>
      <div className="blog-page__container">
        {/* Main content */}
        <div className="blog-page__main" onClick={handleMainClick}>
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Blog' }
          ]} />
          
          {/* Header */}
          <div className="blog-page__header">
            <h1 className="blog-page__title">{title}</h1>
            {description && (
              <div className="blog-page__description">
                {description}
                <span className="blog-page__realtime-indicator">
                  🟢
                  <span className="blog-page__realtime-label">Online</span>
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="blog-page__content">
            {loading && (
              <div className="blog-page__loading">
                <div className="spinner"></div>
              </div>
            )}

            {error && (
              <div className="blog-page__error">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="blog-page__grid">
                {children}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar Tab */}
        <div className={`blog-page__sidebar-tab ${sidebarOpen ? 'blog-page__sidebar-tab--open' : ''}`}>
          <button 
            className={`sidebar-tab__button ${sidebarOpen ? 'sidebar-tab__button--open' : ''}`}
            onClick={onToggleSidebar}
            aria-label="Toggle categories"
          >
            <Icon name={sidebarOpen ? "x" : "hamburger"} size={20} />
          </button>
        </div>
        
        {/* Integrated Sidebar */}
        <div 
          className={`blog-page__sidebar ${sidebarOpen ? 'blog-page__sidebar--open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="blog-page__sidebar-header">
            <h3 className="blog-page__sidebar-title">{t('categories')}</h3>
          </div>
          {sidebar}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
