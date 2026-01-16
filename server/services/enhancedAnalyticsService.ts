import { db } from '../db/db';
import { analyticsPageViews, analyticsSessions, analyticsDailyStats } from '../../shared/types/schema';
import { eq, sql, gte, and, lte } from 'drizzle-orm';
// Simple user agent parsing function
const parseUserAgent = (userAgent: string) => {
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const isTablet = /iPad|Tablet/.test(userAgent);
  const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                 userAgent.includes('Firefox') ? 'Firefox' : 
                 userAgent.includes('Safari') ? 'Safari' : 'Unknown';
  const os = userAgent.includes('Windows') ? 'Windows' :
            userAgent.includes('Mac') ? 'macOS' :
            userAgent.includes('Linux') ? 'Linux' : 'Unknown';
  
  return { isMobile, isTablet, browser, os };
};
import type { AnalyticsOverview, TrackingData } from '../../shared/types/analytics';

export class AnalyticsService {
  private lastStatsGeneration = new Map<string, number>();
  private readonly STATS_THROTTLE_MS = 30000; // 30 seconds
  private readonly BROADCAST_THROTTLE_MS = 60000; // 1 minute for WebSocket
  private lastBroadcast = 0;

  async trackPageView(data: TrackingData & { userAgent?: string; ipAddress?: string }) {
    console.log('Analytics service - tracking page view:', data);
    const agent = parseUserAgent(data.userAgent || '');
    
    const pageView = await db.insert(analyticsPageViews).values({
      sessionId: data.sessionId,
      pagePath: data.pagePath,
      pageTitle: data.pageTitle,
      referrer: data.referrer,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      country: null,
      deviceType: agent.isMobile ? 'mobile' : agent.isTablet ? 'tablet' : 'desktop',
      browser: agent.browser,
      os: agent.os,
      screenResolution: data.screenResolution
    }).returning();

    await this.updateSession(data.sessionId, data.pagePath, data.userAgent, data.ipAddress);
    
    // Throttled stats generation
    const today = new Date().toISOString().split('T')[0];
    const lastGenerated = this.lastStatsGeneration.get(today) || 0;
    const now = Date.now();
    
    if (now - lastGenerated > this.STATS_THROTTLE_MS) {
      this.lastStatsGeneration.set(today, now);
      
      setTimeout(async () => {
        try {
          await this.generateDailyStats(today);
          console.log('✅ Daily stats generated for:', today);
        } catch (error) {
          console.error('Error auto-generating stats:', error);
        }
      }, 1000);
    }
    
    return pageView[0];
  }

  async updateSession(sessionId: string, pagePath: string, userAgent?: string, ipAddress?: string) {
    const existing = await db.select().from(analyticsSessions).where(eq(analyticsSessions.id, sessionId));
    
    if (existing.length === 0) {
      const agent = parseUserAgent(userAgent || '');
      
      await db.insert(analyticsSessions).values({
        id: sessionId,
        ipAddress,
        userAgent,
        country: null,
        deviceType: agent.isMobile ? 'mobile' : agent.isTablet ? 'tablet' : 'desktop',
        browser: agent.browser,
        os: agent.os,
        entryPage: pagePath,
        pageViewsCount: 1
      });
    } else {
      await db.update(analyticsSessions)
        .set({
          exitPage: pagePath,
          pageViewsCount: sql`${analyticsSessions.pageViewsCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(analyticsSessions.id, sessionId));
    }
  }

  async getAnalyticsOverview(days: number = 1): Promise<AnalyticsOverview> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const dailyStats = await db.select()
      .from(analyticsDailyStats)
      .where(gte(analyticsDailyStats.date, startDate.toISOString().split('T')[0]));

    const totalPageViews = dailyStats.reduce((sum, day) => sum + (day.pageViews || 0), 0);
    const uniqueVisitors = dailyStats.reduce((sum, day) => sum + (day.uniqueVisitors || 0), 0);
    const totalSessions = dailyStats.reduce((sum, day) => sum + (day.sessions || 0), 0);
    const avgBounceRate = dailyStats.length > 0 ? 
      dailyStats.reduce((sum, day) => sum + Number(day.bounceRate || 0), 0) / dailyStats.length : 0;
    const avgSessionDuration = dailyStats.length > 0 ?
      dailyStats.reduce((sum, day) => sum + (day.avgSessionDuration || 0), 0) / dailyStats.length : 0;

    return {
      totalPageViews,
      uniqueVisitors,
      totalSessions,
      bounceRate: avgBounceRate,
      avgSessionDuration,
      topPages: this.aggregateTopPages(dailyStats),
      topReferrers: this.aggregateTopReferrers(dailyStats),
      deviceStats: this.aggregateDeviceStats(dailyStats),
      countryStats: this.aggregateCountryStats(dailyStats),
      chartData: dailyStats.map(stat => ({
        id: stat.id,
        date: stat.date,
        pageViews: stat.pageViews || 0,
        uniqueVisitors: stat.uniqueVisitors || 0,
        sessions: stat.sessions || 0,
        bounceRate: Number(stat.bounceRate || 0),
        avgSessionDuration: stat.avgSessionDuration || 0,
        topPages: [],
        topReferrers: [],
        deviceBreakdown: {},
        countryBreakdown: {}
      })) as any[]
    };
  }

  private aggregateTopPages(dailyStats: any[]) {
    const pageMap = new Map<string, number>();
    dailyStats.forEach(day => {
      if (day.topPages && Array.isArray(day.topPages)) {
        day.topPages.forEach((page: any) => {
          pageMap.set(page.page, (pageMap.get(page.page) || 0) + page.views);
        });
      }
    });
    return Array.from(pageMap.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  private aggregateTopReferrers(dailyStats: any[]) {
    const referrerMap = new Map<string, number>();
    dailyStats.forEach(day => {
      if (day.topReferrers && Array.isArray(day.topReferrers)) {
        day.topReferrers.forEach((ref: any) => {
          referrerMap.set(ref.referrer, (referrerMap.get(ref.referrer) || 0) + ref.visits);
        });
      }
    });
    return Array.from(referrerMap.entries())
      .map(([referrer, visits]) => ({ referrer, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  }

  private aggregateDeviceStats(dailyStats: any[]) {
    const deviceMap = new Map<string, number>();
    dailyStats.forEach(day => {
      if (day.deviceBreakdown && typeof day.deviceBreakdown === 'object') {
        Object.entries(day.deviceBreakdown).forEach(([device, count]) => {
          deviceMap.set(device, (deviceMap.get(device) || 0) + Number(count));
        });
      }
    });
    return Object.fromEntries(deviceMap);
  }

  private aggregateCountryStats(dailyStats: any[]) {
    const countryMap = new Map<string, number>();
    dailyStats.forEach(day => {
      if (day.countryBreakdown && typeof day.countryBreakdown === 'object') {
        Object.entries(day.countryBreakdown).forEach(([country, count]) => {
          countryMap.set(country, (countryMap.get(country) || 0) + Number(count));
        });
      }
    });
    return Object.fromEntries(countryMap);
  }

  async generateDailyStats(date: string) {
    const startOfDay = new Date(`${date}T00:00:00Z`);
    const endOfDay = new Date(`${date}T23:59:59Z`);
    
    const stats = await db.select({
      pageViews: sql<number>`COUNT(*)`,
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${analyticsPageViews.sessionId})`,
      sessions: sql<number>`COUNT(DISTINCT ${analyticsPageViews.sessionId})`
    }).from(analyticsPageViews)
      .where(and(
        gte(analyticsPageViews.createdAt, startOfDay),
        lte(analyticsPageViews.createdAt, endOfDay),
        sql`${analyticsPageViews.pagePath} NOT LIKE '/admin%'`
      ));

    const topPages = await this.getTopPages(startOfDay, endOfDay);
    console.log('Generated top pages for', date, ':', topPages);
    
    try {
      // Delete existing stats for this date first
      await db.delete(analyticsDailyStats).where(eq(analyticsDailyStats.date, date));
      
      const deviceBreakdown = await this.getDeviceBreakdown(startOfDay, endOfDay);
      
      await db.insert(analyticsDailyStats).values({
        date,
        pageViews: stats[0]?.pageViews || 0,
        uniqueVisitors: stats[0]?.uniqueVisitors || 0,
        sessions: stats[0]?.sessions || 0,
        bounceRate: '0',
        avgSessionDuration: 0,
        topPages: topPages,
        topReferrers: [],
        deviceBreakdown: deviceBreakdown,
        countryBreakdown: {}
      });
      console.log('Daily stats saved for:', date);
      
      // Throttled WebSocket broadcast
      const now = Date.now();
      if (now - this.lastBroadcast > this.BROADCAST_THROTTLE_MS) {
        this.lastBroadcast = now;
        
        try {
          const { broadcastUpdate } = await import('../websocket');
          const overview = await this.getAnalyticsOverview(1);
          broadcastUpdate((global as any).wss, 'analytics_updated', overview);
        } catch (error) {
          console.error('Error broadcasting analytics update:', error);
        }
      }
    } catch (error) {
      console.error('Error saving daily stats:', error);
    }
  }



  private async getTopPages(startDate: Date, endDate: Date) {
    const result = await db.select({
      page: analyticsPageViews.pagePath,
      views: sql<number>`COUNT(*)`
    }).from(analyticsPageViews)
      .where(and(
        gte(analyticsPageViews.createdAt, startDate),
        lte(analyticsPageViews.createdAt, endDate),
        sql`${analyticsPageViews.pagePath} NOT LIKE '/admin%'`
      ))
      .groupBy(analyticsPageViews.pagePath)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);
    
    return result;
  }

  private async getDeviceBreakdown(startDate: Date, endDate: Date) {
    const result = await db.select({
      device: sql<string>`COALESCE(${analyticsPageViews.deviceType}, 'Unknown')`,
      count: sql<number>`COUNT(*)`
    }).from(analyticsPageViews)
      .where(and(
        gte(analyticsPageViews.createdAt, startDate),
        lte(analyticsPageViews.createdAt, endDate)
      ))
      .groupBy(sql`COALESCE(${analyticsPageViews.deviceType}, 'Unknown')`);
    
    return Object.fromEntries(result.map(r => [r.device, r.count]));
  }


}

export const analyticsService = new AnalyticsService();