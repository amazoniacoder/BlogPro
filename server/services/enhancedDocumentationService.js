/**
 * Enhanced Documentation Service
 * Advanced content management with versioning and real-time features
 */

const { pool } = require('../db/connection');

class EnhancedDocumentationService {
  /**
   * Get content with library filtering
   */
  async getContent(libraryType, isPublished = true) {
    try {
      const query = `
        SELECT c.*, s.name as section_name
        FROM documentation_content c
        LEFT JOIN documentation_sections s ON c.section_id = s.id
        WHERE c.library_type = $1 
        ${isPublished ? 'AND c.is_published = true' : ''}
        ORDER BY c.order_index ASC, c.created_at DESC
      `;
      
      const result = await pool.query(query, [libraryType]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

  /**
   * Get sections with library filtering
   */
  async getSections(libraryType, isActive = true) {
    try {
      const query = `
        SELECT * FROM documentation_sections
        WHERE library_type = $1 
        ${isActive ? 'AND is_active = true' : ''}
        ORDER BY level ASC, order_index ASC
      `;
      
      const result = await pool.query(query, [libraryType]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  }

  /**
   * Create new content with automatic versioning
   */
  async createContent(contentData, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO documentation_content 
        (title, slug, content, excerpt, section_id, library_type, is_published, order_index, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        contentData.title,
        contentData.slug,
        contentData.content,
        contentData.excerpt || null,
        contentData.sectionId || null,
        contentData.libraryType,
        contentData.isPublished || false,
        contentData.orderIndex || 0,
        userId,
        userId
      ];

      const result = await client.query(insertQuery, values);
      const newContent = result.rows[0];

      // Create initial version
      await client.query(`
        INSERT INTO documentation_content_versions 
        (content_id, version, title, content, excerpt, created_by)
        VALUES ($1, 1, $2, $3, $4, $5)
      `, [newContent.id, newContent.title, newContent.content, newContent.excerpt, userId]);

      await client.query('COMMIT');
      return newContent;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating content:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update content with automatic versioning
   */
  async updateContent(contentId, contentData, userId) {
    try {
      const updateQuery = `
        UPDATE documentation_content 
        SET title = $1, slug = $2, content = $3, excerpt = $4, 
            section_id = $5, is_published = $6, updated_by = $7, updated_at = NOW()
        WHERE id = $8
        RETURNING *
      `;

      const values = [
        contentData.title,
        contentData.slug,
        contentData.content,
        contentData.excerpt,
        contentData.sectionId,
        contentData.isPublished,
        userId,
        contentId
      ];

      const result = await pool.query(updateQuery, values);
      
      if (result.rows.length === 0) {
        throw new Error('Content not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  /**
   * Delete content and its versions
   */
  async deleteContent(contentId, userId) {
    try {
      // Check if user has permission (implement based on your auth logic)
      const result = await pool.query(
        'DELETE FROM documentation_content WHERE id = $1 RETURNING *',
        [contentId]
      );

      if (result.rows.length === 0) {
        throw new Error('Content not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }

  /**
   * Get content versions
   */
  async getContentVersions(contentId) {
    try {
      const result = await pool.query(
        'SELECT * FROM get_content_versions($1)',
        [contentId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching content versions:', error);
      throw error;
    }
  }

  /**
   * Restore content version
   */
  async restoreContentVersion(contentId, version, userId) {
    try {
      const result = await pool.query(
        'SELECT restore_content_version($1, $2, $3) as success',
        [contentId, version, userId]
      );
      return result.rows[0].success;
    } catch (error) {
      console.error('Error restoring content version:', error);
      throw error;
    }
  }

  /**
   * Compare versions
   */
  async compareVersions(contentId, version1, version2) {
    try {
      const result = await pool.query(`
        SELECT 
          v1.version as version1, v1.title as title1, v1.content as content1, v1.created_at as date1,
          v2.version as version2, v2.title as title2, v2.content as content2, v2.created_at as date2
        FROM documentation_content_versions v1
        CROSS JOIN documentation_content_versions v2
        WHERE v1.content_id = $1 AND v1.version = $2
          AND v2.content_id = $1 AND v2.version = $3
      `, [contentId, version1, version2]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error comparing versions:', error);
      throw error;
    }
  }

  /**
   * Search content
   */
  async searchContent(libraryType, query, limit = 10) {
    try {
      const searchQuery = `
        SELECT c.*, s.name as section_name,
               ts_rank(to_tsvector('english', c.title || ' ' || c.content), plainto_tsquery('english', $2)) as rank
        FROM documentation_content c
        LEFT JOIN documentation_sections s ON c.section_id = s.id
        WHERE c.library_type = $1 
          AND c.is_published = true
          AND (
            c.title ILIKE $3 OR 
            c.content ILIKE $3 OR 
            to_tsvector('english', c.title || ' ' || c.content) @@ plainto_tsquery('english', $2)
          )
        ORDER BY rank DESC, c.title ASC
        LIMIT $4
      `;

      const result = await pool.query(searchQuery, [
        libraryType, 
        query, 
        `%${query}%`, 
        limit
      ]);

      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt || row.content.substring(0, 200) + '...',
        libraryType: row.library_type,
        sectionName: row.section_name,
        rank: parseFloat(row.rank) || 0
      }));
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  }
}

module.exports = new EnhancedDocumentationService();