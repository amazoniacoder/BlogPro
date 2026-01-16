import React from 'react';
import { AnalyticsCharts as UIAnalyticsCharts } from '@/ui-system/components/admin';

interface DailyStats {
  id: number;
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  topReferrers: Array<{ referrer: string; visits: number }>;
  deviceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
}

interface AnalyticsChartsProps {
  data: DailyStats[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  return <UIAnalyticsCharts data={data} />;
};

export default AnalyticsCharts;
