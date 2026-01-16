import { Router } from 'express';
import { db } from '../../db/connection';
import { requireAuth, requireAdmin } from '../../middleware/authMiddleware';
import { ProductCategory } from '../../../shared/types/product-category';
import { broadcastToAll } from '../../websocket';

const router = Router();

// Get all categories (tree structure)
router.get('/', async (_req, res) => {
  try {
    const categories = await db.query(`
      SELECT * FROM product_categories 
      WHERE is_active = true 
      ORDER BY sort_order ASC, name ASC
    `);
    
    // Build tree structure
    const categoryMap = new Map();
    const rootCategories: ProductCategory[] = [];
    
    categories.rows.forEach(row => {
      const category: ProductCategory = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        parentId: row.parent_id,
        sortOrder: row.sort_order,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        children: []
      };
      categoryMap.set(category.id, category);
    });
    
    categoryMap.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(category);
          category.parent = parent;
        }
      } else {
        rootCategories.push(category);
      }
    });
    
    res.json(rootCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, parentId, sortOrder = 0 } = req.body;
    
    const result = await db.query(`
      INSERT INTO product_categories (name, slug, description, parent_id, sort_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, slug, description, parentId, sortOrder]);
    
    const category = result.rows[0];
    
    const categoryData = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parent_id,
      sortOrder: category.sort_order,
      isActive: category.is_active,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };

    // Broadcast category creation event
    broadcastToAll('category_created', categoryData);

    res.status(201).json(categoryData);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, parentId, sortOrder, isActive } = req.body;
    
    const result = await db.query(`
      UPDATE product_categories 
      SET name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          parent_id = COALESCE($4, parent_id),
          sort_order = COALESCE($5, sort_order),
          is_active = COALESCE($6, is_active),
          updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [name, slug, description, parentId, sortOrder, isActive, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const category = result.rows[0];
    const categoryData = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parent_id,
      sortOrder: category.sort_order,
      isActive: category.is_active,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };

    // Broadcast category update event
    broadcastToAll('category_updated', categoryData);

    res.json(categoryData);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has products
    const productsResult = await db.query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1',
      [id]
    );
    
    if (parseInt(productsResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing products' 
      });
    }
    
    const result = await db.query(
      'DELETE FROM product_categories WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Broadcast category deletion event
    broadcastToAll('category_deleted', { id });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;