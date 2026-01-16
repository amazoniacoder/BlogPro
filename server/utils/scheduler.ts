import { analyticsService } from '../services/analytics-service';
import { analyticsCleanupService } from '../services/analytics-cleanup';

export class AnalyticsScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private cleanupIntervalId: NodeJS.Timeout | null = null;

  // Start daily aggregation job (runs every 24 hours at midnight)
  start(): void {
    if (this.intervalId) {
      console.log('Analytics scheduler already running');
      return;
    }

    // Calculate time until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // Schedule first run at midnight
    setTimeout(() => {
      this.runDailyAggregation();
      
      // Then run every 24 hours
      this.intervalId = setInterval(() => {
        this.runDailyAggregation();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, msUntilMidnight);

    console.log(`📅 Analytics scheduler started. Next run in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
    
    // Start weekly cleanup (runs every Sunday at 2 AM)
    this.startWeeklyCleanup();
  }

  // Start weekly cleanup job
  private startWeeklyCleanup(): void {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay())); // Next Sunday
    nextSunday.setHours(2, 0, 0, 0); // 2 AM
    
    const msUntilNextSunday = nextSunday.getTime() - now.getTime();
    
    setTimeout(() => {
      this.runWeeklyCleanup();
      
      // Then run every week
      this.cleanupIntervalId = setInterval(() => {
        this.runWeeklyCleanup();
      }, 7 * 24 * 60 * 60 * 1000); // 7 days
    }, msUntilNextSunday);
    
    console.log(`🧹 Weekly cleanup scheduled. Next run in ${Math.round(msUntilNextSunday / 1000 / 60 / 60)} hours`);
  }

  // Stop the scheduler
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
    console.log('📅 Analytics scheduler stopped');
  }

  // Run weekly cleanup
  private async runWeeklyCleanup(): Promise<void> {
    try {
      console.log('🧹 Running weekly analytics cleanup...');
      const result = await analyticsCleanupService.cleanupOldData();
      console.log(`✅ Weekly cleanup completed:`, result);
    } catch (error) {
      console.error('❌ Weekly cleanup failed:', error);
    }
  }

  // Run daily aggregation for yesterday's data
  private async runDailyAggregation(): Promise<void> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      
      console.log(`📊 Running daily analytics aggregation for ${dateStr}`);
      await analyticsService.aggregateDailyStats(dateStr);
      console.log(`✅ Daily analytics aggregation completed for ${dateStr}`);
    } catch (error) {
      console.error('❌ Daily analytics aggregation failed:', error);
    }
  }

  // Manual trigger for testing
  async triggerAggregation(date?: string): Promise<void> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      console.log(`📊 Manual analytics aggregation triggered for ${targetDate}`);
      await analyticsService.aggregateDailyStats(targetDate);
      console.log(`✅ Manual analytics aggregation completed for ${targetDate}`);
    } catch (error) {
      console.error('❌ Manual analytics aggregation failed:', error);
      throw error;
    }
  }

  // Manual cleanup trigger
  async triggerCleanup(): Promise<any> {
    try {
      console.log('🧹 Manual analytics cleanup triggered');
      const result = await analyticsCleanupService.cleanupOldData();
      console.log('✅ Manual analytics cleanup completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Manual analytics cleanup failed:', error);
      throw error;
    }
  }
}

export const analyticsScheduler = new AnalyticsScheduler();