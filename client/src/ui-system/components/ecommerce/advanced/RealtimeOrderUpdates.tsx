import React, { useState, useEffect } from 'react';
import { Icon } from '../../../icons/components';
import { OrderStatus } from '../orders';

interface OrderUpdate {
  orderId: string;
  orderNumber: string;
  status: string;
  message: string;
  timestamp: string;
}

export const RealtimeOrderUpdates: React.FC = () => {
  const [updates, setUpdates] = useState<OrderUpdate[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Simulate WebSocket connection for real-time updates
    const connectWebSocket = () => {
      setConnected(true);
      
      // Simulate receiving updates
      const interval = setInterval(() => {
        const mockUpdate: OrderUpdate = {
          orderId: `order-${Date.now()}`,
          orderNumber: `ORD-${Math.random().toString(36).substr(2, 9)}`,
          status: ['confirmed', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
          message: 'Order status updated',
          timestamp: new Date().toISOString()
        };
        
        setUpdates(prev => [mockUpdate, ...prev.slice(0, 4)]);
      }, 10000); // Update every 10 seconds

      return () => {
        clearInterval(interval);
        setConnected(false);
      };
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, []);

  return (
    <div className="realtime-updates">
      <div className="realtime-updates__header">
        <h3 className="realtime-updates__title">Order Updates</h3>
        <div className={`realtime-updates__status ${connected ? 'realtime-updates__status--connected' : ''}`}>
          <Icon name="circle" size={8} />
          <span>{connected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="realtime-updates__list">
        {updates.map((update, index) => (
          <div key={`${update.orderId}-${index}`} className="realtime-updates__item">
            <div className="realtime-updates__content">
              <div className="realtime-updates__order">
                Order #{update.orderNumber}
              </div>
              <div className="realtime-updates__message">
                {update.message}
              </div>
              <div className="realtime-updates__time">
                {new Date(update.timestamp).toLocaleTimeString()}
              </div>
            </div>
            
            <div className="realtime-updates__status-badge">
              <OrderStatus status={update.status} />
            </div>
          </div>
        ))}
      </div>

      {updates.length === 0 && (
        <div className="realtime-updates__empty">
          <Icon name="bell" size={24} />
          <span>No recent updates</span>
        </div>
      )}
    </div>
  );
};
