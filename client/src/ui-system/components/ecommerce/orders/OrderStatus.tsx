import React from 'react';
import { Icon } from '../../../icons/components';

interface OrderStatusProps {
  status: string;
  className?: string;
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { icon: 'clock' as const, class: 'order-status--pending', label: 'Pending' };
      case 'confirmed':
        return { icon: 'check' as const, class: 'order-status--confirmed', label: 'Confirmed' };
      case 'processing':
        return { icon: 'refresh' as const, class: 'order-status--processing', label: 'Processing' };
      case 'shipped':
        return { icon: 'arrow-right' as const, class: 'order-status--shipped', label: 'Shipped' };
      case 'delivered':
        return { icon: 'check' as const, class: 'order-status--delivered', label: 'Delivered' };
      case 'cancelled':
        return { icon: 'x' as const, class: 'order-status--cancelled', label: 'Cancelled' };
      case 'refunded':
        return { icon: 'arrow-left' as const, class: 'order-status--refunded', label: 'Refunded' };
      default:
        return { icon: 'circle' as const, class: 'order-status--unknown', label: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`order-status ${config.class} ${className}`}>
      <Icon name={config.icon} size={14} />
      <span className="order-status__text">{config.label}</span>
    </span>
  );
};
