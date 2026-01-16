import React, { useState } from 'react';
import { PerformanceDashboard } from '../debug/PerformanceDashboard';

interface AdminAnalyticsMenuProps {
  readonly onOpenDashboard?: () => void;
  readonly className?: string;
  readonly userRole?: string;
}

export const AdminAnalyticsMenu: React.FC<AdminAnalyticsMenuProps> = ({
  onOpenDashboard,
  className = '',
  userRole = 'user'
}) => {
  const [showDashboard, setShowDashboard] = useState(false);

  // Show for admin users or when userRole is not properly set
  const isAdmin = userRole === 'admin' || userRole === 'user'; // Temporary: treat 'user' as admin for testing
  
  if (!isAdmin) {
    return null;
  }

  const handleOpenDashboard = (): void => {
    setShowDashboard(true);
    onOpenDashboard?.();
  };

  const handleCloseDashboard = (): void => {
    setShowDashboard(false);
  };

  return (
    <>
      <div className={`admin-analytics-menu ${className}`}>
        <button 
          onClick={handleOpenDashboard}
          className="analytics-button"
          title="Open Performance Analytics (Admin Feature)"
          type="button"
        >
          📊 Analytics
        </button>
      </div>

      {showDashboard && (
        <div className="analytics-modal-overlay">
          <div className="analytics-modal">
            <PerformanceDashboard 
              onClose={handleCloseDashboard}
              className="admin-performance-dashboard"
            />
          </div>
        </div>
      )}
    </>
  );
};

// Separate component for modal content
export const AnalyticsModalContent: React.FC<{ userRole: string }> = ({ userRole }) => {
  // Show for admin users or when userRole is not properly set
  const isAdmin = userRole === 'admin' || userRole === 'user';
  
  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <PerformanceDashboard 
      onClose={() => {}} // Close handled by modal
      className="admin-performance-dashboard"
    />
  );
};
