import React, { useState } from 'react';
import { Icon } from '../../../icons/components';
import { useCart } from '../../../../store/cart-context';

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  quantity = 1,
  disabled = false,
  className = '',
  children
}) => {
  const { addItem, loading, isInCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const alreadyInCart = isInCart(productId);

  const handleAddToCart = async () => {
    if (alreadyInCart) return;
    
    try {
      setIsAdding(true);
      await addItem(productId, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const isLoading = loading || isAdding;

  return (
    <button
      className={`add-to-cart ${isLoading ? 'add-to-cart--loading' : ''} ${alreadyInCart ? 'add-to-cart--added' : ''} ${className}`}
      onClick={handleAddToCart}
      disabled={disabled || isLoading || alreadyInCart}
    >
      {alreadyInCart ? (
        <>
          <Icon name="check" size={16} />
          Added to Cart
        </>
      ) : isLoading ? (
        <>
          <Icon name="refresh" size={16} />
          Adding...
        </>
      ) : (
        <>
          <Icon name="shopping-cart" size={16} />
          {children || 'Add to Cart'}
        </>
      )}
    </button>
  );
};
