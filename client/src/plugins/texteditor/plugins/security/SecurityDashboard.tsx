/**
 * Security Dashboard Component
 * 
 * Displays plugin security status and error isolation information.
 */

import React, { useState, useEffect } from 'react';
import { PluginRegistry } from '../core/PluginRegistry';

interface SecurityStatus {
  disabledPlugins: string[];
  errorStats: {
    totalErrors: number;
    errorsByPlugin: Record<string, number>;
    recentErrors: Array<{
      pluginName: string;
      error: Error;
      timestamp: number;
    }>;
  };
  sandboxStatus: Array<{
    pluginName: string;
    permissions: any;
    resourceUsage: any;
  }>;
}

export const SecurityDashboard: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSecurityStatus = () => {
    try {
      const errorManager = PluginRegistry.getErrorManager();
      const errorStats = errorManager.getErrorStats();
      const disabledPlugins = errorManager.getDisabledPlugins();
      
      // Get sandbox status for all plugins
      const registeredPlugins = PluginRegistry.getRegisteredPlugins();
      const sandboxStatus = registeredPlugins.map(plugin => {
        const sandbox = PluginRegistry.getPluginSandbox(plugin.name);
        return {
          pluginName: plugin.name,
          permissions: sandbox ? 'Sandboxed' : 'No Sandbox',
          resourceUsage: sandbox ? sandbox.getResourceUsage() : null
        };
      });

      setSecurityStatus({
        disabledPlugins,
        errorStats,
        sandboxStatus
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load security status:', error);
      setLoading(false);
    }
  };

  const handleEnablePlugin = (pluginName: string) => {
    const errorManager = PluginRegistry.getErrorManager();
    errorManager.enablePlugin(pluginName);
    loadSecurityStatus();
  };

  const handleResetErrors = () => {
    const errorManager = PluginRegistry.getErrorManager();
    errorManager.reset();
    loadSecurityStatus();
  };

  useEffect(() => {
    loadSecurityStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadSecurityStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="security-dashboard loading">
        <div className="loading-spinner">Loading security status...</div>
      </div>
    );
  }

  if (!securityStatus) {
    return (
      <div className="security-dashboard error">
        <div className="error-message">Failed to load security status</div>
      </div>
    );
  }

  return (
    <div className="security-dashboard">
      <header className="dashboard-header">
        <h2>🔒 Plugin Security Dashboard</h2>
        <button onClick={loadSecurityStatus} className="refresh-btn">
          🔄 Refresh
        </button>
      </header>

      {/* Error Summary */}
      <section className="error-summary">
        <h3>🚨 Error Status</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{securityStatus.errorStats.totalErrors}</div>
            <div className="stat-label">Total Errors</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{securityStatus.disabledPlugins.length}</div>
            <div className="stat-label">Disabled Plugins</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Object.keys(securityStatus.errorStats.errorsByPlugin).length}</div>
            <div className="stat-label">Plugins with Errors</div>
          </div>
        </div>
        
        {securityStatus.errorStats.totalErrors > 0 && (
          <button onClick={handleResetErrors} className="reset-btn">
            Reset All Errors
          </button>
        )}
      </section>

      {/* Disabled Plugins */}
      {securityStatus.disabledPlugins.length > 0 && (
        <section className="disabled-plugins">
          <h3>⛔ Disabled Plugins</h3>
          <div className="plugin-list">
            {securityStatus.disabledPlugins.map(pluginName => (
              <div key={pluginName} className="plugin-item disabled">
                <span className="plugin-name">{pluginName}</span>
                <button 
                  onClick={() => handleEnablePlugin(pluginName)}
                  className="enable-btn"
                >
                  Enable
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Plugin Sandbox Status */}
      <section className="sandbox-status">
        <h3>🛡️ Plugin Sandbox Status</h3>
        <div className="sandbox-table">
          <table>
            <thead>
              <tr>
                <th>Plugin</th>
                <th>Security</th>
                <th>Network Requests</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {securityStatus.sandboxStatus.map(status => (
                <tr key={status.pluginName}>
                  <td>{status.pluginName}</td>
                  <td>
                    <span className={`security-badge ${status.permissions === 'Sandboxed' ? 'secure' : 'unsecure'}`}>
                      {status.permissions}
                    </span>
                  </td>
                  <td>
                    {status.resourceUsage ? 
                      `${status.resourceUsage.networkRequests}/${status.resourceUsage.networkLimit}` : 
                      'N/A'
                    }
                  </td>
                  <td>
                    <span className={`status-badge ${PluginRegistry.isInitialized(status.pluginName) ? 'active' : 'inactive'}`}>
                      {PluginRegistry.isInitialized(status.pluginName) ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Errors */}
      {securityStatus.errorStats.recentErrors.length > 0 && (
        <section className="recent-errors">
          <h3>📋 Recent Errors</h3>
          <div className="error-list">
            {securityStatus.errorStats.recentErrors.slice(0, 10).map((error, index) => (
              <div key={index} className="error-item">
                <div className="error-header">
                  <span className="error-plugin">{error.pluginName}</span>
                  <span className="error-time">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="error-message">{error.error.message}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="dashboard-footer">
        <small>Security monitoring active • Last updated: {new Date().toLocaleTimeString()}</small>
      </footer>
    </div>
  );
};
