/**
 * Documentation Section Service
 * Handles hierarchical section management
 */

const db = require('../../db/connection');

class SectionService {
  /**
   * Get all sections as hierarchical tree
   */
  async getSectionTree() {
    const result = await db.query(`
      SELECT * FROM documentation_sections 
      WHERE is_active = true 
      ORDER BY level, order_index, name
    `);
    
    return this.buildTree(result.rows);
  }

  /**
   * Create new section with automatic level calculation
   */
  async createSection(data, userId) {
    let level = 0;
    if (data.parent_id) {
      const parent = await this.getSection(data.parent_id);
      if (!parent) {
        throw new Error('Parent section not found');
      }
      level = parent.level + 1;
    }

    const slug = this.generateSlug(data.name);
    
    const result = await db.query(`
      INSERT INTO documentation_sections 
      (name, slug, description, parent_id, level, order_index, icon, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data.name,
      slug,
      data.description,
      data.parent_id,
      level,
      data.order_index || 0,
      data.icon,
      userId
    ]);
    
    return result.rows[0];
  }

  /**
   * Get section by ID
   */
  async getSection(id) {
    const result = await db.query(`
      SELECT s.*, 
             COUNT(c.id) as content_count,
             u.username as created_by_name
      FROM documentation_sections s
      LEFT JOIN documentation_content c ON s.id = c.section_id AND c.is_published = true
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = $1
      GROUP BY s.id, u.username
    `, [id]);
    
    return result.rows[0];
  }

  /**
   * Update section
   */
  async updateSection(id, data, userId) {
    const result = await db.query(`
      UPDATE documentation_sections 
      SET name = $1, description = $2, icon = $3, order_index = $4,
          updated_at = NOW(), updated_by = $5
      WHERE id = $6
      RETURNING *
    `, [
      data.name,
      data.description,
      data.icon,
      data.order_index,
      userId,
      id
    ]);
    
    return result.rows[0];
  }

  /**
   * Delete section (only if no content)
   */
  async deleteSection(id) {
    // Check if section has content
    const contentCheck = await db.query(`
      SELECT COUNT(*) as count FROM documentation_content WHERE section_id = $1
    `, [id]);
    
    if (parseInt(contentCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete section with existing content');
    }

    // Check if section has children
    const childrenCheck = await db.query(`
      SELECT COUNT(*) as count FROM documentation_sections WHERE parent_id = $1
    `, [id]);
    
    if (parseInt(childrenCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete section with child sections');
    }

    await db.query('DELETE FROM documentation_sections WHERE id = $1', [id]);
    return { success: true };
  }

  /**
   * Move section to new parent
   */
  async moveSection(id, newParentId, newOrderIndex) {
    let newLevel = 0;
    if (newParentId) {
      const parent = await this.getSection(newParentId);
      if (!parent) {
        throw new Error('Parent section not found');
      }
      newLevel = parent.level + 1;
    }

    const result = await db.query(`
      UPDATE documentation_sections 
      SET parent_id = $1, level = $2, order_index = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [newParentId, newLevel, newOrderIndex || 0, id]);

    // Update all children levels recursively
    await this.updateChildrenLevels(id, newLevel);
    
    return result.rows[0];
  }

  /**
   * Get section breadcrumbs
   */
  async getBreadcrumbs(sectionId) {
    const breadcrumbs = [];
    let currentId = sectionId;

    while (currentId) {
      const section = await this.getSection(currentId);
      if (!section) break;
      
      breadcrumbs.unshift({
        id: section.id,
        name: section.name,
        slug: section.slug
      });
      
      currentId = section.parent_id;
    }

    return breadcrumbs;
  }

  /**
   * Build hierarchical tree from flat array
   */
  buildTree(sections, parentId = null) {
    return sections
      .filter(section => section.parent_id === parentId)
      .map(section => ({
        ...section,
        children: this.buildTree(sections, section.id)
      }));
  }

  /**
   * Update children levels recursively
   */
  async updateChildrenLevels(parentId, parentLevel) {
    const children = await db.query(`
      SELECT id FROM documentation_sections WHERE parent_id = $1
    `, [parentId]);

    for (const child of children.rows) {
      await db.query(`
        UPDATE documentation_sections 
        SET level = $1 WHERE id = $2
      `, [parentLevel + 1, child.id]);
      
      // Recursively update grandchildren
      await this.updateChildrenLevels(child.id, parentLevel + 1);
    }
  }

  /**
   * Generate URL-friendly slug
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

module.exports = SectionService;