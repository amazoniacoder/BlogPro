import React from 'react';
import { Icon } from '../../../icons/components';
import { OrderStatus } from './OrderStatus';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items?: any[];
}

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return (
    <div className="order-card">
      <div className="order-card__header">
        <div className="order-card__number">
          <Icon name="file" size={16} />
          <span>Order #{order.orderNumber}</span>
        </div>
        <OrderStatus status={order.status} />
      </div>

      <div className="order-card__content">
        <div className="order-card__info">
          <div className="order-card__date">
            <Icon name="calendar" size={14} />
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="order-card__items">
            <Icon name="shopping-cart" size={14} />
            <span>{order.items?.length || 0} items</span>
          </div>
        </div>

        <div className="order-card__total">
          <span className="order-card__total-label">Total:</span>
          <span className="order-card__total-amount">${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="order-card__actions">
        <a 
          href={`/orders/${order.id}`} 
          className="order-card__view-btn"
        >
          <Icon name="eye" size={14} />
          View Details
        </a>
        
        {order.status === 'shipped' && (
          <a 
            href={`/orders/${order.id}/track`} 
            className="order-card__track-btn"
          >
            <Icon name="search" size={14} />
            Track Order
          </a>
        )}
      </div>
    </div>
  );
};
