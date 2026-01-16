import { db } from '../db/db';
import { analyticsPageViews, analyticsSessions } from '../../shared/types/schema';
import { gte, sql } from 'drizzle-orm';

export const analyticsHealthCheck = async () => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Check recent data
    const recentViews = await db.select({ count: sql<number>`COUNT(*)` })
      .from(analyticsPageViews)
      .where(gte(analyticsPageViews.createdAt, yesterday));
    
    const recentSessions = await db.select({ count: sql<number>`COUNT(*)` })
      .from(analyticsSessions)
      .where(gte(analyticsSessions.createdAt, yesterday));
    
    return {
      status: 'healthy',
      recentPageViews: recentViews[0]?.count || 0,
      recentSessions: recentSessions[0]?.count || 0,
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastCheck: new Date().toISOString()
    };
  }
};