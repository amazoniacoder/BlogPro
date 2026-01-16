import { Request, Response } from 'express';
import { db } from '../../db/connection';

export const getUserOrders = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 20
    `;

    const result = await db.query(query);
    
    const orders = result.rows.map(row => ({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      totalAmount: row.total_amount,
      currency: row.currency,
      createdAt: row.created_at,
      itemCount: row.item_count,
      customerFirstName: row.customer_first_name,
      customerLastName: row.customer_last_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      notes: row.notes
    }));

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const getOrder = async (_req: Request, res: Response) => {
  try {
    const orderQuery = `
      SELECT * FROM orders 
      LIMIT 1
    `;

    const orderResult = await db.query(orderQuery);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsQuery = `
      SELECT oi.*, p.title, p.image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id::text
      LIMIT 10
    `;

    const itemsResult = await db.query(itemsQuery);

    const order = {
      ...orderResult.rows[0],
      items: itemsResult.rows
    };

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get order' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      notes,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!customerFirstName || !customerEmail) {
      return res.status(400).json({ error: 'First name and email are required' });
    }

    // Get cart items
    const cartQuery = `
      SELECT ci.*, p.title, p.description, p.image, p.price as current_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id::text
      LIMIT 10
    `;

    const cartResult = await db.query(cartQuery);
    
    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const cartItems = cartResult.rows;
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
    const taxAmount = 0; // No tax for digital products
    const shippingAmount = 0; // No shipping for digital products
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Create order with customer info
    const orderQuery = `
      INSERT INTO orders (
        customer_first_name, 
        customer_last_name, 
        customer_email, 
        customer_phone, 
        notes,
        payment_method,
        subtotal, 
        tax_amount, 
        shipping_amount, 
        total_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const orderResult = await db.query(orderQuery, [
      customerFirstName,
      customerLastName || null,
      customerEmail,
      customerPhone || null,
      notes || null,
      paymentMethod || 'dummy',
      totalAmount,
      taxAmount,
      shippingAmount,
      totalAmount
    ]);

    const order = orderResult.rows[0];

    // Create order items
    for (const item of cartItems) {
      await db.query(`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, product_snapshot)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        order.id,
        item.product_id,
        item.quantity,
        item.price,
        Number(item.price) * Number(item.quantity),
        JSON.stringify({
          title: item.title,
          description: item.description,
          image: item.image
        })
      ]);
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrderStatus = async (_req: Request, res: Response) => {
  try {
    const updateQuery = `
      UPDATE orders 
      SET status = 'processing', updated_at = NOW()
      WHERE id IS NOT NULL
    `;

    const result = await db.query(updateQuery);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const trackOrder = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT order_number, status, created_at, updated_at
      FROM orders 
      LIMIT 1
    `;

    const result = await db.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track order' });
  }
};