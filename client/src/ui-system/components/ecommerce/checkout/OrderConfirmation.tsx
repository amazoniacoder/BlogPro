import React from 'react';
import { Icon } from '../../../icons/components';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

interface OrderConfirmationProps {
  order?: Order;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order }) => {
  if (!order) {
    return (
      <div className="order-confirmation order-confirmation--loading">
        <Icon name="refresh" size={48} />
        <h2>Processing your order...</h2>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <div className="order-confirmation__success">
        <div className="order-confirmation__icon">
          <Icon name="check" size={48} />
        </div>
        
        <h2 className="order-confirmation__title">Order Confirmed!</h2>
        <p className="order-confirmation__message">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
      </div>

      <div className="order-confirmation__details">
        <div className="order-confirmation__section">
          <h3 className="order-confirmation__section-title">Order Details</h3>
          <div className="order-confirmation__info">
            <div className="order-confirmation__info-row">
              <span className="order-confirmation__label">Order Number:</span>
              <span className="order-confirmation__value">{order.orderNumber}</span>
            </div>
            <div className="order-confirmation__info-row">
              <span className="order-confirmation__label">Total Amount:</span>
              <span className="order-confirmation__value">${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="order-confirmation__info-row">
              <span className="order-confirmation__label">Payment Status:</span>
              <span className={`order-confirmation__status order-confirmation__status--${order.paymentStatus}`}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="order-confirmation__info-row">
              <span className="order-confirmation__label">Order Date:</span>
              <span className="order-confirmation__value">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="order-confirmation__section">
          <h3 className="order-confirmation__section-title">What's Next?</h3>
          <div className="order-confirmation__next-steps">
            <div className="order-confirmation__step">
              <Icon name="email" size={20} />
              <span>You'll receive an email confirmation shortly</span>
            </div>
            <div className="order-confirmation__step">
              <Icon name="clock" size={20} />
              <span>We'll process your order within 1-2 business days</span>
            </div>
            <div className="order-confirmation__step">
              <Icon name="bell" size={20} />
              <span>You'll get shipping updates via email</span>
            </div>
          </div>
        </div>
      </div>

      <div className="order-confirmation__actions">
        <a href={`/orders/${order.id}`} className="order-confirmation__track-btn">
          <Icon name="search" size={16} />
          Track Your Order
        </a>
        
        <a href="/products" className="order-confirmation__continue-btn">
          Continue Shopping
        </a>
      </div>
    </div>
  );
};
