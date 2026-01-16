// server/services/menuService.ts
import { pool } from '../db/db';
import { DocumentationCategory } from './documentationService';

export interface MenuItem {
  id: number;
  title: string;
  url?: string;
  parent_id?: number;
  order_index: number;
  is_active: boolean;
  target: '_self' | '_blank';
  icon?: string;
  type: 'manual' | 'documentation' | 'category';
  created_at: string;
  updated_at: string;
  children?: MenuItem[];
  level?: number;
}

// Transform database row to MenuItem interface
const transformMenuItem = (row: any): MenuItem => ({
  id: row.id,
  title: row.title,
  url: row.url,
  parent_id: row.parent_id,
  order_index: row.order_index,
  is_active: row.is_active,
  target: row.target,
  icon: row.icon,
  type: row.type || 'manual',
  created_at: row.created_at,
  updated_at: row.updated_at
});

// Transform frontend data to database format
const transformToDbFormat = (data: any) => ({
  title: data.title,
  url: data.url || null,
  parent_id: data.parent_id || data.parentId || null,
  order_index: data.order_index || data.orderIndex || 0,
  is_active: data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true),
  target: data.target || '_self',
  icon: data.icon || null,
  type: data.type || 'manual'
});

// Build hierarchical menu structure
const buildMenuTree = (items: MenuItem[]): MenuItem[] => {
  const itemMap = new Map<number, MenuItem>();
  const rootItems: MenuItem[] = [];

  // Create map of all items
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Build hierarchy
  items.forEach(item => {
    const menuItem = itemMap.get(item.id)!;
    
    if (item.parent_id) {
      const parent = itemMap.get(item.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(menuItem);
      }
    } else {
      rootItems.push(menuItem);
    }
  });

  // Sort by order_index
  const sortItems = (items: MenuItem[]) => {
    items.sort((a, b) => a.order_index - b.order_index);
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        sortItems(item.children);
      }
    });
  };

  sortItems(rootItems);
  return rootItems;
};

export const menuService = {
  // Get all menu items with hierarchy
  async getMenuTree(): Promise<MenuItem[]> {
    const result = await pool.query(`
      SELECT * FROM menu_items 
      WHERE is_active = true 
      ORDER BY order_index ASC
    `);
    const items = result.rows.map(transformMenuItem);
    return buildMenuTree(items);
  },

  // Get all menu items (flat list for admin)
  async getAllMenuItems(): Promise<MenuItem[]> {
    const result = await pool.query(`
      SELECT * FROM menu_items 
      ORDER BY COALESCE(parent_id, 0), order_index ASC
    `);
    return result.rows.map(transformMenuItem);
  },

  // Get menu item by ID
  async getById(id: number): Promise<MenuItem | null> {
    const result = await pool.query('SELECT * FROM menu_items WHERE id = $1', [id]);
    return result.rows[0] ? transformMenuItem(result.rows[0]) : null;
  },

  // Get category by ID (for documentation service integration)
  async getCategoryById(id: number): Promise<DocumentationCategory | null> {
    const result = await pool.query('SELECT * FROM documentation_categories WHERE id = $1', [id]);
    return result.rows[0] ? {
      id: result.rows[0].id,
      name: result.rows[0].name,
      slug: result.rows[0].slug,
      description: result.rows[0].description,
      icon: result.rows[0].icon,
      order_index: result.rows[0].order_index,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at
    } : null;
  },

  // Create new menu item
  async create(data: Partial<MenuItem>): Promise<MenuItem> {
    const dbData = transformToDbFormat(data);
    const result = await pool.query(`
      INSERT INTO menu_items (title, url, parent_id, order_index, is_active, target, icon, type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      dbData.title,
      dbData.url,
      dbData.parent_id,
      dbData.order_index,
      dbData.is_active,
      dbData.target,
      dbData.icon,
      dbData.type
    ]);
    return transformMenuItem(result.rows[0]);
  },

  // Update menu item
  async update(id: number, data: Partial<MenuItem>): Promise<MenuItem> {
    const dbData = transformToDbFormat(data);
    const result = await pool.query(`
      UPDATE menu_items 
      SET title = $2, url = $3, parent_id = $4, order_index = $5, 
          is_active = $6, target = $7, icon = $8, type = $9
      WHERE id = $1
      RETURNING *
    `, [
      id,
      dbData.title,
      dbData.url,
      dbData.parent_id,
      dbData.order_index,
      dbData.is_active,
      dbData.target,
      dbData.icon,
      dbData.type
    ]);
    return transformMenuItem(result.rows[0]);
  },

  // Delete menu item
  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM menu_items WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },

  // Find menu item by slug (derived from URL)
  async findBySlug(slug: string): Promise<MenuItem | null> {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE url = $1 OR url = $2',
      [`/${slug}`, `/documentation/${slug}`]
    );
    return result.rows[0] ? transformMenuItem(result.rows[0]) : null;
  },

  // Find or create menu item
  async findOrCreate(data: Partial<MenuItem>): Promise<MenuItem> {
    if (data.url) {
      const existing = await this.findBySlug(data.url.replace('/', ''));
      if (existing) {
        return existing;
      }
    }
    return await this.create(data);
  },

  // Get next order index for a parent
  async getNextOrderIndex(parentId?: number): Promise<number> {
    const result = await pool.query(
      'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM menu_items WHERE parent_id = $1',
      [parentId || null]
    );
    return result.rows[0].next_order;
  },

  // Reorder menu items
  async reorder(items: { id: number; order_index: number; parent_id?: number }[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const item of items) {
        await client.query(
          'UPDATE menu_items SET order_index = $2, parent_id = $3 WHERE id = $1',
          [item.id, item.order_index, item.parent_id || null]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};