import { db } from '../db/db';
import { 
  analyticsPageViews, 
  analyticsSessions, 
  analyticsDailyStats, 
  analyticsRealtime 
} from '../../shared/types/schema';
import { eq, desc, gte, sql, and, count, avg } from 'drizzle-orm';
import { z } from 'zod';
import { analyticsCacheService } from './analytics-cache';

// Validation schemas
const trackingSchema = z.object({
  sessionId: z.string().min(1).max(255),
  pagePath: z.string().min(1).max(500),
  pageTitle: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  country: z.string().length(2).optional(),
  deviceType: z.string().max(50).optional(),
  browser: z.string().max(100).optional(),
  os: z.string().max(100).optional(),
  screenResolution: z.string().max(20).optional()
});

const analyticsQuerySchema = z.object({
  days: z.number().min(1).max(365).default(7),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export interface AnalyticsOverview {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ referrer: string; views: number }>;
  deviceStats: Record<string, number>;
  countryStats: Record<string, number>;
  chartData: Array<{ date: string; pageViews: number; visitors: number }>;
}

export class AnalyticsService {
  // Track page view
  async trackPageView(data: z.infer<typeof trackingSchema>): Promise<void> {
    const validated = trackingSchema.parse(data);
    
    try {
      // Insert page view
      await db.insert(analyticsPageViews).values({
        sessionId: validated.sessionId,
        pagePath: validated.pagePath,
        pageTitle: validated.pageTitle,
        referrer: validated.referrer,
        userAgent: validated.userAgent,
        ipAddress: validated.ipAddress,
        country: validated.country,
        deviceType: validated.deviceType,
        browser: validated.browser,
        os: validated.os,
        screenResolution: validated.screenResolution
      });

      // Update or create session
      await this.updateSession(validated.sessionId, validated);
      
      // Invalidate cache after new data
      await analyticsCacheService.invalidateOverview();
      
      console.log('📊 Page view tracked and cache invalidated');
    } catch (error) {
      console.error('Error tracking page view:', error);
      throw new Error('Failed to track page view');
    }
  }

  // Update session data
  private async updateSession(sessionId: string, data: z.infer<typeof trackingSchema>): Promise<void> {
    try {
      const existingSession = await db
        .select()
        .from(analyticsSessions)
        .where(eq(analyticsSessions.id, sessionId))
        .limit(1);

      if (existingSession.length === 0) {
        // Create new session
        await db.insert(analyticsSessions).values({
          id: sessionId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          country: data.country,
          deviceType: data.deviceType,
          browser: data.browser,
          os: data.os,
          entryPage: data.pagePath,
          pageViewsCount: 1
        });
      } else {
        // Update existing session
        await db
          .update(analyticsSessions)
          .set({
            pageViewsCount: sql`${analyticsSessions.pageViewsCount} + 1`,
            exitPage: data.pagePath,
            updatedAt: new Date()
          })
          .where(eq(analyticsSessions.id, sessionId));
      }
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  // Get real-time stats
  async getRealtimeStats(): Promise<{ activeUsers: number; currentPageViews: Record<string, number> }> {
    try {
      // Try cache first
      const cached = await analyticsCacheService.getRealtimeStats();
      if (cached) {
        return cached;
      }

      const [realtimeData] = await db.select().from(analyticsRealtime).limit(1);
      
      if (!realtimeData) {
        return { activeUsers: 0, currentPageViews: {} };
      }
      
      const pageViews = typeof realtimeData.currentPageViews === 'string' 
        ? JSON.parse(realtimeData.currentPageViews) 
        : realtimeData.currentPageViews || {};
      
      const stats = {
        activeUsers: realtimeData.activeUsers || 0,
        currentPageViews: pageViews
      };

      // Cache the result
      await analyticsCacheService.setRealtimeStats(stats);
      
      return stats;
    } catch (error) {
      console.error('Error getting realtime stats:', error);
      return { activeUsers: 0, currentPageViews: {} };
    }
  }

  // Get analytics overview
  async getOverview(params: z.infer<typeof analyticsQuerySchema>): Promise<AnalyticsOverview> {
    const validated = analyticsQuerySchema.parse(params);
    
    // Try cache first
    const cached = await analyticsCacheService.getOverview(validated.days);
    if (cached) {
      console.log(`📊 Analytics overview cache hit for ${validated.days} days`);
      return cached;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - validated.days);

    try {
      // Get basic stats
      const [pageViewsResult] = await db
        .select({ count: count() })
        .from(analyticsPageViews)
        .where(gte(analyticsPageViews.createdAt, startDate));

      const [uniqueVisitorsResult] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${analyticsPageViews.sessionId})` })
        .from(analyticsPageViews)
        .where(gte(analyticsPageViews.createdAt, startDate));

      const [sessionsResult] = await db
        .select({ count: count() })
        .from(analyticsSessions)
        .where(gte(analyticsSessions.createdAt, startDate));

      // Get bounce rate
      const [bounceResult] = await db
        .select({ 
          bounceRate: sql<number>`AVG(CASE WHEN ${analyticsSessions.isBounce} THEN 1 ELSE 0 END) * 100`
        })
        .from(analyticsSessions)
        .where(gte(analyticsSessions.createdAt, startDate));

      // Get average session duration
      const [avgDurationResult] = await db
        .select({ avgDuration: avg(analyticsSessions.durationSeconds) })
        .from(analyticsSessions)
        .where(gte(analyticsSessions.createdAt, startDate));

      // Get top pages
      const topPages = await db
        .select({
          path: analyticsPageViews.pagePath,
          views: count()
        })
        .from(analyticsPageViews)
        .where(gte(analyticsPageViews.createdAt, startDate))
        .groupBy(analyticsPageViews.pagePath)
        .orderBy(desc(count()))
        .limit(10);

      // Get top referrers
      const topReferrers = await db
        .select({
          referrer: analyticsPageViews.referrer,
          views: count()
        })
        .from(analyticsPageViews)
        .where(
          and(
            gte(analyticsPageViews.createdAt, startDate),
            sql`${analyticsPageViews.referrer} IS NOT NULL AND ${analyticsPageViews.referrer} != ''`
          )
        )
        .groupBy(analyticsPageViews.referrer)
        .orderBy(desc(count()))
        .limit(10);

      // Get device stats
      const deviceStats = await db
        .select({
          device: analyticsPageViews.deviceType,
          count: count()
        })
        .from(analyticsPageViews)
        .where(gte(analyticsPageViews.createdAt, startDate))
        .groupBy(analyticsPageViews.deviceType);

      // Get country stats
      const countryStats = await db
        .select({
          country: analyticsPageViews.country,
          count: count()
        })
        .from(analyticsPageViews)
        .where(gte(analyticsPageViews.createdAt, startDate))
        .groupBy(analyticsPageViews.country);

      // Get chart data (daily breakdown)
      const chartData = await this.getChartData(validated.days);

      const overview = {
        totalPageViews: pageViewsResult.count,
        uniqueVisitors: uniqueVisitorsResult.count,
        totalSessions: sessionsResult.count,
        bounceRate: Math.round(bounceResult.bounceRate || 0),
        avgSessionDuration: Math.round(Number(avgDurationResult.avgDuration) || 0),
        topPages: topPages.map(p => ({ path: p.path, views: p.views })),
        topReferrers: topReferrers.map(r => ({ referrer: r.referrer || 'Direct', views: r.views })),
        deviceStats: deviceStats.reduce((acc, d) => ({ ...acc, [d.device || 'Unknown']: d.count }), {}),
        countryStats: countryStats.reduce((acc, c) => ({ ...acc, [c.country || 'Unknown']: c.count }), {}),
        chartData
      };

      // Cache the result
      await analyticsCacheService.setOverview(validated.days, overview);
      
      return overview;
    } catch (error) {
      console.error('Error getting analytics overview:', error);
      throw new Error('Failed to get analytics overview');
    }
  }

  // Get chart data for specified days (optimized with single query)
  private async getChartData(days: number): Promise<Array<{ date: string; pageViews: number; visitors: number }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    try {
      // Single optimized query for all days
      const results = await db
        .select({
          date: sql<string>`DATE(${analyticsPageViews.createdAt})`,
          pageViews: count(),
          visitors: sql<number>`COUNT(DISTINCT ${analyticsPageViews.sessionId})`
        })
        .from(analyticsPageViews)
        .where(gte(analyticsPageViews.createdAt, startDate))
        .groupBy(sql`DATE(${analyticsPageViews.createdAt})`)
        .orderBy(sql`DATE(${analyticsPageViews.createdAt})`);

      // Fill in missing days with zero values
      const chartData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = results.find(r => r.date === dateStr);
        chartData.push({
          date: dateStr,
          pageViews: dayData?.pageViews || 0,
          visitors: dayData?.visitors || 0
        });
      }

      return chartData;
    } catch (error) {
      console.error('Error getting chart data:', error);
      return [];
    }
  }

  // Aggregate daily stats (for scheduled job)
  async aggregateDailyStats(date?: string): Promise<void> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    try {
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);

      const overview = await this.getOverview({ days: 1 });
      
      // Check if daily stats already exist
      const existingStats = await db
        .select()
        .from(analyticsDailyStats)
        .where(eq(analyticsDailyStats.date, targetDate))
        .limit(1);

      const statsData = {
        date: targetDate,
        pageViews: overview.totalPageViews,
        uniqueVisitors: overview.uniqueVisitors,
        sessions: overview.totalSessions,
        bounceRate: overview.bounceRate.toString(),
        avgSessionDuration: overview.avgSessionDuration,
        topPages: JSON.stringify(overview.topPages),
        topReferrers: JSON.stringify(overview.topReferrers),
        deviceBreakdown: JSON.stringify(overview.deviceStats),
        countryBreakdown: JSON.stringify(overview.countryStats)
      };

      if (existingStats.length === 0) {
        // Insert new stats
        await db.insert(analyticsDailyStats).values(statsData);
      } else {
        // Update existing stats
        await db
          .update(analyticsDailyStats)
          .set({
            ...statsData,
            updatedAt: new Date()
          })
          .where(eq(analyticsDailyStats.date, targetDate));
      }
    } catch (error) {
      console.error('Error aggregating daily stats:', error);
      throw new Error('Failed to aggregate daily stats');
    }
  }

  // Clear analytics data (admin only)
  async clearData(): Promise<void> {
    try {
      await db.delete(analyticsPageViews);
      await db.delete(analyticsSessions);
      await db.delete(analyticsDailyStats);
      await db.delete(analyticsRealtime);
    } catch (error) {
      console.error('Error clearing analytics data:', error);
      throw new Error('Failed to clear analytics data');
    }
  }

  // Update real-time stats
  async updateRealtimeStats(): Promise<{ activeUsers: number; currentPageViews: Record<string, number> }> {
    try {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      const [activeUsersResult] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${analyticsPageViews.sessionId})` })
        .from(analyticsPageViews)
        .where(gte(analyticsPageViews.createdAt, fiveMinutesAgo));

      const currentPageViews = await db
        .select({
          path: analyticsPageViews.pagePath,
          count: count()
        })
        .from(analyticsPageViews)
        .where(gte(analyticsPageViews.createdAt, fiveMinutesAgo))
        .groupBy(analyticsPageViews.pagePath);

      const pageViewsObj = currentPageViews.reduce((acc, pv) => ({
        ...acc,
        [pv.path]: pv.count
      }), {});

      const pageViewsJson = JSON.stringify(pageViewsObj);

      // Upsert realtime stats
      const existingRealtime = await db.select().from(analyticsRealtime).limit(1);
      
      if (existingRealtime.length === 0) {
        await db.insert(analyticsRealtime).values({
          activeUsers: activeUsersResult.count,
          currentPageViews: pageViewsJson
        });
      } else {
        await db
          .update(analyticsRealtime)
          .set({
            activeUsers: activeUsersResult.count,
            currentPageViews: pageViewsJson,
            updatedAt: new Date()
          })
          .where(eq(analyticsRealtime.id, existingRealtime[0].id));
      }

      return {
        activeUsers: activeUsersResult.count,
        currentPageViews: pageViewsObj
      };
    } catch (error) {
      console.error('Error updating realtime stats:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();