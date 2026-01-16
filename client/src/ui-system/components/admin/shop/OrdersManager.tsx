import React, { useState, useEffect } from 'react';
import { Icon } from '../../../icons/components';

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone?: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
  notes?: string;
}

export const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClass = 'orders-table__status-badge';
    switch (status) {
      case 'pending': return `${baseClass} ${baseClass}--pending`;
      case 'confirmed': return `${baseClass} ${baseClass}--confirmed`;
      case 'processing': return `${baseClass} ${baseClass}--processing`;
      case 'shipped': return `${baseClass} ${baseClass}--shipped`;
      case 'delivered': return `${baseClass} ${baseClass}--delivered`;
      case 'cancelled': return `${baseClass} ${baseClass}--cancelled`;
      default: return baseClass;
    }
  };

  return (
    <div className="orders-manager">
      <div className="orders-manager__header">
        <h1 className="orders-manager__title">Orders Management</h1>
        
        <div className="orders-manager__filters">
          <select 
            className="orders-manager__filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="text"
            className="orders-manager__search"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="orders-manager__loading">Loading orders...</div>
      ) : (
        <div className="orders-table">
          <div className="orders-table__header">
            <div className="orders-table__header-cell">Order #</div>
            <div className="orders-table__header-cell">Customer</div>
            <div className="orders-table__header-cell">Status</div>
            <div className="orders-table__header-cell">Items</div>
            <div className="orders-table__header-cell">Total</div>
            <div className="orders-table__header-cell">Comments</div>
            <div className="orders-table__header-cell">Date</div>
            <div className="orders-table__header-cell">Actions</div>
          </div>

          {orders && orders.length > 0 && orders.map((order) => (
            <div key={order.id} className="orders-table__row">
              <div className="orders-table__cell">
                <span className="orders-table__order-number">{order.orderNumber}</span>
              </div>
              <div className="orders-table__cell">
                <div className="orders-table__customer">
                  <div>{order.customerFirstName} {order.customerLastName}</div>
                  <div className="orders-table__customer-email">{order.customerEmail}</div>
                </div>
              </div>
              <div className="orders-table__cell">
                <span className={getStatusBadgeClass(order.status)}>
                  {order.status}
                </span>
              </div>
              <div className="orders-table__cell">{order.itemCount}</div>
              <div className="orders-table__cell">${order.totalAmount}</div>
              <div className="orders-table__cell">
                <div className="orders-table__comments">
                  {order.notes ? (
                    <span title={order.notes}>
                      {order.notes.length > 50 ? `${order.notes.substring(0, 50)}...` : order.notes}
                    </span>
                  ) : (
                    <span className="orders-table__no-comments">—</span>
                  )}
                </div>
              </div>
              <div className="orders-table__cell">
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
              <div className="orders-table__cell">
                <select
                  className="orders-table__status-select"
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}

          {(!orders || orders.length === 0) && !loading && (
            <div className="orders-table__empty">
              <Icon name="file" size={48} />
              <p>No orders found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
