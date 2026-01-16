import React, { useState, useEffect } from 'react';
import { OrderCard } from '../orders';
import { Icon } from '../../../icons/components';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
}

export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="order-history order-history--loading">
        <Icon name="refresh" size={24} />
        <span>Loading order history...</span>
      </div>
    );
  }

  return (
    <div className="order-history">
      <div className="order-history__header">
        <h2 className="order-history__title">Order History</h2>
        
        <select
          className="order-history__filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div className="order-history__list">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {orders.length === 0 && (
        <div className="order-history__empty">
          <Icon name="file" size={48} />
          <h3>No orders found</h3>
          <p>You haven't placed any orders yet.</p>
        </div>
      )}
    </div>
  );
};
