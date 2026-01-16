import { db } from '../db/db';
import { 
  analyticsPageViews, 
  analyticsSessions, 
  analyticsDailyStats 
} from '../../shared/types/schema';
import { sql } from 'drizzle-orm';

export class AnalyticsCleanupService {
  async cleanupOldData(): Promise<{ deletedPageViews: number; deletedSessions: number; deletedDailyStats: number }> {
    try {
      console.log('🧹 Starting analytics data cleanup...');

      // Delete page views older than 2 years
      const pageViewsResult = await db.delete(analyticsPageViews)
        .where(sql`${analyticsPageViews.createdAt} < NOW() - INTERVAL '2 years'`);

      // Delete sessions older than 2 years
      const sessionsResult = await db.delete(analyticsSessions)
        .where(sql`${analyticsSessions.createdAt} < NOW() - INTERVAL '2 years'`);

      // Delete daily stats older than 5 years
      const dailyStatsResult = await db.delete(analyticsDailyStats)
        .where(sql`${analyticsDailyStats.date} < CURRENT_DATE - INTERVAL '5 years'`);

      const result = {
        deletedPageViews: pageViewsResult.rowCount || 0,
        deletedSessions: sessionsResult.rowCount || 0,
        deletedDailyStats: dailyStatsResult.rowCount || 0
      };

      console.log('✅ Analytics cleanup completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Analytics cleanup failed:', error);
      throw error;
    }
  }

  async getDataRetentionStats(): Promise<{
    totalPageViews: number;
    oldPageViews: number;
    totalSessions: number;
    oldSessions: number;
    totalDailyStats: number;
    oldDailyStats: number;
  }> {
    try {
      const [totalPageViews] = await db.select({ count: sql<number>`COUNT(*)` }).from(analyticsPageViews);
      const [oldPageViews] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(analyticsPageViews)
        .where(sql`${analyticsPageViews.createdAt} < NOW() - INTERVAL '2 years'`);

      const [totalSessions] = await db.select({ count: sql<number>`COUNT(*)` }).from(analyticsSessions);
      const [oldSessions] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(analyticsSessions)
        .where(sql`${analyticsSessions.createdAt} < NOW() - INTERVAL '2 years'`);

      const [totalDailyStats] = await db.select({ count: sql<number>`COUNT(*)` }).from(analyticsDailyStats);
      const [oldDailyStats] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(analyticsDailyStats)
        .where(sql`${analyticsDailyStats.date} < CURRENT_DATE - INTERVAL '5 years'`);

      return {
        totalPageViews: totalPageViews.count,
        oldPageViews: oldPageViews.count,
        totalSessions: totalSessions.count,
        oldSessions: oldSessions.count,
        totalDailyStats: totalDailyStats.count,
        oldDailyStats: oldDailyStats.count
      };
    } catch (error) {
      console.error('Error getting retention stats:', error);
      throw error;
    }
  }
}

export const analyticsCleanupService = new AnalyticsCleanupService();