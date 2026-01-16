import React, { useMemo } from 'react';

interface AnalyticsOverview {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  topReferrers: Array<{ referrer: string; visits: number }>;
  deviceStats: Record<string, number>;
  countryStats: Record<string, number>;
  chartData: any[];
}

interface AnalyticsOverviewProps {
  data: AnalyticsOverview;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = React.memo(({ data }) => {
  const formattedDuration = useMemo(() => {
    const minutes = Math.floor(data.avgSessionDuration / 60);
    const remainingSeconds = data.avgSessionDuration % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, [data.avgSessionDuration]);
  
  const formattedBounceRate = useMemo(() => 
    Math.round(data.bounceRate), [data.bounceRate]
  );

  return (
    <div className="admin-analytics__overview grid-cols-1">
      <div className="admin-analytics__metric">
        <span className="admin-analytics__value">{data.totalPageViews.toLocaleString()}</span>
        <span className="admin-analytics__label">Page Views</span>
      </div>
      <div className="admin-analytics__metric">
        <span className="admin-analytics__value">{data.uniqueVisitors.toLocaleString()}</span>
        <span className="admin-analytics__label">Unique Visitors</span>
      </div>
      <div className="admin-analytics__metric">
        <span className="admin-analytics__value">{data.totalSessions.toLocaleString()}</span>
        <span className="admin-analytics__label">Sessions</span>
      </div>
      <div className="admin-analytics__metric">
        <span className="admin-analytics__value">{formattedBounceRate}%</span>
        <span className="admin-analytics__label">Bounce Rate</span>
      </div>
      <div className="admin-analytics__metric">
        <span className="admin-analytics__value">{formattedDuration}</span>
        <span className="admin-analytics__label">Avg. Session</span>
      </div>
    </div>
  );
});

AnalyticsOverview.displayName = 'AnalyticsOverview';

export default AnalyticsOverview;
