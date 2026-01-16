import React from 'react';
import { Icon } from '../../../icons/components';
import { useCart } from '../../../../store/cart-context';
import './cart.css';

interface CartItemType {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    description?: string;
    image?: string;
  };
}

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { removeItem, loading } = useCart();

  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <div className="cart__item">
      <div className="cart__item-image">
        {item.product?.image ? (
          <img src={item.product.image} alt={item.product.title} />
        ) : (
          <div className="cart__item-placeholder">
            <Icon name="image" size={24} />
          </div>
        )}
      </div>

      <div className="cart__item-details">
        <h3 className="cart__item-title">{item.product?.title || 'Product'}</h3>
        {item.product?.description && (
          <p className="cart__item-description">{item.product.description}</p>
        )}
        <div className="cart__item-price">${Number(item.price).toFixed(2)} each</div>
      </div>

      <div className="cart__item-controls">
        <div className="cart__summary">
          <div className="cart__total">
            <div className="cart__total-row">
              <span className="cart__total-label">Total:</span>
              <span className="cart__total-value">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <button
          className="cart__remove-btn"
          onClick={handleRemove}
          disabled={loading}
          title="Remove item"
        >
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
};
