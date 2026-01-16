/**
 * Documentation Menu Service
 * Handles dynamic menu generation and management
 */

const db = require('../../db/connection');

class MenuService {
  /**
   * Generate menu from sections and content automatically
   */
  async generateMenu() {
    const sections = await db.query(`
      SELECT s.*, COUNT(c.id) as content_count
      FROM documentation_sections s
      LEFT JOIN documentation_content c ON s.id = c.section_id AND c.is_published = true
      WHERE s.is_active = true
      GROUP BY s.id
      ORDER BY s.level, s.order_index
    `);
    
    const content = await db.query(`
      SELECT * FROM documentation_content 
      WHERE is_published = true 
      ORDER BY section_id, order_index, title
    `);
    
    return this.buildMenuStructure(sections.rows, content.rows);
  }

  /**
   * Get custom menu structure
   */
  async getCustomMenu() {
    const menuItems = await db.query(`
      SELECT * FROM documentation_menu 
      WHERE is_active = true 
      ORDER BY level, order_index
    `);
    
    return this.buildTree(menuItems.rows);
  }

  /**
   * Create custom menu item
   */
  async createMenuItem(data) {
    let level = 0;
    if (data.parent_id) {
      const parent = await this.getMenuItem(data.parent_id);
      if (parent) {
        level = parent.level + 1;
      }
    }

    const result = await db.query(`
      INSERT INTO documentation_menu 
      (title, url, content_id, section_id, parent_id, level, order_index, icon, target)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      data.title,
      data.url,
      data.content_id,
      data.section_id,
      data.parent_id,
      level,
      data.order_index || 0,
      data.icon,
      data.target || '_self'
    ]);
    
    return result.rows[0];
  }

  /**
   * Update menu item
   */
  async updateMenuItem(id, data) {
    const result = await db.query(`
      UPDATE documentation_menu 
      SET title = $1, url = $2, content_id = $3, section_id = $4,
          order_index = $5, icon = $6, target = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [
      data.title,
      data.url,
      data.content_id,
      data.section_id,
      data.order_index,
      data.icon,
      data.target,
      id
    ]);
    
    return result.rows[0];
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(id) {
    await db.query('DELETE FROM documentation_menu WHERE id = $1', [id]);
    return { success: true };
  }

  /**
   * Get menu item by ID
   */
  async getMenuItem(id) {
    const result = await db.query(`
      SELECT * FROM documentation_menu WHERE id = $1
    `, [id]);
    
    return result.rows[0];
  }

  /**
   * Build menu structure from sections and content
   */
  buildMenuStructure(sections, content) {
    const menu = [];
    
    // Build section-based menu
    const sectionTree = this.buildTree(sections);
    
    for (const section of sectionTree) {
      const menuItem = {
        id: `section_${section.id}`,
        title: section.name,
        url: `/docs/section/${section.slug}`,
        type: 'section',
        icon: section.icon,
        children: []
      };
      
      // Add content items for this section
      const sectionContent = content.filter(c => c.section_id === section.id);
      for (const contentItem of sectionContent) {
        menuItem.children.push({
          id: `content_${contentItem.id}`,
          title: contentItem.title,
          url: `/docs/${contentItem.slug}`,
          type: 'content',
          excerpt: contentItem.excerpt
        });
      }
      
      // Add child sections recursively
      if (section.children && section.children.length > 0) {
        const childMenuItems = this.buildMenuStructure(section.children, content);
        menuItem.children.push(...childMenuItems);
      }
      
      menu.push(menuItem);
    }
    
    return menu;
  }

  /**
   * Build hierarchical tree from flat array
   */
  buildTree(items, parentId = null) {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: this.buildTree(items, item.id)
      }));
  }

  /**
   * Move menu item to new position
   */
  async moveMenuItem(id, newParentId, newOrderIndex) {
    let newLevel = 0;
    if (newParentId) {
      const parent = await this.getMenuItem(newParentId);
      if (parent) {
        newLevel = parent.level + 1;
      }
    }

    const result = await db.query(`
      UPDATE documentation_menu 
      SET parent_id = $1, level = $2, order_index = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [newParentId, newLevel, newOrderIndex || 0, id]);

    return result.rows[0];
  }

  /**
   * Get breadcrumb trail for menu item
   */
  async getMenuBreadcrumbs(menuId) {
    const breadcrumbs = [];
    let currentId = menuId;

    while (currentId) {
      const item = await this.getMenuItem(currentId);
      if (!item) break;
      
      breadcrumbs.unshift({
        id: item.id,
        title: item.title,
        url: item.url
      });
      
      currentId = item.parent_id;
    }

    return breadcrumbs;
  }
}

module.exports = MenuService;