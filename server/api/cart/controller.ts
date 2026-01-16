import { Request, Response } from 'express';
import { db } from '../../db/connection';
import { broadcastCartUpdate } from '../../websocket';

const getSessionId = (req: Request): string => {
  const userId = (req as any).user?.id;
  if (userId) {
    return userId; // Use user ID directly for authenticated users
  }
  
  // Ensure session exists for guests
  if (!req.sessionID) {
    req.session.save(() => {}); // Force session creation
  }
  
  return req.sessionID || req.ip || 'anonymous';
};

const getUserId = (req: Request): string | undefined => {
  return (req as any).user?.id;
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req);
    
    const userId = getUserId(req);
    
    const cartResult = await db.query(`
      SELECT 
        c.id,
        c.product_id as "productId",
        c.quantity,
        c.price,
        p.id as "product_id",
        p.title as "product_title",
        p.image as "product_image"
      FROM cart_items c
      LEFT JOIN products p ON c.product_id = p.id
      WHERE c.session_id = $1 OR (c.user_id = $2 AND $2 IS NOT NULL)
    `, [sessionId, userId]);
    
    const items = cartResult.rows.map((row: any) => ({
      id: row.id,
      productId: row.productId,
      quantity: row.quantity,
      price: row.price,
      product: {
        id: row.product_id,
        title: row.product_title || 'Product Not Found',
        image: row.product_image
      }
    }));
    
    const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);

    res.json({
      items,
      totalItems,
      subtotal,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: subtotal
    });
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const sessionId = getSessionId(req);
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }

    // Get product details with inventory
    const productResult = await db.query(`
      SELECT id, title, price, is_active 
      FROM products WHERE id = $1 AND is_active = true
    `, [productId]);
    
    if (!productResult.rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productData = productResult.rows[0];
    
    // Skip inventory check for now since existing products table doesn't have inventory columns
    
    // Check if item already exists in cart
    const existingItemResult = await db.query(`
      SELECT * FROM cart_items 
      WHERE (session_id = $1 OR user_id = $2) AND product_id = $3
    `, [sessionId, getUserId(req), productId]);
    
    if (existingItemResult.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Product already in cart',
        message: 'This product is already added to your cart'
      });
    }

    // Add new item
    const userId = getUserId(req);
    await db.query(`
      INSERT INTO cart_items (user_id, session_id, product_id, quantity, price)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, sessionId, productId, quantity, productData.price || '0']);

    // Return updated cart
    const updatedCart = await getCartData(sessionId, getUserId(req));
    
    // Broadcast cart update
    broadcastCartUpdate('added', updatedCart);
    
    res.json(updatedCart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

const getCartData = async (sessionId: string, userId?: string | undefined) => {
  const cartResult = await db.query(`
    SELECT 
      c.id,
      c.product_id as "productId",
      c.quantity,
      c.price,
      p.id as "product_id",
      p.title as "product_title",
      p.image as "product_image"
    FROM cart_items c
    LEFT JOIN products p ON c.product_id = p.id
    WHERE c.session_id = $1 OR (c.user_id = $2 AND $2 IS NOT NULL)
  `, [sessionId, userId]);
  
  const items = cartResult.rows.map((row: any) => ({
    id: row.id,
    productId: row.productId,
    quantity: row.quantity,
    price: row.price,
    product: {
      id: row.product_id,
      title: row.product_title || 'Product Not Found',
      image: row.product_image
    }
  }));
  
  const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);

  return {
    items,
    totalItems,
    subtotal,
    taxAmount: 0,
    shippingAmount: 0,
    totalAmount: subtotal
  };
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const sessionId = getSessionId(req);

    if (!itemId || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid item ID or quantity' });
    }

    // Check if cart item exists
    const cartItemResult = await db.query(`
      SELECT 1 FROM cart_items
      WHERE id = $1 AND session_id = $2
    `, [itemId, sessionId]);
    
    if (!cartItemResult.rows.length) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await db.query(`
      UPDATE cart_items 
      SET quantity = $1, updated_at = NOW()
      WHERE id = $2 AND session_id = $3
    `, [quantity, itemId, sessionId]);

    const updatedCart = await getCartData(sessionId, getUserId(req));
    
    // Broadcast cart update
    broadcastCartUpdate('updated', updatedCart);
    
    res.json(updatedCart);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const sessionId = getSessionId(req);

    if (!itemId) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    await db.query(`
      DELETE FROM cart_items 
      WHERE id = $1 AND session_id = $2
    `, [itemId, sessionId]);

    const updatedCart = await getCartData(sessionId, getUserId(req));
    
    // Broadcast cart update
    broadcastCartUpdate('removed', updatedCart);
    
    res.json(updatedCart);
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req);
    
    await db.query(`
      DELETE FROM cart_items 
      WHERE session_id = $1
    `, [sessionId]);

    // Broadcast cart cleared
    broadcastCartUpdate('cleared', { items: [], totalItems: 0, totalAmount: 0 });
    
    res.json({ 
      success: true, 
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};