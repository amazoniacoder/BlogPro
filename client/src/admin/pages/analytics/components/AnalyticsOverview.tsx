import React from 'react';
import { AnalyticsOverview as UIAnalyticsOverview } from '@/ui-system/components/admin';

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

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ data }) => {
  return <UIAnalyticsOverview data={data} />;
};

export default AnalyticsOverview;
