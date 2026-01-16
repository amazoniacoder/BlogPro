/**
 * Analytics Dashboard Component
 * 
 * Real-time performance monitoring dashboard.
 */

import React, { useState, useEffect } from 'react';
import { PerformanceCollector } from './PerformanceCollector';
import { AnalyticsReport } from './AnalyticsEngine';

interface AnalyticsDashboardProps {
  collector: PerformanceCollector;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ collector }) => {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [timeRange, setTimeRange] = useState<string>('hour');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const updateReport = () => {
      const newReport = collector.getAnalytics(timeRange);
      setReport(newReport);
    };

    updateReport();
    const interval = setInterval(updateReport, 5000);

    return () => clearInterval(interval);
  }, [collector, timeRange, isVisible]);

  if (!isVisible) {
    return (
      <button 
        className="analytics-toggle"
        onClick={() => setIsVisible(true)}
        title="Show Performance Analytics"
      >
        📊
      </button>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h3>Performance Analytics</h3>
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="hour">Last Hour</option>
            <option value="day">Last Day</option>
            <option value="week">Last Week</option>
          </select>
          <button onClick={() => setIsVisible(false)}>×</button>
        </div>
      </div>

      {report && (
        <div className="analytics-content">
          <div className="analytics-summary">
            <div className="metric">
              <span className="metric-label">Total Operations</span>
              <span className="metric-value">{report.totalOperations}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg Duration</span>
              <span className="metric-value">{report.averageDuration.toFixed(2)}ms</span>
            </div>
            <div className="metric">
              <span className="metric-label">Memory Usage</span>
              <span className="metric-value">{(report.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
            </div>
          </div>

          <div className="slowest-operations">
            <h4>Slowest Operations</h4>
            <div className="operations-list">
              {report.slowestOperations.slice(0, 5).map((op, index) => (
                <div key={index} className="operation-item">
                  <span className="operation-name">{op.operation}</span>
                  <span className="operation-duration">{op.duration.toFixed(2)}ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
