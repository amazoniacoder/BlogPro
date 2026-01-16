import { Router } from 'express';
import { db } from '../../db/connection';
import { Product } from '../../../shared/types/product';
import { broadcastToAll } from '../../websocket';

const router = Router();

// Get all products with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      active = 'true' 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let whereClause = 'WHERE p.is_active = $1';
    let params: any[] = [active === 'true'];
    let paramCount = 1;
    
    if (category) {
      paramCount++;
      whereClause += ` AND c.slug = $${paramCount}`;
      params.push(category);
    }
    
    if (search) {
      paramCount++;
      whereClause += ` AND (
        p.title ILIKE $${paramCount} OR 
        p.description ILIKE $${paramCount} OR
        p.content ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }
    
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.sort_order ASC, p.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    params.push(Number(limit), offset);
    
    const result = await db.query(query, params);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      ${whereClause}
    `;
    
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);
    
    const products: Product[] = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      content: row.content,
      image: row.image,
      slug: row.slug,
      categoryId: row.category_id,
      category: row.category_name ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } : undefined,
      price: row.price ? parseFloat(row.price) : undefined,
      features: row.features || [],
      isActive: row.is_active,
      sortOrder: row.sort_order,
      stockQuantity: row.stock_quantity || 0,
      trackInventory: row.track_inventory || false,
      allowBackorders: row.allow_backorders || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product (admin only)
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      content, 
      image, 
      slug, 
      categoryId, 
      price, 
      features = [], 
      sortOrder = 0 
    } = req.body;
    
    const result = await db.query(`
      INSERT INTO products (
        title, description, content, image, slug, 
        category_id, price, features, sort_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [title, description, content, image, slug, categoryId, price, JSON.stringify(features), sortOrder]);
    
    const product = result.rows[0];
    
    const productData = {
      id: product.id,
      title: product.title,
      description: product.description,
      content: product.content,
      image: product.image,
      slug: product.slug,
      categoryId: product.category_id,
      price: product.price ? parseFloat(product.price) : undefined,
      features: product.features || [],
      isActive: product.is_active,
      sortOrder: product.sort_order,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };

    // Broadcast product creation event
    broadcastToAll('product_created', productData);

    res.status(201).json(productData);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      content, 
      image, 
      slug, 
      categoryId, 
      price, 
      features, 
      sortOrder, 
      isActive 
    } = req.body;
    
    const result = await db.query(`
      UPDATE products 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          content = COALESCE($3, content),
          image = COALESCE($4, image),
          slug = COALESCE($5, slug),
          category_id = COALESCE($6, category_id),
          price = COALESCE($7, price),
          features = COALESCE($8, features),
          sort_order = COALESCE($9, sort_order),
          is_active = COALESCE($10, is_active),
          updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `, [title, description, content, image, slug, categoryId, price, 
        features ? JSON.stringify(features) : null, sortOrder, isActive, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = result.rows[0];
    const productData = {
      id: product.id,
      title: product.title,
      description: product.description,
      content: product.content,
      image: product.image,
      slug: product.slug,
      categoryId: product.category_id,
      price: product.price ? parseFloat(product.price) : undefined,
      features: product.features || [],
      isActive: product.is_active,
      sortOrder: product.sort_order,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };

    // Broadcast product update event
    broadcastToAll('product_updated', productData);

    res.json(productData);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Get product by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.is_active = true
    `;
    
    const result = await db.query(query, [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const row = result.rows[0];
    const product: Product = {
      id: row.id,
      title: row.title,
      description: row.description,
      content: row.content,
      image: row.image,
      slug: row.slug,
      categoryId: row.category_id,
      category: row.category_name ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } : undefined,
      price: row.price ? parseFloat(row.price) : undefined,
      features: row.features || [],
      isActive: row.is_active,
      sortOrder: row.sort_order,
      stockQuantity: row.stock_quantity || 0,
      trackInventory: row.track_inventory || false,
      allowBackorders: row.allow_backorders || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const { q: query, lang = 'en', limit = 10 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const { searchService } = await import('../../services/searchService');
    const results = await searchService.searchProducts(
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
    console.error('Product search error:', error);
    res.status(500).json({ error: 'Product search failed' });
  }
});

// Delete product (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Broadcast product deletion event
    broadcastToAll('product_deleted', { id });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;