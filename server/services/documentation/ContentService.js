/**
 * Documentation Content Service
 * Handles CRUD operations for documentation content
 */

const db = require('../../db/connection');

class ContentService {
  /**
   * Create new documentation content
   */
  async createContent(data, userId) {
    const slug = this.generateSlug(data.title);
    
    const result = await db.query(`
      INSERT INTO documentation_content 
      (title, slug, content, content_type, section_id, excerpt, is_published, 
       meta_title, meta_description, tags, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      data.title,
      slug,
      data.content,
      data.content_type || 'markdown',
      data.section_id,
      data.excerpt || this.generateExcerpt(data.content),
      data.is_published || false,
      data.meta_title || data.title,
      data.meta_description || data.excerpt,
      data.tags || [],
      userId
    ]);
    
    return result.rows[0];
  }

  /**
   * Get content by ID with section info
   */
  async getContent(id) {
    const result = await db.query(`
      SELECT c.*, s.name as section_name, s.slug as section_slug,
             u.username as created_by_name
      FROM documentation_content c
      LEFT JOIN documentation_sections s ON c.section_id = s.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1
    `, [id]);
    
    return result.rows[0];
  }

  /**
   * Get content by slug
   */
  async getContentBySlug(slug) {
    const result = await db.query(`
      SELECT c.*, s.name as section_name, s.slug as section_slug
      FROM documentation_content c
      LEFT JOIN documentation_sections s ON c.section_id = s.id
      WHERE c.slug = $1 AND c.is_published = true
    `, [slug]);
    
    return result.rows[0];
  }

  /**
   * Get all published content
   */
  async getAllContent(filters = {}) {
    let query = `
      SELECT c.id, c.title, c.slug, c.excerpt, c.section_id, c.tags,
             c.created_at, c.updated_at, s.name as section_name
      FROM documentation_content c
      LEFT JOIN documentation_sections s ON c.section_id = s.id
      WHERE c.is_published = true
    `;
    
    const params = [];
    let paramIndex = 1;

    if (filters.section_id) {
      query += ` AND c.section_id = $${paramIndex}`;
      params.push(filters.section_id);
      paramIndex++;
    }

    if (filters.content_type) {
      query += ` AND c.content_type = $${paramIndex}`;
      params.push(filters.content_type);
      paramIndex++;
    }

    query += ` ORDER BY c.section_id, c.order_index, c.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Update content
   */
  async updateContent(id, data, userId) {
    const result = await db.query(`
      UPDATE documentation_content 
      SET title = $1, content = $2, content_type = $3, section_id = $4,
          excerpt = $5, is_published = $6, meta_title = $7, meta_description = $8,
          tags = $9, updated_at = NOW(), updated_by = $10
      WHERE id = $11
      RETURNING *
    `, [
      data.title,
      data.content,
      data.content_type,
      data.section_id,
      data.excerpt || this.generateExcerpt(data.content),
      data.is_published,
      data.meta_title || data.title,
      data.meta_description || data.excerpt,
      data.tags || [],
      userId,
      id
    ]);
    
    return result.rows[0];
  }

  /**
   * Delete content
   */
  async deleteContent(id) {
    await db.query('DELETE FROM documentation_content WHERE id = $1', [id]);
    return { success: true };
  }

  /**
   * Generate URL-friendly slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate excerpt from content
   */
  generateExcerpt(content, maxLength = 160) {
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength - 3) + '...'
      : textContent;
  }
}

module.exports = ContentService;