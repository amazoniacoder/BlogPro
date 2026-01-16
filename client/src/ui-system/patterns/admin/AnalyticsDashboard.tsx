import React, { useState } from 'react';
import { useAnalyticsData } from '../../../admin/pages/analytics/hooks/useAnalyticsData';
import websocketService from '../../../services/websocket-service';
import AnalyticsOverview from '../../../admin/pages/analytics/components/AnalyticsOverview';
import AnalyticsCharts from '../../../admin/pages/analytics/components/AnalyticsCharts';
import TopPages from '../../../admin/pages/analytics/components/TopPages';
import DeviceStats from '../../../admin/pages/analytics/components/DeviceStats';
import RealtimeVisitors from '../../../admin/pages/analytics/components/RealtimeVisitors';
import AnalyticsExport from '../../../admin/pages/analytics/components/AnalyticsExport';
import DateRangeSelector from '../../../admin/pages/analytics/components/DateRangeSelector';
import AnalyticsErrorBoundary from '../../../admin/pages/analytics/components/AnalyticsErrorBoundary';

const AnalyticsDashboard: React.FC = React.memo(() => {
  const [selectedDays, setSelectedDays] = useState(7);
  const { data, loading, error, refetch } = useAnalyticsData(selectedDays);

  if (loading) {
    return (
      <div className="admin-analytics">
        <div className="admin-spinner">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-analytics">
        <div className="admin-error">
          <p>Error loading analytics: {error}</p>
          <button className="admin-button admin-button--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnalyticsErrorBoundary>
      <div className="admin-analytics">
        <div className="admin-analytics__header">
          <h1 className="admin-analytics__title">Analytics Dashboard</h1>
          <div className="admin-analytics__controls flex-col">
            <button 
              className="admin-button admin-button--secondary"
              onClick={refetch}
            >
              Refresh
            </button>
          </div>
        </div>

        {data && (
          <>
            <AnalyticsOverview data={data} />
            
            <div className="admin-analytics__grid">
              <AnalyticsCharts data={data.chartData} />
              
              <div className="admin-analytics__sidebar flex-col">
                <RealtimeVisitors websocketService={websocketService} />
                <DateRangeSelector 
                  currentDays={selectedDays}
                  onDateRangeChange={setSelectedDays}
                />
                <TopPages pages={data.topPages} />
                <DeviceStats stats={data.deviceStats} />
                <AnalyticsExport />
              </div>
            </div>
          </>
        )}
      </div>
    </AnalyticsErrorBoundary>
  );
});

AnalyticsDashboard.displayName = 'AnalyticsDashboard';

export default AnalyticsDashboard;
