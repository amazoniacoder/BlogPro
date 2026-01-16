/**
 * Plugin Status Indicator
 * 
 * Displays real-time plugin status and health monitoring.
 * Shows plugin count, active status, and error indicators.
 */

import React, { useState, useEffect } from 'react';
import { PluginRegistry } from '../../plugins/core/PluginRegistry';

interface PluginStatusIndicatorProps {
  readonly className?: string;
  readonly showDetails?: boolean;
}

interface PluginStats {
  readonly total: number;
  readonly active: number;
  readonly errors: number;
}

export const PluginStatusIndicator: React.FC<PluginStatusIndicatorProps> = ({
  className = '',
  showDetails = false
}) => {
  const [pluginStats, setPluginStats] = useState<PluginStats>({
    total: 0,
    active: 0,
    errors: 0
  });
  const [showTooltip, setShowTooltip] = useState(false);

  /**
   * Update plugin statistics
   */
  const updateStats = (): void => {
    try {
      const registered = PluginRegistry.getRegisteredPlugins();
      const initialized = PluginRegistry.getInitializedPlugins();
      

      
      setPluginStats({
        total: registered.length,
        active: initialized.length,
        errors: 0 // TODO: Implement error tracking
      });
    } catch (error) {

    }
  };

  // Update stats on mount and periodically
  useEffect(() => {
    // Initial update
    updateStats();
    
    // Set up periodic updates
    const interval = setInterval(updateStats, 2000); // More frequent updates
    
    // Also update when plugins might change
    const handlePluginChange = () => {
      setTimeout(updateStats, 100); // Small delay to ensure plugin state is updated
    };
    
    // Listen for potential plugin changes (if available)
    window.addEventListener('plugin-state-changed', handlePluginChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('plugin-state-changed', handlePluginChange);
    };
  }, []);

  const getStatusColor = (): string => {
    if (pluginStats.errors > 0) return '#ff4444';
    if (pluginStats.active > 0) return '#44ff44';
    return '#888888';
  };

  const getStatusText = (): string => {
    if (pluginStats.errors > 0) return `${pluginStats.errors} errors`;
    return `${pluginStats.active} active`;
  };

  // Always show indicator, even if no plugins are loaded yet

  return (
    <div 
      className={`plugin-status-indicator ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ position: 'relative' }}
    >
      <div 
        className="status-dot"
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          display: 'inline-block'
        }}
      />
      
      {showDetails && (
        <span className="status-text" style={{ marginLeft: '4px', fontSize: '12px' }}>
          {getStatusText()}
        </span>
      )}

      {showTooltip && (
        <div 
          className="status-tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000
          }}
        >
          Plugins: {pluginStats.active}/{pluginStats.total} active
          {pluginStats.errors > 0 && `, ${pluginStats.errors} errors`}
        </div>
      )}
    </div>
  );
};
