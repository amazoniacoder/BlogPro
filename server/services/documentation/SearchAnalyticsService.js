/**
 * Search Analytics Service
 * Tracks and analyzes search behavior
 */

import { pool as db } from '../../db/db.js';

class SearchAnalyticsService {
  /**
   * Track search query
   */
  async trackSearch(query, userId, resultsCount, filters = {}) {
    try {
      await db.query(`
        INSERT INTO documentation_search_analytics 
        (query, user_id, results_count, filters, created_at)
        VALUES ($1, $2, $3, $4, NOW())
      `, [query, userId, resultsCount, JSON.stringify(filters)]);
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearches(limit = 10, timeframe = '30 days') {
    const result = await db.query(`
      SELECT 
        query,
        COUNT(*) as search_count,
        AVG(results_count) as avg_results,
        MAX(created_at) as last_searched
      FROM documentation_search_analytics 
      WHERE created_at >= NOW() - INTERVAL '${timeframe}'
        AND query IS NOT NULL 
        AND query != ''
      GROUP BY query
      ORDER BY search_count DESC, last_searched DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  }

  /**
   * Get search trends over time
   */
  async getSearchTrends(days = 30) {
    const result = await db.query(`
      SELECT 
        DATE(created_at) as search_date,
        COUNT(*) as search_count,
        COUNT(DISTINCT query) as unique_queries,
        AVG(results_count) as avg_results
      FROM documentation_search_analytics 
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY search_date DESC
    `);
    
    return result.rows;
  }

  /**
   * Get zero-result searches (queries that returned no results)
   */
  async getZeroResultSearches(limit = 20) {
    const result = await db.query(`
      SELECT 
        query,
        COUNT(*) as frequency,
        MAX(created_at) as last_searched
      FROM documentation_search_analytics 
      WHERE results_count = 0
        AND query IS NOT NULL 
        AND query != ''
      GROUP BY query
      ORDER BY frequency DESC, last_searched DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  }

  /**
   * Get search performance metrics
   */
  async getSearchMetrics(timeframe = '7 days') {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_searches,
        COUNT(DISTINCT query) as unique_queries,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(results_count) as avg_results_per_search,
        COUNT(CASE WHEN results_count = 0 THEN 1 END) as zero_result_searches,
        COUNT(CASE WHEN results_count > 0 THEN 1 END) as successful_searches
      FROM documentation_search_analytics 
      WHERE created_at >= NOW() - INTERVAL '${timeframe}'
    `);
    
    const metrics = result.rows[0];
    
    // Calculate success rate
    const totalSearches = parseInt(metrics.total_searches);
    const successfulSearches = parseInt(metrics.successful_searches);
    const successRate = totalSearches > 0 ? (successfulSearches / totalSearches) * 100 : 0;
    
    return {
      ...metrics,
      success_rate: Math.round(successRate * 100) / 100,
      timeframe
    };
  }

  /**
   * Get most searched content
   */
  async getMostSearchedContent(limit = 10) {
    const result = await db.query(`
      SELECT 
        c.id,
        c.title,
        c.slug,
        c.section_id,
        s.name as section_name,
        COUNT(sa.id) as search_mentions
      FROM documentation_content c
      LEFT JOIN documentation_sections s ON c.section_id = s.id
      LEFT JOIN documentation_search_analytics sa ON (
        sa.query ILIKE '%' || c.title || '%' OR
        c.title ILIKE '%' || sa.query || '%'
      )
      WHERE c.is_published = true
      GROUP BY c.id, c.title, c.slug, c.section_id, s.name
      HAVING COUNT(sa.id) > 0
      ORDER BY search_mentions DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  }

  /**
   * Get search suggestions based on analytics
   */
  async getSearchSuggestions(partialQuery, limit = 5) {
    const result = await db.query(`
      SELECT DISTINCT 
        query,
        search_count,
        avg_results
      FROM (
        SELECT 
          query,
          COUNT(*) as search_count,
          AVG(results_count) as avg_results
        FROM documentation_search_analytics 
        WHERE query ILIKE $1
          AND results_count > 0
          AND created_at >= NOW() - INTERVAL '90 days'
        GROUP BY query
      ) popular_queries
      ORDER BY search_count DESC, avg_results DESC
      LIMIT $2
    `, [`%${partialQuery}%`, limit]);
    
    return result.rows;
  }

  /**
   * Clean old analytics data
   */
  async cleanupOldData(retentionDays = 365) {
    const result = await db.query(`
      DELETE FROM documentation_search_analytics 
      WHERE created_at < NOW() - INTERVAL '${retentionDays} days'
    `);
    
    return {
      deleted_records: result.rowCount,
      retention_days: retentionDays
    };
  }
}

export default SearchAnalyticsService;