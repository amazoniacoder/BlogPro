import { analyticsService } from './analytics-service';
import { broadcastUpdate } from '../websocket';

export class RealtimeAnalyticsService {
  private static instance: RealtimeAnalyticsService;
  private updateInterval: NodeJS.Timeout | null = null;
  private wsInstance: any = null;

  static getInstance(): RealtimeAnalyticsService {
    if (!RealtimeAnalyticsService.instance) {
      RealtimeAnalyticsService.instance = new RealtimeAnalyticsService();
    }
    return RealtimeAnalyticsService.instance;
  }

  // Initialize with WebSocket instance
  initialize(wsInstance: any): void {
    this.wsInstance = wsInstance;
    this.startRealtimeUpdates();
  }

  // Start broadcasting real-time updates
  private startRealtimeUpdates(): void {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(async () => {
      try {
        await this.broadcastAnalyticsUpdate();
        await this.broadcastVisitorCount();
      } catch (error) {
        console.error('Real-time analytics update failed:', error);
      }
    }, 30000); // Update every 30 seconds

    console.log('📊 Real-time analytics broadcasting started');
  }

  // Stop broadcasting
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('📊 Real-time analytics broadcasting stopped');
    }
  }

  // Broadcast analytics update to all connected clients
  private async broadcastAnalyticsUpdate(): Promise<void> {
    try {
      // Get current analytics data (use 7 days to ensure we have data)
      const overview = await analyticsService.getOverview({ days: 7 });
      
      // Update real-time stats
      await analyticsService.updateRealtimeStats();
      
      console.log('📡 Broadcasting analytics update:', {
        pageViews: overview.totalPageViews,
        visitors: overview.uniqueVisitors,
        sessions: overview.totalSessions
      });
      
      // Send incremental update to prevent data overwriting
      broadcastUpdate(this.wsInstance, 'analytics_updated', {
        totalPageViews: overview.totalPageViews,
        uniqueVisitors: overview.uniqueVisitors,
        totalSessions: overview.totalSessions,
        bounceRate: overview.bounceRate,
        avgSessionDuration: overview.avgSessionDuration,
        topPages: overview.topPages.slice(0, 5),
        topReferrers: overview.topReferrers.slice(0, 5),
        deviceStats: overview.deviceStats,
        countryStats: overview.countryStats,
        // Only send chart data if it has changed
        chartData: overview.chartData,
        timestamp: new Date().toISOString(),
        updateType: 'MERGE_UPDATE'
      });
    } catch (error) {
      console.error('Error broadcasting analytics update:', error);
    }
  }

  // Broadcast immediate update (for manual triggers)
  async broadcastImmediate(): Promise<void> {
    await this.broadcastAnalyticsUpdate();
  }

  // Broadcast visitor count update
  async broadcastVisitorCount(): Promise<void> {
    try {
      const realtimeStats = await analyticsService.getRealtimeStats();
      
      console.log('📡 Broadcasting visitor count:', realtimeStats.activeUsers);
      
      broadcastUpdate(this.wsInstance, 'visitor_count_updated', {
        activeVisitors: realtimeStats.activeUsers,
        currentPageViews: realtimeStats.currentPageViews,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error broadcasting visitor count:', error);
    }
  }
}

export const realtimeAnalytics = RealtimeAnalyticsService.getInstance();