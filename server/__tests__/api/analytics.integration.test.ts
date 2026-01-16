import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import analyticsRouter from '../../api/analytics/index';

const app = express();
app.use(express.json());
app.use('/api/analytics', analyticsRouter);

// Mock authentication middleware
vi.mock('../../middleware/authMiddleware', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: 'test-user', role: 'admin' };
    next();
  }
}));

// Mock analytics service
vi.mock('../../services/analytics-service', () => ({
  analyticsService: {
    trackPageView: vi.fn().mockResolvedValue(undefined),
    getOverview: vi.fn().mockResolvedValue({
      totalPageViews: 100,
      uniqueVisitors: 50,
      totalSessions: 75,
      bounceRate: 40,
      avgSessionDuration: 120,
      topPages: [],
      topReferrers: [],
      deviceStats: {},
      countryStats: {},
      chartData: []
    }),
    clearData: vi.fn().mockResolvedValue(undefined)
  }
}));

describe('Analytics API Integration Tests', () => {
  describe('POST /track', () => {
    it('should track page view successfully', async () => {
      const trackingData = {
        sessionId: 'test-session',
        pagePath: '/test-page',
        pageTitle: 'Test Page'
      };

      const response = await request(app)
        .post('/api/analytics/track')
        .send(trackingData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle invalid tracking data', async () => {
      const invalidData = {
        sessionId: '',
        pagePath: ''
      };

      const response = await request(app)
        .post('/api/analytics/track')
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /overview', () => {
    it('should return analytics overview for admin', async () => {
      const response = await request(app)
        .get('/api/analytics/overview?days=7');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalPageViews');
      expect(response.body).toHaveProperty('uniqueVisitors');
    });

    it('should validate days parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/overview?days=500');

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /clear-data', () => {
    it('should clear analytics data for admin', async () => {
      const response = await request(app)
        .delete('/api/analytics/clear-data');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/analytics/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });
});