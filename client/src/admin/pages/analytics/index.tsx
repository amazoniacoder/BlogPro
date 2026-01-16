import React, { useState, useEffect } from 'react';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { 
  AnalyticsOverview,
  AnalyticsCharts,
  TopPages,
  DeviceStats,
  RealtimeVisitors
} from '@/ui-system/components/admin';
import websocketService from '@/services/websocket-service';

const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState(7);
  const { data, loading, error, refetch } = useAnalyticsData(period);

  // Connect WebSocket for analytics updates
  useEffect(() => {
    if (!websocketService.isConnected()) {
      websocketService.connect();
    }
  }, []);

  return (
    <div className="admin-analytics">
      <div className="admin-analytics__header">
        <h1 className="admin-analytics__title">Analytics Dashboard</h1>
        <div className="admin-analytics__controls">
          <div className="admin-select-wrapper">
            <select 
              className="admin-select--styled cursor-pointer"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              <option value={1}>Last 24 hours</option>
              <option value={3}>Last 3 days</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <div className="admin-select-arrow">▼</div>
          </div>
          <button className="admin-button admin-button--secondary" onClick={refetch}>
            Refresh Data
          </button>
          <button 
            className="admin-button admin-button--warning"
            onClick={async () => {
              if (confirm('Clear analytics cache? This will force fresh data calculation.')) {
                try {
                  const token = localStorage.getItem('authToken');
                  const response = await fetch('/api/analytics/clear-cache', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  if (response.ok) {
                    alert('Cache cleared successfully!');
                    refetch();
                  }
                } catch (error) {
                  console.error('Failed to clear cache:', error);
                }
              }
            }}
          >
            Clear Cache
          </button>

          <button 
            className="admin-button admin-button--danger"
            onClick={async () => {
              if (confirm('Clear ALL analytics data? This cannot be undone.')) {
                try {
                  const token = localStorage.getItem('authToken');
                  await fetch('/api/analytics/clear-data', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  refetch();
                } catch (error) {
                  console.error('Failed to clear data:', error);
                }
              }
            }}
          >
            Clear All Data
          </button>
        </div>
      </div>

      {loading && <div className="admin-loading">Loading analytics...</div>}
      {error && <div className="admin-error">Error: {error}</div>}
      
      {data && (
        <>
          <div className="admin-analytics__top-row">
            <AnalyticsOverview data={data} />
            <RealtimeVisitors websocketService={websocketService} />
          </div>
          <div className="admin-analytics__grid grid-cols-1">
            <AnalyticsCharts data={data.chartData || []} />
            <div className="admin-analytics__sidebar grid-cols-1">
              <TopPages pages={data.topPages} />
              <DeviceStats stats={data.deviceStats} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
