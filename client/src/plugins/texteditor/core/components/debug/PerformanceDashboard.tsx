import React, { useState, useEffect } from 'react';
import { PerformanceMetrics, PerformanceAlert } from '../../types/PerformanceTypes';
import { PerformanceCollector } from '../../services/monitoring/PerformanceCollector';
import { APMConfiguration } from '../monitoring/APMConfiguration';
import { SpellCheckAnalytics } from '../analytics/SpellCheckAnalytics';
import './PerformanceDashboard.css';

interface PerformanceDashboardProps {
  readonly onClose?: () => void;
  readonly className?: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  onClose,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'alerts' | 'apm' | 'analytics' | 'dictionaries'>('analytics');
  const [dictStats, setDictStats] = useState({ cacheSize: 0, memoryUsage: 0, hitRate: 0, apiRequests: 0 });
  const [predictiveStats, setPredictiveStats] = useState({ totalWords: 0, preloaded: 0, accuracy: 0 });
  const [dictionaryFiles, setDictionaryFiles] = useState({ allUsed: [], stats: [], totalDictionaries: 0 });
  useEffect(() => {
    const collector = PerformanceCollector.getInstance();
    
    // Initial data
    setMetrics(collector.getMetrics());
    setAlerts(collector.getAlerts());
    
    // Subscribe to updates
    const unsubscribe = collector.subscribe(setMetrics);
    
    // Update alerts periodically
    const alertInterval = setInterval(() => {
      setAlerts(collector.getAlerts());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(alertInterval);
    };
  }, []);

  // Dictionary stats effect
  useEffect(() => {
    const updateDictionaryStats = async () => {
      try {
        const { ServiceFactory } = await import('../../services/ServiceFactory');
        const spellCheckService = await ServiceFactory.getUnifiedSpellCheckService();
        
        if (spellCheckService && spellCheckService.getStats) {
          const stats = await spellCheckService.getStats();
          const zeroStats = stats.russian?.zeroDictionary;
          
          setDictStats({
            cacheSize: zeroStats?.cacheSize || 0,
            memoryUsage: zeroStats?.memoryUsage || 0,
            hitRate: zeroStats?.hitRate || 0,
            apiRequests: zeroStats?.apiRequests || 0
          });
          
          setPredictiveStats({
            totalWords: zeroStats?.apiRequests || 0,
            preloaded: zeroStats?.predictive?.preloadCache?.size || 0,
            accuracy: zeroStats?.hitRate || 0
          });
        }
      } catch (error) {
        console.warn('Failed to load dictionary stats:', error);
        // Reset to zeros on error
        setDictStats({ cacheSize: 0, memoryUsage: 0, hitRate: 0, apiRequests: 0 });
        setPredictiveStats({ totalWords: 0, preloaded: 0, accuracy: 0 });
      }
    };
    
    updateDictionaryStats();
    const interval = setInterval(updateDictionaryStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // Dictionary files effect
  useEffect(() => {
    const loadDictionaryFiles = () => {
      try {
        const usage = JSON.parse(localStorage.getItem('zero_dict_usage') || '{}');
        setDictionaryFiles({
          allUsed: usage.allUsed || [],
          stats: usage.stats || [],
          totalDictionaries: usage.totalDictionaries || 0
        });
      } catch {
        setDictionaryFiles({ allUsed: [], stats: [], totalDictionaries: 0 });
      }
    };
    
    loadDictionaryFiles();
    const interval = setInterval(loadDictionaryFiles, 2000);
    return () => clearInterval(interval);
  }, []);

  const getAvgRenderTime = (): number => {
    if (!metrics?.renderTime.length) return 0;
    return metrics.renderTime.reduce((sum, time) => sum + time, 0) / metrics.renderTime.length;
  };

  const getPeakMemoryUsage = (): number => {
    if (!metrics?.memoryUsage.length) return 0;
    return Math.max(...metrics.memoryUsage.map(m => m.used));
  };

  const getSlowestOperation = (): string => {
    if (!metrics?.operationLatency.size) return 'None';
    
    let slowest = '';
    let maxTime = 0;
    
    metrics.operationLatency.forEach((times, operation) => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      if (avgTime > maxTime) {
        maxTime = avgTime;
        slowest = operation;
      }
    });
    
    return slowest || 'None';
  };

  if (!metrics) {
    return <div className="performance-dashboard-loading">Загрузка метрик...</div>;
  }

  return (
    <div className={`performance-dashboard analytics-modal ${className}`}>
      <div className="dashboard-header">
        <h3>Панель производительности</h3>
        {onClose && (
          <button onClick={onClose} className="close-button">×</button>
        )}
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'metrics' ? 'active' : ''}
          onClick={() => setActiveTab('metrics')}
        >
          Метрики
        </button>
        <button 
          className={activeTab === 'alerts' ? 'active' : ''}
          onClick={() => setActiveTab('alerts')}
        >
          Уведомления ({alerts.length})
        </button>
        <button 
          className={activeTab === 'apm' ? 'active' : ''}
          onClick={() => setActiveTab('apm')}
        >
          Мониторинг
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Аналитика
        </button>
        <button 
          className={activeTab === 'dictionaries' ? 'active' : ''}
          onClick={() => setActiveTab('dictionaries')}
        >
          Словари
        </button>
      </div>

      {activeTab === 'metrics' && (
        <div className="metrics-panel">
          <div className="metric-card">
            <h4>Производительность рендеринга</h4>
            <div className="metric-value">
              {getAvgRenderTime().toFixed(2)}мс среднее
            </div>
            <div className="metric-detail">
              Цель: &lt;16мс (60fps)
            </div>
          </div>

          <div className="metric-card">
            <h4>Использование памяти</h4>
            <div className="metric-value">
              {getPeakMemoryUsage().toFixed(2)}МБ пик
            </div>
            <div className="metric-detail">
              Текущее: {metrics.memoryUsage[metrics.memoryUsage.length - 1]?.used.toFixed(2) || 0}МБ
            </div>
          </div>

          <div className="metric-card">
            <h4>Операции</h4>
            <div className="metric-value">
              {metrics.operationLatency.size} отслеживается
            </div>
            <div className="metric-detail">
              Самая медленная: {getSlowestOperation()}
            </div>
          </div>

          <div className="metric-card">
            <h4>Частота ошибок</h4>
            <div className="metric-value">
              {metrics.errorRate.toFixed(1)}%
            </div>
            <div className="metric-detail">
              Цель: &lt;5%
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="alerts-panel">
          {alerts.length === 0 ? (
            <div className="no-alerts">Нет уведомлений о производительности</div>
          ) : (
            <div className="alerts-list">
              {alerts.slice(-10).reverse().map((alert, index) => (
                <div key={index} className={`alert alert-${alert.type}`}>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'apm' && (
        <div className="apm-panel">
          <APMConfiguration className="dashboard-apm-config" />
        </div>
      )}


      {activeTab === 'analytics' && (
        <div className="analytics-panel">
          <SpellCheckAnalytics />
        </div>
      )}

      {activeTab === 'dictionaries' && (
        <div className="dictionaries-panel">
          <div className="dictionary-section">
            <h4>Zero-Dictionary System</h4>
            <div className="dictionary-info">
              <div className="info-item">
                <span className="label">Architecture:</span>
                <span className="value">Server-side validation</span>
              </div>
              <div className="info-item">
                <span className="label">Client Storage:</span>
                <span className="value">{(dictStats.memoryUsage / 1024).toFixed(1)} KB results cache</span>
              </div>
              <div className="info-item">
                <span className="label">Memory Reduction:</span>
                <span className="value">{dictStats.memoryUsage > 0 ? ((1 - dictStats.memoryUsage / (7 * 1024 * 1024)) * 100).toFixed(1) + '%' : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="dictionary-section">
            <h4>Zero-Dictionary Performance</h4>
            <div className="dictionary-stats">
              <div className="stat-item">
                <span className="label">Cache Size:</span>
                <span className="value">{dictStats.cacheSize} results</span>
              </div>
              <div className="stat-item">
                <span className="label">Memory Usage (Zero-Dict):</span>
                <span className="value">{(dictStats.memoryUsage / 1024).toFixed(1)} KB</span>
              </div>
              <div className="stat-item">
                <span className="label">Hit Rate:</span>
                <span className="value">{(dictStats.hitRate * 100).toFixed(1)}%</span>
              </div>
              <div className="stat-item">
                <span className="label">API Requests:</span>
                <span className="value">{dictStats.apiRequests}</span>
              </div>
            </div>
            <div className="memory-note">
              <small>Note: Browser memory includes entire editor, not just spell check</small>
            </div>
          </div>

          <div className="dictionary-section">
            <h4>Predictive Analytics</h4>
            <div className="predictive-stats">
              <div className="stat-item">
                <span className="label">Total Words Analyzed:</span>
                <span className="value">{predictiveStats.totalWords}</span>
              </div>
              <div className="stat-item">
                <span className="label">Preloaded Words:</span>
                <span className="value">{predictiveStats.preloaded}</span>
              </div>
              <div className="stat-item">
                <span className="label">Prediction Accuracy:</span>
                <span className="value">{(predictiveStats.accuracy * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="dictionary-section">
            <h4>Server Dictionary Files</h4>
            <div className="server-dictionaries">
              {dictionaryFiles.allUsed.length === 0 ? (
                <div className="no-dictionaries">No dictionary files accessed yet</div>
              ) : (
                <div>
                  <div className="dictionary-summary">
                    <div className="summary-item">
                      <span className="label">Total Files Accessed:</span>
                      <span className="value">{dictionaryFiles.totalDictionaries} dictionary files</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Location:</span>
                      <span className="value">dictionaries/prefixes/rare/</span>
                    </div>
                  </div>
                  
                  <div className="dictionary-details">
                    <h5>Dictionary File Details:</h5>
                    {dictionaryFiles.stats.length > 0 ? (
                      <div className="dictionary-table">
                        {dictionaryFiles.stats.map((dict: any, index: number) => (
                          <div key={index} className="dictionary-row">
                            <div className="dict-name">{dict.name}</div>
                            <div className="dict-stats">
                              <span className="stat">{dict.size.toLocaleString()} words</span>
                              <span className="stat">{dict.sizeKB} KB</span>
                              <span className="stat">Last: {new Date(dict.lastAccessed).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="dictionary-list">
                        {dictionaryFiles.allUsed.map((dict: string, index: number) => (
                          <div key={index} className="dictionary-item">
                            {dict}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="dictionary-section">
            <h4>Performance Comparison</h4>
            <div className="performance-comparison">
              <div className="comparison-item">
                <span className="old-system">Old System: 7MB dictionaries</span>
                <span className="arrow">→</span>
                <span className="new-system">Zero-Dict: {(dictStats.memoryUsage / 1024).toFixed(1)} KB cache</span>
              </div>
              <div className="comparison-item">
                <span className="old-system">Memory: 7,168 KB</span>
                <span className="arrow">→</span>
                <span className="new-system">Memory: {(dictStats.memoryUsage / 1024).toFixed(1)} KB</span>
              </div>
              <div className="comparison-item">
                <span className="old-system">API Requests: {dictStats.apiRequests}</span>
                <span className="arrow">→</span>
                <span className="new-system">Cache Hits: {Math.floor(dictStats.hitRate * dictStats.apiRequests)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
