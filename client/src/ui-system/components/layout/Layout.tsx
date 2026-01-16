/**
 * BlogPro Layout Component
 * Main application layout with header and footer
 */

import React, { Suspense, memo } from 'react';
import Header from '@/components/layout/header';
import { Footer } from '../footer';
import { useRouteContext } from '@/components/layout/RouteContext';
import './layout.css';

export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  const { isAdminRoute } = useRouteContext();

  return (
    <div className={`layout ${className}`}>
      <Header />
      <div className="layout__content">
        <Suspense fallback={<div style={{ display: 'none' }}></div>}>
          <main className="layout__main">{children}</main>
        </Suspense>
      </div>
      {/* Don't render footer on admin pages */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default memo(Layout);
