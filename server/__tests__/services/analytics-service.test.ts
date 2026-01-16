import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnalyticsService } from '../../services/analytics-service';

// Mock database
const mockDb = {
  insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
  select: vi.fn().mockReturnValue({ 
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([])
      })
    })
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined)
    })
  }),
  delete: vi.fn().mockResolvedValue(undefined)
};

vi.mock('../../db/db', () => ({
  db: mockDb
}));

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('trackPageView', () => {
    it('should track page view with valid data', async () => {
      const trackingData = {
        sessionId: 'test-session',
        pagePath: '/test-page',
        pageTitle: 'Test Page',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      };

      await analyticsService.trackPageView(trackingData);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should throw error with invalid data', async () => {
      const invalidData = {
        sessionId: '',
        pagePath: '/test'
      };

      await expect(analyticsService.trackPageView(invalidData as any))
        .rejects.toThrow();
    });
  });

  describe('getOverview', () => {
    it('should return analytics overview', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 100 }])
        })
      });

      const result = await analyticsService.getOverview({ days: 7 });
      expect(result).toHaveProperty('totalPageViews');
      expect(result).toHaveProperty('uniqueVisitors');
    });

    it('should handle database errors gracefully', async () => {
      mockDb.select.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(analyticsService.getOverview({ days: 7 }))
        .rejects.toThrow('Failed to get analytics overview');
    });
  });

  describe('clearData', () => {
    it('should clear all analytics data', async () => {
      await analyticsService.clearData();
      expect(mockDb.delete).toHaveBeenCalledTimes(4);
    });
  });
});