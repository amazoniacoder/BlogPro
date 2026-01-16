/**
 * Analytics Dashboard Component
 * Displays comprehensive documentation usage analytics
 */

import React, { useState, useEffect } from 'react';

interface AnalyticsMetrics {
  total_searches: number;
  unique_queries: number;
  unique_users: number;
  avg_results_per_search: number;
  zero_result_searches: number;
  successful_searches: number;
  success_rate: number;
  timeframe: string;
}

interface PopularSearch {
  query: string;
  search_count: number;
  avg_results: number;
  last_searched: string;
}

interface SearchTrend {
  search_date: string;
  search_count: number;
  unique_queries: number;
  avg_results: number;
}

interface AnalyticsDashboardProps {
  userRole?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  userRole = 'user' 
}) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [trends, setTrends] = useState<SearchTrend[]>([]);
  const [zeroResults, setZeroResults] = useState<PopularSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('7 days');

  useEffect(() => {
    if (userRole === 'admin') {
      loadAnalytics();
    }
  }, [userRole, timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsRes, popularRes, trendsRes, zeroRes] = await Promise.all([
        fetch(`/api/documentation/analytics/metrics?timeframe=${encodeURIComponent(timeframe)}`),
        fetch('/api/documentation/analytics/popular?limit=10'),
        fetch('/api/documentation/analytics/trends?days=7'),
        fetch('/api/documentation/analytics/zero-results?limit=5')
      ]);

      if (metricsRes.ok) {
        setMetrics(await metricsRes.json());
      }
      if (popularRes.ok) {
        const data = await popularRes.json();
        setPopularSearches(data.popular_searches || []);
      }
      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setTrends(data.trends || []);
      }
      if (zeroRes.ok) {
        const data = await zeroRes.json();
        setZeroResults(data.zero_result_searches || []);
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="analytics-dashboard unauthorized">
        <div className="unauthorized-message">
          <span>🔒</span>
          <h3>Access Restricted</h3>
          <p>Analytics dashboard is only available to administrators.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="analytics-dashboard loading">
        <div className="loading-spinner">
          <span>📊</span>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard error">
        <div className="error-message">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={loadAnalytics}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h2>📊 Documentation Analytics</h2>
        <div className="timeframe-selector">
          <label>Timeframe:</label>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="1 day">Last 24 hours</option>
            <option value="7 days">Last 7 days</option>
            <option value="30 days">Last 30 days</option>
            <option value="90 days">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{metrics.total_searches}</div>
            <div className="metric-label">Total Searches</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.unique_queries}</div>
            <div className="metric-label">Unique Queries</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.success_rate}%</div>
            <div className="metric-label">Success Rate</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.avg_results_per_search.toFixed(1)}</div>
            <div className="metric-label">Avg Results</div>
          </div>
        </div>
      )}

      <div className="analytics-content">
        {/* Popular Searches */}
        <div className="analytics-section">
          <h3>🔥 Popular Searches</h3>
          {popularSearches.length > 0 ? (
            <div className="popular-searches">
              {popularSearches.map((search, index) => (
                <div key={index} className="search-item">
                  <div className="search-query">"{search.query}"</div>
                  <div className="search-stats">
                    <span>{search.search_count} searches</span>
                    <span>{search.avg_results.toFixed(1)} avg results</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No search data available for this period.</p>
          )}
        </div>

        {/* Search Trends */}
        <div className="analytics-section">
          <h3>📈 Search Trends (Last 7 Days)</h3>
          {trends.length > 0 ? (
            <div className="trends-chart">
              {trends.reverse().map((trend, index) => (
                <div key={index} className="trend-item">
                  <div className="trend-date">
                    {new Date(trend.search_date).toLocaleDateString()}
                  </div>
                  <div className="trend-bar">
                    <div 
                      className="trend-fill"
                      style={{ 
                        width: `${Math.min(100, (trend.search_count / Math.max(...trends.map(t => t.search_count))) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="trend-count">{trend.search_count}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No trend data available.</p>
          )}
        </div>

        {/* Zero Result Searches */}
        <div className="analytics-section">
          <h3>🚫 Zero Result Searches</h3>
          <p className="section-description">
            These queries returned no results and may indicate content gaps.
          </p>
          {zeroResults.length > 0 ? (
            <div className="zero-results">
              {zeroResults.map((search, index) => (
                <div key={index} className="zero-result-item">
                  <div className="search-query">"{search.query}"</div>
                  <div className="search-frequency">
                    {search.search_count} attempts
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Great! No searches returned zero results.</p>
          )}
        </div>
      </div>

      <div className="dashboard-footer">
        <button onClick={loadAnalytics} className="refresh-btn">
          🔄 Refresh Data
        </button>
        <span className="last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
