import React from 'react';
import { Link } from 'wouter';
import { Icon } from '../../../icons/components';
import { CartBadge } from './CartBadge';

interface CartIconProps {
  className?: string;
}

export const CartIcon: React.FC<CartIconProps> = ({ className = '' }) => {
  return (
    <Link href="/cart" className={`header__cart-link ${className}`}>
      <div className="header__cart-icon">
        <Icon name="shopping-cart" size={20} />
        <CartBadge />
      </div>
    </Link>
  );
};
