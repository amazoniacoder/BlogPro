import React from 'react';
import { SecurityDashboard } from '../../../plugins/security/SecurityDashboard';
import { PerformanceDashboard } from '../debug/PerformanceDashboard';
import { AnalyticsModalContent } from '../analytics/AdminAnalyticsMenu';
import { PluginControlPanel } from '../admin/PluginControlPanel';

interface PluginModalProps {
  showPluginModal: string | null;
  onClose: () => void;
  userRole: string;
}

export const PluginModal: React.FC<PluginModalProps> = ({
  showPluginModal,
  onClose,
  userRole
}) => {
  if (!showPluginModal) return null;

  return (
    <div 
      className="plugin-modal-overlay"
      onClick={onClose}
    >
      <div 
        className="plugin-modal"
        onClick={(e) => e.stopPropagation()}
      >
   
        <div className="plugin-modal__content">
          <button 
            className="plugin-modal__content-close"
            onClick={onClose}
            title="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          {showPluginModal === 'security' && <SecurityDashboard />}
          {showPluginModal === 'performance' && <PerformanceDashboard onClose={onClose} />}
          {showPluginModal === 'analytics' && <AnalyticsModalContent userRole={userRole} />}
          {showPluginModal === 'plugin' && <PluginControlPanel userRole={userRole} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
};
