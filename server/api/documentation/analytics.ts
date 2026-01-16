/**
 * Documentation Search Analytics API Routes
 * Provides search analytics and insights
 */

import express from 'express';
// @ts-ignore - JavaScript service file
import SearchAnalyticsService from '../../services/documentation/SearchAnalyticsService.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = express.Router();

const analyticsService = new SearchAnalyticsService();

/**
 * GET /api/documentation/analytics/popular
 * Get popular search terms
 */
router.get('/popular', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const timeframe = req.query.timeframe as string || '30 days';
    
    const popularSearches = await analyticsService.getPopularSearches(limit, timeframe);
    
    res.json({
      popular_searches: popularSearches,
      timeframe,
      total: popularSearches.length
    });
  } catch (error) {
    console.error('Error getting popular searches:', error);
    res.status(500).json({ error: 'Failed to get popular searches' });
  }
});

/**
 * GET /api/documentation/analytics/trends
 * Get search trends over time
 */
router.get('/trends', requireAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
    const trends = await analyticsService.getSearchTrends(days);
    
    res.json({
      trends,
      period_days: days,
      total_days: trends.length
    });
  } catch (error) {
    console.error('Error getting search trends:', error);
    res.status(500).json({ error: 'Failed to get search trends' });
  }
});

/**
 * GET /api/documentation/analytics/metrics
 * Get overall search performance metrics
 */
router.get('/metrics', requireAuth, async (req, res) => {
  try {
    const timeframe = req.query.timeframe as string || '7 days';
    
    const metrics = await analyticsService.getSearchMetrics(timeframe);
    
    res.json(metrics);
  } catch (error) {
    console.error('Error getting search metrics:', error);
    res.status(500).json({ error: 'Failed to get search metrics' });
  }
});

/**
 * GET /api/documentation/analytics/zero-results
 * Get searches that returned no results
 */
router.get('/zero-results', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const zeroResults = await analyticsService.getZeroResultSearches(limit);
    
    res.json({
      zero_result_searches: zeroResults,
      total: zeroResults.length,
      description: 'Queries that returned no results - potential content gaps'
    });
  } catch (error) {
    console.error('Error getting zero-result searches:', error);
    res.status(500).json({ error: 'Failed to get zero-result searches' });
  }
});

/**
 * GET /api/documentation/analytics/content
 * Get most searched content
 */
router.get('/content', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const mostSearched = await analyticsService.getMostSearchedContent(limit);
    
    res.json({
      most_searched_content: mostSearched,
      total: mostSearched.length
    });
  } catch (error) {
    console.error('Error getting most searched content:', error);
    res.status(500).json({ error: 'Failed to get most searched content' });
  }
});

/**
 * GET /api/documentation/analytics/suggestions
 * Get search suggestions based on analytics
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query } = req.query;
    const limit = parseInt(req.query.limit as string) || 5;
    
    if (!query || (query as string).length < 2) {
      return res.json([]);
    }
    
    const suggestions = await analyticsService.getSearchSuggestions(query as string, limit);
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting analytics-based suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

/**
 * POST /api/documentation/analytics/cleanup
 * Clean up old analytics data
 */
router.post('/cleanup', requireAuth, async (req, res) => {
  try {
    const retentionDays = parseInt(req.body.retention_days) || 365;
    
    const result = await analyticsService.cleanupOldData(retentionDays);
    
    res.json({
      message: 'Analytics data cleanup completed',
      ...result
    });
  } catch (error) {
    console.error('Error cleaning up analytics data:', error);
    res.status(500).json({ error: 'Failed to cleanup analytics data' });
  }
});

/**
 * GET /api/documentation/analytics/dashboard
 * Get comprehensive analytics dashboard data
 */
router.get('/dashboard', requireAuth, async (_, res) => {
  try {
    const [
      metrics,
      popularSearches,
      trends,
      zeroResults,
      mostSearchedContent
    ] = await Promise.all([
      analyticsService.getSearchMetrics('7 days'),
      analyticsService.getPopularSearches(5, '30 days'),
      analyticsService.getSearchTrends(7),
      analyticsService.getZeroResultSearches(5),
      analyticsService.getMostSearchedContent(5)
    ]);
    
    res.json({
      overview: metrics,
      popular_searches: popularSearches,
      recent_trends: trends,
      zero_result_searches: zeroResults,
      most_searched_content: mostSearchedContent,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting analytics dashboard:', error);
    res.status(500).json({ error: 'Failed to get analytics dashboard' });
  }
});

export default router;