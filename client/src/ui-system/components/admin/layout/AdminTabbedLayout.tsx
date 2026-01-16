import React from 'react';

export interface AdminTabbedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminTabbedLayout: React.FC<AdminTabbedLayoutProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`admin-tabbed-layout flex-col ${className}`}>
      {children}
    </div>
  );
};

export default AdminTabbedLayout;