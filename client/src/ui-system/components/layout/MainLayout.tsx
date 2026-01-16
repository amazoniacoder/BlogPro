/**
 * BlogPro Main Layout Component
 * Layout system matching old BEM structure
 */

import React from 'react';

export interface LayoutProps {
  children: React.ReactNode;
  fullHeight?: boolean;
  withSidebar?: boolean;
  loading?: boolean;
  className?: string;
}

export interface LayoutHeaderProps {
  children: React.ReactNode;
}

export interface LayoutContentProps {
  children: React.ReactNode;
  hidden?: boolean;
}

export interface LayoutMainProps {
  children: React.ReactNode;
}

export interface LayoutFooterProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  fullHeight = false,
  withSidebar = false,
  loading = false,
  className = ''
}) => {
  const layoutClasses = [
    'layout',
    fullHeight && 'layout--full-height',
    withSidebar && 'layout--with-sidebar',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      {loading && (
        <div className="layout__loader">
          <div className="layout__spinner"></div>
        </div>
      )}
      {children}
    </div>
  );
};

export const LayoutHeader: React.FC<LayoutHeaderProps> = ({ children }) => {
  return <div className="layout__header">{children}</div>;
};

export const LayoutContent: React.FC<LayoutContentProps> = ({ 
  children, 
  hidden = false 
}) => {
  const contentClasses = [
    'layout__content',
    hidden ? 'layout__content--hidden' : 'layout__content--visible'
  ].filter(Boolean).join(' ');

  return <div className={contentClasses}>{children}</div>;
};

export const LayoutMain: React.FC<LayoutMainProps> = ({ children }) => {
  return <div className="layout__main">{children}</div>;
};

export const LayoutFooter: React.FC<LayoutFooterProps> = ({ children }) => {
  return <div className="layout__footer">{children}</div>;
};

export default Layout;
