import React from 'react';
import { Icon } from '../../../icons/components';

interface PaymentStatusProps {
  status: string;
  className?: string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { icon: 'clock' as const, class: 'payment-status--pending', label: 'Pending' };
      case 'processing':
        return { icon: 'refresh' as const, class: 'payment-status--processing', label: 'Processing' };
      case 'completed':
        return { icon: 'check' as const, class: 'payment-status--success', label: 'Completed' };
      case 'failed':
        return { icon: 'x' as const, class: 'payment-status--failed', label: 'Failed' };
      case 'cancelled':
        return { icon: 'x' as const, class: 'payment-status--cancelled', label: 'Cancelled' };
      case 'refunded':
        return { icon: 'arrow-left' as const, class: 'payment-status--refunded', label: 'Refunded' };
      default:
        return { icon: 'circle' as const, class: 'payment-status--unknown', label: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`payment-status ${config.class} ${className}`}>
      <Icon name={config.icon} size={14} />
      <span className="payment-status__text">{config.label}</span>
    </span>
  );
};
