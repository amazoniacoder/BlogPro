// client/src/admin/components/AdminLayout.tsx
import React, { useEffect } from "react";
import { AdminSlidingMenu } from "./AdminSlidingMenu";
import AdminScrollToTop from "./AdminScrollToTop";

// Admin styles are now included in UI System

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string, path: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeSection,
  onSectionChange,
}) => {
  // Add class to body when admin page is mounted, remove when unmounted
  useEffect(() => {
    document.body.classList.add('admin-page');
    
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  return (
    <div className="admin-layout">
      <AdminScrollToTop />

      <div className="admin-container">
        {/* Always use desktop sidebar - header handles mobile */}
        <AdminSlidingMenu
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />

        {/* Admin main content */}
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
