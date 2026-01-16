import { Request, Response } from 'express';
import { db } from '../../db/connection';

export const createPaymentIntent = async (_req: Request, res: Response) => {
  try {
    const orderQuery = `
      SELECT * FROM orders 
      WHERE payment_status = 'pending'
      LIMIT 1
    `;

    const orderResult = await db.query(orderQuery);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or already processed' });
    }

    const order = orderResult.rows[0];

    // Create payment intent based on gateway
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      clientSecret: `pi_${Date.now()}_secret`,
      amount: order.total_amount || 100.00,
      currency: order.currency || 'USD',
      paymentMethod: 'stripe'
    };

    // Store payment transaction
    const transactionQuery = `
      INSERT INTO payment_transactions (transaction_id, payment_method, gateway, amount, currency, status)
      VALUES ('sample-transaction', 'stripe', 'stripe', 100.00, 'USD', 'pending')
    `;

    await db.query(transactionQuery);

    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

export const confirmPayment = async (_req: Request, res: Response) => {
  try {
    // Update payment transaction
    const updateTransactionQuery = `
      UPDATE payment_transactions 
      SET status = 'completed'
      WHERE status = 'pending'
    `;

    await db.query(updateTransactionQuery);

    // Update order payment status
    const updateOrderQuery = `
      UPDATE orders 
      SET payment_status = 'completed', status = 'confirmed', updated_at = NOW()
      WHERE payment_status = 'pending'
      RETURNING *
    `;

    const orderResult = await db.query(updateOrderQuery);
    
    // Deliver digital goods via email
    if (orderResult.rows.length > 0) {
      const order = orderResult.rows[0];
      await deliverDigitalGoods(order.id);
    }

    res.json({
      success: true,
      transactionId: 'sample-transaction',
      orderId: 'sample-order',
      message: 'Payment confirmed and digital goods delivered'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

async function deliverDigitalGoods(orderId: string) {
  try {
    // Get order details with items
    const orderQuery = `
      SELECT o.*, oi.product_id, p.title, p.price
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id::text
      WHERE o.id = $1
    `;
    
    const result = await db.query(orderQuery, [orderId]);
    
    if (result.rows.length === 0) return;
    
    const orderData = result.rows[0];
    const items = result.rows.map(row => ({
      id: row.product_id,
      title: row.title || 'Digital Product',
    }));
    
    const orderDetails = {
      id: orderId,
      orderNumber: orderData.order_number || 'ORD-SAMPLE',
      customerEmail: 'customer@example.com', // In real app, get from user table
      customerName: 'Valued Customer',
      items,
      totalAmount: parseFloat(orderData.total_amount || '100.00')
    };
    
    const { digitalGoodsService } = await import('../../services/digitalGoodsService');
    await digitalGoodsService.deliverDigitalGoods(orderDetails);
  } catch (error) {
    console.error('Failed to deliver digital goods:', error);
  }
}

export const handleWebhook = async (_req: Request, res: Response) => {
  try {
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: 'Webhook error' });
  }
};

export const getPaymentMethods = async (_req: Request, res: Response) => {
  try {
    const paymentMethods = [
      {
        id: 'stripe_card',
        type: 'card',
        gateway: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Visa, MasterCard, American Express',
        enabled: true,
        supportedCurrencies: ['USD', 'EUR', 'RUB'],
        icon: 'credit-card'
      },
      {
        id: 'paypal',
        type: 'wallet',
        gateway: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        enabled: true,
        supportedCurrencies: ['USD', 'EUR'],
        icon: 'paypal'
      },
      {
        id: 'yandex_money',
        type: 'wallet',
        gateway: 'yandex',
        name: 'YooMoney',
        description: 'Yandex.Money wallet',
        enabled: true,
        supportedCurrencies: ['RUB'],
        icon: 'yandex'
      }
    ];

    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
};