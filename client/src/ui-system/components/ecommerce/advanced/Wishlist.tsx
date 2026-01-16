import React, { useState, useEffect } from 'react';
import { Button } from '../../button';
import { Icon } from '../../../icons/components';
import { AddToCartButton } from '../cart';

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    title: string;
    description: string;
    image: string;
    price: number;
    stockQuantity: number;
  };
  addedAt: string;
}

export const Wishlist: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setItems([
        {
          id: '1',
          productId: 'prod-1',
          product: {
            title: 'Sample Product',
            description: 'A great product for testing',
            image: '/images/sample-product.jpg',
            price: 29.99,
            stockQuantity: 10
          },
          addedAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  if (loading) {
    return (
      <div className="wishlist wishlist--loading">
        <Icon name="refresh" size={24} />
        <span>Loading wishlist...</span>
      </div>
    );
  }

  return (
    <div className="wishlist">
      <div className="wishlist__header">
        <h2 className="wishlist__title">My Wishlist</h2>
        <span className="wishlist__count">{items.length} items</span>
      </div>

      <div className="wishlist__grid">
        {items.map((item) => (
          <div key={item.id} className="wishlist__item">
            <div className="wishlist__image">
              {item.product.image ? (
                <img src={item.product.image} alt={item.product.title} />
              ) : (
                <Icon name="image" size={48} />
              )}
            </div>

            <div className="wishlist__content">
              <h3 className="wishlist__item-title">
                <a href={`/products/${item.productId}`}>
                  {item.product.title}
                </a>
              </h3>
              
              <p className="wishlist__item-description">
                {item.product.description}
              </p>
              
              <div className="wishlist__item-price">
                ${item.product.price.toFixed(2)}
              </div>

              <div className="wishlist__item-stock">
                {item.product.stockQuantity > 0 ? (
                  <span className="wishlist__in-stock">
                    <Icon name="check" size={14} />
                    In Stock
                  </span>
                ) : (
                  <span className="wishlist__out-of-stock">
                    <Icon name="x" size={14} />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            <div className="wishlist__actions">
              <AddToCartButton
                productId={item.productId}
                disabled={item.product.stockQuantity === 0}
              />
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleRemoveItem(item.id)}
              >
                <Icon name="x" size={14} />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="wishlist__empty">
          <Icon name="heart" size={48} />
          <h3>Your wishlist is empty</h3>
          <p>Save items you love for later.</p>
          <a href="/products" className="wishlist__browse-btn">
            Browse Products
          </a>
        </div>
      )}
    </div>
  );
};
