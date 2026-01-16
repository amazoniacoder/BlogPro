import React from 'react';
import { useCart } from '../../../../store/cart-context';

interface CartBadgeProps {
  className?: string;
}

export const CartBadge: React.FC<CartBadgeProps> = ({ className = '' }) => {
  const { totalItems } = useCart();

  return (
    <span className={`cart-badge ${totalItems > 0 ? 'cart-badge--active' : 'cart-badge--zero'} ${className}`}>
      {totalItems > 99 ? '99+' : totalItems}
    </span>
  );
};
