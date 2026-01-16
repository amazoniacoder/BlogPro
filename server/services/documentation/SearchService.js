/**
 * Documentation Search Service
 * Handles full-text search and filtering
 */

const db = require('../../db/connection');

class SearchService {
  /**
   * Multi-faceted search with full-text capabilities
   */
  async search(query, filters = {}) {
    let searchQuery = `
      SELECT 
        c.id,
        c.title,
        c.slug,
        c.excerpt,
        c.content_type,
        c.tags,
        c.created_at,
        c.updated_at,
        s.name as section_name,
        s.slug as section_slug,
        ts_rank(c.search_vector, plainto_tsquery('english', $1)) as rank,
        ts_headline('english', c.content, plainto_tsquery('english', $1), 
          'MaxWords=35, MinWords=15, ShortWord=3, HighlightAll=FALSE, MaxFragments=2'
        ) as highlight
      FROM documentation_content c
      LEFT JOIN documentation_sections s ON c.section_id = s.id
      WHERE c.is_published = true
    `;
    
    const params = [query || ''];
    let paramIndex = 2;
    
    // Add full-text search condition
    if (query && query.trim()) {
      searchQuery += ` AND c.search_vector @@ plainto_tsquery('english', $1)`;
    }
    
    // Add section filter
    if (filters.section_id) {
      searchQuery += ` AND c.section_id = $${paramIndex}`;
      params.push(filters.section_id);
      paramIndex++;
    }
    
    // Add content type filter
    if (filters.content_type) {
      searchQuery += ` AND c.content_type = $${paramIndex}`;
      params.push(filters.content_type);
      paramIndex++;
    }
    
    // Add tags filter
    if (filters.tags && filters.tags.length > 0) {
      searchQuery += ` AND c.tags && $${paramIndex}`;
      params.push(filters.tags);
      paramIndex++;
    }
    
    // Order by relevance if query provided, otherwise by date
    if (query && query.trim()) {
      searchQuery += ` ORDER BY rank DESC, c.updated_at DESC`;
    } else {
      searchQuery += ` ORDER BY c.updated_at DESC`;
    }
    
    searchQuery += ` LIMIT 50`;
    
    const result = await db.query(searchQuery, params);
    return result.rows;
  }

  /**
   * Get auto-complete suggestions
   */
  async getSuggestions(query) {
    if (!query || query.length < 2) {
      return [];
    }

    const result = await db.query(`
      SELECT DISTINCT title, slug
      FROM documentation_content
      WHERE title ILIKE $1 AND is_published = true
      ORDER BY title
      LIMIT 10
    `, [`%${query}%`]);
    
    return result.rows;
  }

  /**
   * Search within specific section
   */
  async searchInSection(sectionId, query) {
    const result = await db.query(`
      SELECT 
        c.*,
        ts_rank(c.search_vector, plainto_tsquery('english', $2)) as rank,
        ts_headline('english', c.content, plainto_tsquery('english', $2)) as highlight
      FROM documentation_content c
      WHERE c.section_id = $1 
        AND c.is_published = true
        AND c.search_vector @@ plainto_tsquery('english', $2)
      ORDER BY rank DESC, c.updated_at DESC
      LIMIT 20
    `, [sectionId, query]);
    
    return result.rows;
  }

  /**
   * Get popular search terms (for analytics)
   */
  async getPopularSearches(limit = 10) {
    // This would require a search_analytics table
    // For now, return empty array
    return [];
  }

  /**
   * Get related content based on tags
   */
  async getRelatedContent(contentId, limit = 5) {
    const result = await db.query(`
      WITH current_content AS (
        SELECT tags FROM documentation_content WHERE id = $1
      )
      SELECT 
        c.id,
        c.title,
        c.slug,
        c.excerpt,
        s.name as section_name
      FROM documentation_content c
      LEFT JOIN documentation_sections s ON c.section_id = s.id
      CROSS JOIN current_content cc
      WHERE c.id != $1 
        AND c.is_published = true
        AND c.tags && cc.tags
      ORDER BY 
        array_length(array(SELECT unnest(c.tags) INTERSECT SELECT unnest(cc.tags)), 1) DESC,
        c.updated_at DESC
      LIMIT $2
    `, [contentId, limit]);
    
    return result.rows;
  }

  /**
   * Advanced search with multiple criteria
   */
  async advancedSearch(criteria) {
    let query = `
      SELECT 
        c.*,
        s.name as section_name,
        s.slug as section_slug
      FROM documentation_content c
      LEFT JOIN documentation_sections s ON c.section_id = s.id
      WHERE c.is_published = true
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Title search
    if (criteria.title) {
      query += ` AND c.title ILIKE $${paramIndex}`;
      params.push(`%${criteria.title}%`);
      paramIndex++;
    }
    
    // Content search
    if (criteria.content) {
      query += ` AND c.search_vector @@ plainto_tsquery('english', $${paramIndex})`;
      params.push(criteria.content);
      paramIndex++;
    }
    
    // Date range
    if (criteria.date_from) {
      query += ` AND c.created_at >= $${paramIndex}`;
      params.push(criteria.date_from);
      paramIndex++;
    }
    
    if (criteria.date_to) {
      query += ` AND c.created_at <= $${paramIndex}`;
      params.push(criteria.date_to);
      paramIndex++;
    }
    
    // Author search
    if (criteria.author) {
      query += ` AND EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = c.created_by 
        AND u.username ILIKE $${paramIndex}
      )`;
      params.push(`%${criteria.author}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY c.updated_at DESC LIMIT 50`;
    
    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = SearchService;