import React from 'react';

export interface AdminTabContentProps {
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export interface AdminTabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const AdminTabContent: React.FC<AdminTabContentProps> = ({
  activeTab,
  children,
  className = ''
}) => {
  return (
    <div className={`admin-tab-content ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.props.id === activeTab) {
          return child;
        }
        return null;
      })}
    </div>
  );
};

export const AdminTabPanel: React.FC<AdminTabPanelProps> = ({
  id,
  children,
  className = ''
}) => {
  return (
    <div className={`admin-tab-panel ${className}`} data-tab-id={id}>
      {children}
    </div>
  );
};

export default AdminTabContent;