import { Request, Response } from 'express';
import { db } from '../../../db/connection';

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    // Revenue analytics
    const revenueQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue
      FROM orders 
      WHERE payment_status = 'completed' 
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const revenueResult = await db.query(revenueQuery);

    // Order statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        SUM(CASE WHEN payment_status = 'completed' THEN total_amount ELSE 0 END) as total_revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `;

    const statsResult = await db.query(statsQuery);

    // Top selling products
    const topProductsQuery = `
      SELECT 
        p.title,
        p.image,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id::text
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'completed'
        AND o.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id, p.title, p.image
      ORDER BY total_sold DESC
      LIMIT 5
    `;

    const topProductsResult = await db.query(topProductsQuery);

    // Low stock alerts
    const lowStockQuery = `
      SELECT title, stock_quantity, sku
      FROM products 
      WHERE track_inventory = true 
        AND stock_quantity <= 10
      ORDER BY stock_quantity ASC
    `;

    const lowStockResult = await db.query(lowStockQuery);

    res.json({
      revenue: revenueResult.rows,
      statistics: statsResult.rows[0],
      topProducts: topProductsResult.rows,
      lowStockAlerts: lowStockResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
};

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        o.*,
        u.email as customer_email,
        u.first_name,
        u.last_name,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, u.email, u.first_name, u.last_name
      ORDER BY o.created_at DESC
      LIMIT 20
    `;

    const result = await db.query(query);

    res.json({
      orders: result.rows || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const getInventory = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        p.*,
        pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id::text
      ORDER BY p.title
      LIMIT 20
    `;

    const result = await db.query(query);

    res.json({
      products: result.rows || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get inventory' });
  }
};

export const getPayments = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        pt.*,
        o.order_number,
        u.email as customer_email
      FROM payment_transactions pt
      JOIN orders o ON pt.order_id = o.id
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY pt.created_at DESC
      LIMIT 20
    `;

    const result = await db.query(query);

    res.json({
      transactions: result.rows || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get payments' });
  }
};

export const getCustomers = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.created_at,
        COUNT(o.id) as order_count,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.total_amount ELSE 0 END) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'user'
      GROUP BY u.id, u.email, u.first_name, u.last_name, u.created_at
      ORDER BY total_spent DESC
      LIMIT 20
    `;

    const result = await db.query(query);

    res.json({
      customers: result.rows || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get customers' });
  }
};

export const updateSettings = async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};