/**
 * Documentation Menu API
 * 
 * API endpoints for managing hierarchical menu structure.
 */

import { Router } from 'express';
import { requireAdmin } from '../../middleware/authMiddleware';
import { pool } from '../../db/db';

const router = Router();

interface MenuItem {
  id: string;
  title: string;
  url?: string;
  content_id?: string;
  section_id?: string;
  parent_id?: string;
  level: number;
  order_index: number;
  icon?: string;
  is_active: boolean;
  target: string;
  children?: MenuItem[];
}

/**
 * Get hierarchical menu structure
 */
router.get('/', async (_req, res) => {
  try {
    const query = `
      SELECT * FROM documentation_menu 
      WHERE is_active = true 
      ORDER BY level, order_index, title
    `;
    
    const result = await pool.query(query);
    const menuItems = buildMenuHierarchy(result.rows);
    
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

/**
 * Create menu item
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      title,
      url,
      content_id,
      section_id,
      parent_id,
      order_index,
      icon,
      target
    } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const level = parent_id ? await calculateMenuLevel(parent_id) + 1 : 0;
    
    const query = `
      INSERT INTO documentation_menu 
      (title, url, content_id, section_id, parent_id, level, order_index, icon, target)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title,
      url,
      content_id,
      section_id,
      parent_id,
      level,
      order_index || 0,
      icon,
      target || '_self'
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

/**
 * Update menu item
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, icon, order_index, target, is_active } = req.body;
    
    const query = `
      UPDATE documentation_menu 
      SET title = $2, url = $3, icon = $4, order_index = $5, target = $6, is_active = $7
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      id,
      title,
      url,
      icon,
      order_index,
      target,
      is_active
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

/**
 * Delete menu item
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `DELETE FROM documentation_menu WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

/**
 * Reorder menu items
 */
router.post('/reorder', requireAdmin, async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }
    
    // Update order_index for each menu item
    for (const item of items) {
      const query = `
        UPDATE documentation_menu 
        SET order_index = $2, parent_id = $3, level = $4
        WHERE id = $1
      `;
      
      await pool.query(query, [
        item.id,
        item.order_index,
        item.parent_id,
        item.level
      ]);
    }
    
    res.json({ message: 'Menu items reordered successfully' });
  } catch (error) {
    console.error('Error reordering menu items:', error);
    res.status(500).json({ error: 'Failed to reorder menu items' });
  }
});

/**
 * Helper function to build menu hierarchy
 */
function buildMenuHierarchy(menuItems: MenuItem[]): MenuItem[] {
  const itemMap = new Map<string, MenuItem>();
  const rootItems: MenuItem[] = [];
  
  // Create map and initialize children arrays
  menuItems.forEach(item => {
    item.children = [];
    itemMap.set(item.id, item);
  });
  
  // Build hierarchy
  menuItems.forEach(item => {
    if (item.parent_id) {
      const parent = itemMap.get(item.parent_id);
      if (parent) {
        parent.children!.push(item);
      }
    } else {
      rootItems.push(item);
    }
  });
  
  return rootItems;
}

/**
 * Helper function to calculate menu level
 */
async function calculateMenuLevel(parentId: string): Promise<number> {
  const query = `SELECT level FROM documentation_menu WHERE id = $1`;
  const result = await pool.query(query, [parentId]);
  return result.rows[0]?.level || 0;
}

export default router;