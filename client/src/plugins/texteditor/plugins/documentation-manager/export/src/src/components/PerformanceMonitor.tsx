import { Icon } from '../../../../../../../../ui-system/icons/components';
/**
 * Performance Monitor Component
 * Real-time performance metrics and optimization tools
 */

import React, { useState, useEffect } from 'react';
import { LibraryContext } from '../types/LibraryContext';
import { useOptimizedDocumentation } from '../hooks/useOptimizedDocumentation';

interface PerformanceMonitorProps {
  libraryContext: LibraryContext;
  isVisible: boolean;
  onClose: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  libraryContext,
  isVisible,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'cache' | 'network'>('metrics');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const {
    getPerformanceMetrics,
    getCacheInfo,
    invalidateCache,
    preloadContent
  } = useOptimizedDocumentation(libraryContext.libraryType);

  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  const [cacheInfo, setCacheInfo] = useState(getCacheInfo());

  // Auto-refresh metrics
  useEffect(() => {
    if (!autoRefresh || !isVisible) return;

    const interval = setInterval(() => {
      setMetrics(getPerformanceMetrics());
      setCacheInfo(getCacheInfo());
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, isVisible, getPerformanceMetrics, getCacheInfo]);

  const handleClearCache = () => {
    invalidateCache();
    setMetrics(getPerformanceMetrics());
    setCacheInfo(getCacheInfo());
  };

  const handlePreloadContent = async () => {
    const endpoints = [
      `/api/documentation/public/sections/${libraryContext.libraryType}`,
      `/api/documentation/public/content/${libraryContext.libraryType}`
    ];
    
    try {
      await preloadContent(endpoints);
      setMetrics(getPerformanceMetrics());
      setCacheInfo(getCacheInfo());
    } catch (error) {
      console.error('Preload failed:', error);
    }
  };

  const getCacheHitRate = () => {
    const total = metrics.cacheHits + metrics.cacheMisses;
    return total > 0 ? ((metrics.cacheHits / total) * 100).toFixed(1) : '0';
  };

  const getPerformanceGrade = () => {
    const hitRate = parseFloat(getCacheHitRate());
    const avgTime = metrics.averageResponseTime;
    
    if (hitRate > 80 && avgTime < 100) return { grade: 'A', color: '#28a745' };
    if (hitRate > 60 && avgTime < 200) return { grade: 'B', color: '#ffc107' };
    if (hitRate > 40 && avgTime < 500) return { grade: 'C', color: '#fd7e14' };
    return { grade: 'D', color: '#dc3545' };
  };

  if (!isVisible) return null;

  const performanceGrade = getPerformanceGrade();

  return (
    <div className="performance-monitor">
      <div className="performance-monitor-overlay" onClick={onClose} />
      
      <div className="performance-monitor-panel">
        <div className="performance-header">
          <div className="performance-title">
            <h3>Performance Monitor - {libraryContext.libraryName}</h3>
            <div className="performance-grade" style={{ color: performanceGrade.color }}>
              Grade: {performanceGrade.grade}
            </div>
          </div>
          
          <div className="performance-controls">
            <label className="auto-refresh-toggle">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto Refresh
            </label>
            <button onClick={onClose} className="close-btn">✕</button>
          </div>
        </div>

        <div className="performance-tabs">
          <button
            className={`perf-tab ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            📊 Metrics
          </button>
          <button
            className={`perf-tab ${activeTab === 'cache' ? 'active' : ''}`}
            onClick={() => setActiveTab('cache')}
          >
            🗄️ Cache
          </button>
          <button
            className={`perf-tab ${activeTab === 'network' ? 'active' : ''}`}
            onClick={() => setActiveTab('network')}
          >
            🌐 Network
          </button>
        </div>

        <div className="performance-content">
          {activeTab === 'metrics' && (
            <div className="metrics-panel">
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-value">{metrics.totalRequests}</div>
                  <div className="metric-label">Total Requests</div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-value">{getCacheHitRate()}%</div>
                  <div className="metric-label">Cache Hit Rate</div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-value">{metrics.averageResponseTime}ms</div>
                  <div className="metric-label">Avg Response Time</div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-value">{cacheInfo.size}</div>
                  <div className="metric-label">Cache Entries</div>
                </div>
              </div>

              <div className="performance-chart">
                <h4>Performance Breakdown</h4>
                <div className="chart-bars">
                  <div className="chart-bar">
                    <div className="bar-label">Cache Hits</div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill success"
                        style={{ width: `${getCacheHitRate()}%` }}
                      />
                    </div>
                    <div className="bar-value">{metrics.cacheHits}</div>
                  </div>
                  
                  <div className="chart-bar">
                    <div className="bar-label">Cache Misses</div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill warning"
                        style={{ 
                          width: `${100 - parseFloat(getCacheHitRate())}%` 
                        }}
                      />
                    </div>
                    <div className="bar-value">{metrics.cacheMisses}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cache' && (
            <div className="cache-panel">
              <div className="cache-controls">
                <button onClick={handleClearCache} className="cache-btn danger">
                  <Icon name="delete" size={16} /> Clear Cache
                </button>
                <button onClick={handlePreloadContent} className="cache-btn primary">
                  ⚡ Preload Content
                </button>
              </div>

              <div className="cache-entries">
                <h4>Cache Entries ({cacheInfo.size})</h4>
                {cacheInfo.entries.length === 0 ? (
                  <div className="empty-cache">
                    <span>📭</span>
                    <p>No cache entries</p>
                  </div>
                ) : (
                  <div className="cache-list">
                    {cacheInfo.entries
                      .sort((a, b) => b.hits - a.hits)
                      .slice(0, 10)
                      .map((entry, index) => (
                      <div key={index} className="cache-entry">
                        <div className="cache-key">
                          {entry.key.length > 50 
                            ? `${entry.key.substring(0, 50)}...` 
                            : entry.key
                          }
                        </div>
                        <div className="cache-stats">
                          <span className="cache-hits">{entry.hits} hits</span>
                          <span className="cache-age">
                            {Math.round(entry.age / 1000)}s old
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="network-panel">
              <div className="network-status">
                <h4>Network Performance</h4>
                <div className="network-metrics">
                  <div className="network-metric">
                    <span className="metric-label">Last Request:</span>
                    <span className="metric-value">
                      {metrics.lastRequestTime ? `${metrics.lastRequestTime}ms` : 'N/A'}
                    </span>
                  </div>
                  <div className="network-metric">
                    <span className="metric-label">Connection:</span>
                    <span className="metric-value online">🟢 Online</span>
                  </div>
                </div>
              </div>

              <div className="optimization-tips">
                <h4>Optimization Tips</h4>
                <div className="tips-list">
                  <div className="tip-item">
                    <span className="tip-icon">💡</span>
                    <div className="tip-content">
                      <strong>Cache Hit Rate:</strong> 
                      {parseFloat(getCacheHitRate()) > 70 
                        ? ' Excellent! Your cache is working well.'
                        : ' Consider preloading frequently accessed content.'
                      }
                    </div>
                  </div>
                  
                  <div className="tip-item">
                    <span className="tip-icon">⚡</span>
                    <div className="tip-content">
                      <strong>Response Time:</strong>
                      {metrics.averageResponseTime < 200
                        ? ' Great response times!'
                        : ' Consider optimizing API queries or increasing cache TTL.'
                      }
                    </div>
                  </div>
                  
                  <div className="tip-item">
                    <span className="tip-icon">🗄️</span>
                    <div className="tip-content">
                      <strong>Cache Size:</strong>
                      {cacheInfo.size < 50
                        ? ' Cache is efficiently sized.'
                        : ' Large cache detected. Consider clearing old entries.'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
