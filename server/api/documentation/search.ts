/**
 * Documentation Search API
 * 
 * Advanced search functionality with filters and full-text search.
 */

import { Router } from 'express';
import { requireAdmin } from '../../middleware/authMiddleware';
import { pool } from '../../db/db';

const router = Router();

/**
 * Search documentation content
 */
router.get('/', async (req, res) => {
  try {
    const { q: query, lang = 'en', limit = 10 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const { searchService } = await import('../../services/searchService');
    const results = await searchService.searchDocumentation(
      query,
      lang as 'en' | 'ru',
      parseInt(limit as string)
    );
    
    res.json({
      results,
      total: results.length,
      query,
      language: lang
    });
  } catch (error) {
    console.error('Documentation search error:', error);
    res.status(500).json({ error: 'Documentation search failed' });
  }
});

/**
 * Get search suggestions
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || typeof query !== 'string' || query.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const suggestionQuery = `
      SELECT DISTINCT 
        title,
        'content' as type
      FROM documentation_content 
      WHERE title ILIKE $1 
        AND is_published = true
      UNION
      SELECT DISTINCT 
        filename as title,
        'file' as type
      FROM documentation_files 
      WHERE filename ILIKE $1
        AND is_synced = true
      ORDER BY title
      LIMIT 10
    `;
    
    const result = await pool.query(suggestionQuery, [`%${query}%`]);
    
    res.json({
      suggestions: result.rows
    });
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

/**
 * Rebuild search index
 */
router.post('/index/rebuild', requireAdmin, async (_req, res) => {
  try {
    // Clear existing search index
    await pool.query('DELETE FROM documentation_search_index');
    
    // Rebuild from content
    const rebuildQuery = `
      INSERT INTO documentation_search_index (content_id, title, content_text, search_vector)
      SELECT 
        id,
        title,
        content,
        to_tsvector('russian', title || ' ' || content)
      FROM documentation_content
      WHERE is_published = true
    `;
    
    await pool.query(rebuildQuery);
    
    // Get count of indexed items
    const countResult = await pool.query('SELECT COUNT(*) FROM documentation_search_index');
    const indexedCount = countResult.rows[0].count;
    
    res.json({
      message: 'Search index rebuilt successfully',
      indexedItems: parseInt(indexedCount)
    });
  } catch (error) {
    console.error('Error rebuilding search index:', error);
    res.status(500).json({ error: 'Failed to rebuild search index' });
  }
});

/**
 * Get search statistics
 */
router.get('/stats', requireAdmin, async (_req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM documentation_content WHERE is_published = true) as published_content,
        (SELECT COUNT(*) FROM documentation_files WHERE is_synced = true) as synced_files,
        (SELECT COUNT(*) FROM documentation_search_index) as indexed_items,
        (SELECT COUNT(DISTINCT section_id) FROM documentation_content WHERE section_id IS NOT NULL) as sections_with_content
    `;
    
    const result = await pool.query(statsQuery);
    
    res.json({
      stats: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting search stats:', error);
    res.status(500).json({ error: 'Failed to get search statistics' });
  }
});

export default router;