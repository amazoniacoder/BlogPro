/**
 * BlogPro Admin Layout Component
 * Layout wrapper for admin pages
 */

import React from 'react';
import ScrollToTop from '@/components/common/scroll-to-top';
import './admin-layout.css';

export interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`layout admin-layout ${className}`}>
      <ScrollToTop />
      <main className="main-content bg-primary">
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
