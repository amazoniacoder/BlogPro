/**
 * Text Editor Analytics API Endpoints
 * 
 * Server-side analytics collection and reporting for text editor plugin.
 * Routes: /api/editor-analytics/*
 */

import { Router } from 'express';
import { pool } from '../db/db';

const router = Router();

/**
 * Store analytics events
 */
router.post('/events', async (req, res) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Invalid events data' });
    }

    // Check if table exists first
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'editor_analytics'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.warn('Editor analytics table does not exist, skipping storage');
      return res.json({ success: true, processed: events.length, warning: 'Table not created yet' });
    }

    // Insert events into database
    const insertQuery = `
      INSERT INTO editor_analytics (session_id, user_id, event_type, timestamp, data, metadata)
      VALUES ($1, $2, $3, to_timestamp($4/1000), $5, $6)
    `;

    for (const event of events) {
      await pool.query(insertQuery, [
        event.sessionId,
        event.userId || null,
        event.eventType,
        event.timestamp,
        JSON.stringify(event.data),
        JSON.stringify(event.metadata)
      ]);
    }

    res.json({ success: true, processed: events.length });
  } catch (error) {
    console.error('Analytics storage error:', error);
    res.status(500).json({ error: 'Failed to store analytics' });
  }
});

/**
 * Store performance metrics
 */
router.post('/performance', async (req, res) => {
  try {
    const { metrics } = req.body;
    
    if (!Array.isArray(metrics)) {
      return res.status(400).json({ error: 'Invalid metrics data' });
    }

    // Check if table exists first
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'editor_performance_metrics'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.warn('Editor performance metrics table does not exist, skipping storage');
      return res.json({ success: true, processed: metrics.length, warning: 'Table not created yet' });
    }

    const insertQuery = `
      INSERT INTO editor_performance_metrics (session_id, operation_type, duration_ms, memory_usage_kb, timestamp, metadata)
      VALUES ($1, $2, $3, $4, to_timestamp($5/1000), $6)
    `;

    for (const metric of metrics) {
      await pool.query(insertQuery, [
        metric.sessionId || 'unknown',
        metric.operation,
        metric.duration,
        metric.metadata?.memoryUsage ? Math.round(metric.metadata.memoryUsage / 1024) : null,
        metric.timestamp,
        JSON.stringify(metric.metadata || {})
      ]);
    }

    res.json({ success: true, processed: metrics.length });
  } catch (error) {
    console.error('Performance metrics storage error:', error);
    res.status(500).json({ error: 'Failed to store performance metrics' });
  }
});

/**
 * Get analytics dashboard data
 */
router.get('/dashboard/:timeRange', async (req, res) => {
  try {
    const { timeRange } = req.params;
    const intervals = {
      'hour': '1 hour',
      'day': '1 day', 
      'week': '7 days',
      'month': '30 days'
    };

    const interval = intervals[timeRange as keyof typeof intervals] || '1 day';

    // Check if tables exist
    const tablesCheck = await pool.query(`
      SELECT 
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'editor_performance_metrics')) as perf_exists,
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'editor_analytics')) as analytics_exists
    `);
    
    const { perf_exists, analytics_exists } = tablesCheck.rows[0];
    
    let performanceData = { rows: [] };
    let eventsData = { rows: [] };
    
    if (perf_exists) {
      const performanceQuery = `
        SELECT 
          operation_type,
          COUNT(*) as total_operations,
          AVG(duration_ms) as avg_duration,
          MAX(duration_ms) as max_duration,
          AVG(memory_usage_kb) as avg_memory
        FROM editor_performance_metrics 
        WHERE timestamp >= NOW() - INTERVAL '${interval}'
        GROUP BY operation_type
        ORDER BY avg_duration DESC
      `;
      performanceData = await pool.query(performanceQuery);
    }
    
    if (analytics_exists) {
      const eventsQuery = `
        SELECT 
          event_type,
          COUNT(*) as count
        FROM editor_analytics 
        WHERE timestamp >= NOW() - INTERVAL '${interval}'
        GROUP BY event_type
      `;
      eventsData = await pool.query(eventsQuery);
    }

    res.json({
      timeRange,
      performance: performanceData.rows,
      events: eventsData.rows,
      tablesExist: { perf_exists, analytics_exists },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to generate dashboard data' });
  }
});

export default router;