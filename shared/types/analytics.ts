// shared/types/analytics.ts
export interface PageView {
  id: number;
  sessionId: string;
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  screenResolution?: string;
  timeOnPage?: number;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  entryPage?: string;
  exitPage?: string;
  pageViewsCount: number;
  durationSeconds: number;
  isBounce: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyStats {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface RealTimeStats {
  id: number;
  activeUsers: number;
  currentPageViews: Record<string, number>;
  updatedAt: Date;
}

export interface AnalyticsOverview {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  topReferrers: Array<{ referrer: string; visits: number }>;
  deviceStats: Record<string, number>;
  countryStats: Record<string, number>;
  chartData: DailyStats[];
}

export interface TrackingData {
  sessionId: string;
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  screenResolution?: string;
}