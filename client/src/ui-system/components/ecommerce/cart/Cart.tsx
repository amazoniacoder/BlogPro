import React from 'react';
import { Link } from 'wouter';
import { Icon } from '../../../icons/components';
import { useCart } from '../../../../store/cart-context';
import { CartItem } from './CartItem';
import './cart.css';

export const Cart: React.FC = () => {
  const { items, loading } = useCart();

  if (loading && items.length === 0) {
    return (
      <div className="cart cart--loading">
        <div className="cart__loading">
          <Icon name="refresh" size={24} />
          <span>Loading cart...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart cart--empty">
        <div className="cart__empty">
          <Icon name="shopping-cart" size={64} />
          <h2 className="cart__empty-title">Your cart is empty</h2>
          <p className="cart__empty-description">
            Add some products to get started
          </p>
          <Link href="/products" className="cart__continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
   

      <div className="cart__items">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      <div className="cart__actions">
        <Link href="/products" className="cart__continue-shopping">
          <Icon name="arrow-left" size={16} />
          Continue Shopping
        </Link>
        
        <Link 
          href="/checkout" 
          className="cart__checkout-btn"
          onClick={(e) => {
            if (loading) e.preventDefault();
          }}
        >
          {loading ? 'Processing...' : 'Proceed to Checkout'}
          <Icon name="arrow-right" size={16} />
        </Link>
      </div>
    </div>
  );
};
