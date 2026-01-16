import { Icon } from '../../../../../../../../ui-system/icons/components';
/**
 * Security Dashboard Component
 * Displays security information and audit logs
 */

import React, { useState } from 'react';
import { LibraryContext } from '../types/LibraryContext';
import { useSecurity } from '../hooks/useSecurity';
import { getPermissionDescription, getAvailableActions } from '../utils/permissions';

interface SecurityDashboardProps {
  libraryContext: LibraryContext;
  userRole?: 'admin' | 'editor' | 'user' | null;
  userId?: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  libraryContext,
  userRole,
  userId
}) => {
  const [activeTab, setActiveTab] = useState<'permissions' | 'audit' | 'settings'>('permissions');
  
  const {
    security,
    validateUserAction,
    updateUserRole,
    logout,
    getSecurityAuditLog,
    clearAuditLog
  } = useSecurity(libraryContext.libraryType, userRole, userId);

  const auditLog = getSecurityAuditLog();
  const availableActions = getAvailableActions({
    userRole: security.userRole,
    libraryType: libraryContext.libraryType,
    currentUserId: security.userId
  });

  const handleRoleChange = (newRole: 'admin' | 'editor' | 'user' | null) => {
    updateUserRole(newRole, security.userId);
  };

  const handleTestAction = (action: string) => {
    const result = validateUserAction(action as any, 'test-resource');
    alert(`Action "${action}": ${result.allowed ? 'Allowed' : `Denied - ${result.reason}`}`);
  };

  return (
    <div className="security-dashboard">
      <div className="security-dashboard-header">
        <h3>Security Dashboard - {libraryContext.libraryName}</h3>
        
        <div className="security-tabs">
          <button 
            className={`security-tab ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            🔐 Permissions
          </button>
          <button 
            className={`security-tab ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            📋 Audit Log
          </button>
          <button 
            className={`security-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Icon name="gear" size={16} /> Settings
          </button>
        </div>
      </div>

      <div className="security-dashboard-content">
        {activeTab === 'permissions' && (
          <div className="permissions-panel">
            <div className="user-info">
              <h4>Current User Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>User ID:</label>
                  <span>{security.userId || 'Anonymous'}</span>
                </div>
                <div className="info-item">
                  <label>Role:</label>
                  <span className={`role-badge ${security.userRole || 'anonymous'}`}>
                    {security.userRole || 'Anonymous'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Authenticated:</label>
                  <span className={security.isAuthenticated ? 'status-yes' : 'status-no'}>
                    {security.isAuthenticated ? '✅ Yes' : '<Icon name="x" size={16} /> No'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Session Expires:</label>
                  <span>
                    {security.sessionExpiry 
                      ? security.sessionExpiry.toLocaleString()
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="permissions-info">
              <h4>Permission Summary</h4>
              <p className="permission-description">
                {getPermissionDescription(security.userRole)}
              </p>
              
              <div className="available-actions">
                <h5>Available Actions:</h5>
                <div className="actions-grid">
                  {availableActions.map((action) => (
                    <div key={action} className="action-item">
                      <span className="action-icon">✅</span>
                      <span className="action-name">{action}</span>
                      <button 
                        className="test-action-btn"
                        onClick={() => handleTestAction(action)}
                      >
                        Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="permission-matrix">
              <h4>Detailed Permissions</h4>
              <div className="matrix-grid">
                {Object.entries(security.permissions).map(([permission, allowed]) => (
                  <div key={permission} className="permission-row">
                    <span className="permission-name">
                      {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className={`permission-status ${allowed ? 'allowed' : 'denied'}`}>
                      {allowed ? '✅ Allowed' : '<Icon name="x" size={16} /> Denied'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="audit-panel">
            <div className="audit-header">
              <h4>Security Audit Log</h4>
              <div className="audit-actions">
                <button onClick={() => window.location.reload()}>
                  🔄 Refresh
                </button>
                {security.userRole === 'admin' && (
                  <button onClick={clearAuditLog} className="danger-btn">
                    <Icon name="delete" size={16} /> Clear Log
                  </button>
                )}
              </div>
            </div>
            
            <div className="audit-log">
              {auditLog.length === 0 ? (
                <div className="empty-log">
                  <span>📋</span>
                  <p>No audit entries found</p>
                </div>
              ) : (
                auditLog.slice(-20).reverse().map((entry: any, index: number) => (
                  <div key={index} className={`audit-entry ${entry.allowed ? 'allowed' : 'denied'}`}>
                    <div className="audit-timestamp">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                    <div className="audit-details">
                      <span className="audit-user">
                        {entry.userId || 'Anonymous'} ({entry.userRole || 'none'})
                      </span>
                      <span className="audit-action">{entry.action}</span>
                      <span className="audit-resource">{entry.resource}</span>
                    </div>
                    <div className={`audit-result ${entry.allowed ? 'success' : 'failure'}`}>
                      {entry.allowed ? '✅ Allowed' : `<Icon name="x" size={16} /> ${entry.reason || 'Denied'}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-panel">
            <div className="role-testing">
              <h4>Role Testing (Demo Only)</h4>
              <p>Switch between different roles to test permissions:</p>
              
              <div className="role-buttons">
                <button 
                  onClick={() => handleRoleChange(null)}
                  className={!security.userRole ? 'active' : ''}
                >
                  Anonymous
                </button>
                <button 
                  onClick={() => handleRoleChange('user')}
                  className={security.userRole === 'user' ? 'active' : ''}
                >
                  User
                </button>
                <button 
                  onClick={() => handleRoleChange('editor')}
                  className={security.userRole === 'editor' ? 'active' : ''}
                >
                  Editor
                </button>
                <button 
                  onClick={() => handleRoleChange('admin')}
                  className={security.userRole === 'admin' ? 'active' : ''}
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="security-settings">
              <h4>Security Settings</h4>
              <div className="setting-item">
                <label>Session Timeout:</label>
                <span>7 days</span>
              </div>
              <div className="setting-item">
                <label>Audit Logging:</label>
                <span className="status-enabled">✅ Enabled</span>
              </div>
              <div className="setting-item">
                <label>Rate Limiting:</label>
                <span className="status-enabled">✅ Enabled</span>
              </div>
              <div className="setting-item">
                <label>Input Validation:</label>
                <span className="status-enabled">✅ Enabled</span>
              </div>
            </div>

            {security.isAuthenticated && (
              <div className="logout-section">
                <h4>Session Management</h4>
                <button onClick={logout} className="logout-btn">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
