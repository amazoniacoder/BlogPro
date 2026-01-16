import React from 'react';
import { Icon } from '../../../icons/components';

interface TrackingStep {
  status: string;
  title: string;
  description: string;
  date?: string;
  completed: boolean;
}

interface OrderTrackingProps {
  orderNumber: string;
  currentStatus: string;
  trackingNumber?: string;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  orderNumber,
  currentStatus,
  trackingNumber
}) => {
  const trackingSteps: TrackingStep[] = [
    {
      status: 'confirmed',
      title: 'Order Confirmed',
      description: 'Your order has been received and confirmed',
      completed: true,
      date: '2024-01-15'
    },
    {
      status: 'processing',
      title: 'Processing',
      description: 'Your order is being prepared for shipment',
      completed: currentStatus !== 'confirmed',
      date: currentStatus !== 'confirmed' ? '2024-01-16' : undefined
    },
    {
      status: 'shipped',
      title: 'Shipped',
      description: 'Your order has been shipped and is on its way',
      completed: ['shipped', 'delivered'].includes(currentStatus),
      date: ['shipped', 'delivered'].includes(currentStatus) ? '2024-01-17' : undefined
    },
    {
      status: 'delivered',
      title: 'Delivered',
      description: 'Your order has been delivered successfully',
      completed: currentStatus === 'delivered',
      date: currentStatus === 'delivered' ? '2024-01-18' : undefined
    }
  ];

  return (
    <div className="order-tracking">
      <div className="order-tracking__header">
        <h2 className="order-tracking__title">Track Your Order</h2>
        <div className="order-tracking__order-info">
          <div className="order-tracking__order-number">
            Order #{orderNumber}
          </div>
          {trackingNumber && (
            <div className="order-tracking__tracking-number">
              Tracking: {trackingNumber}
            </div>
          )}
        </div>
      </div>

      <div className="order-tracking__timeline">
        {trackingSteps.map((step, index) => (
          <div
            key={step.status}
            className={`order-tracking__step ${
              step.completed ? 'order-tracking__step--completed' : ''
            } ${
              step.status === currentStatus ? 'order-tracking__step--current' : ''
            }`}
          >
            <div className="order-tracking__step-indicator">
              <div className="order-tracking__step-icon">
                {step.completed ? (
                  <Icon name="check" size={16} />
                ) : (
                  <Icon name="circle" size={16} />
                )}
              </div>
              
              {index < trackingSteps.length - 1 && (
                <div 
                  className={`order-tracking__step-line ${
                    step.completed ? 'order-tracking__step-line--completed' : ''
                  }`}
                />
              )}
            </div>

            <div className="order-tracking__step-content">
              <div className="order-tracking__step-title">{step.title}</div>
              <div className="order-tracking__step-description">{step.description}</div>
              {step.date && (
                <div className="order-tracking__step-date">
                  {new Date(step.date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {currentStatus === 'delivered' && (
        <div className="order-tracking__completion">
          <div className="order-tracking__completion-icon">
            <Icon name="check" size={32} />
          </div>
          <h3 className="order-tracking__completion-title">Order Delivered!</h3>
          <p className="order-tracking__completion-message">
            Thank you for your purchase. We hope you enjoy your order!
          </p>
        </div>
      )}
    </div>
  );
};
