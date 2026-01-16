import React from 'react';
import { Link } from 'wouter';
import { Product } from '../../../../shared/types/product';
import { Icon } from '../icons/components';
import { AddToCartButton } from '../components/ecommerce/cart/AddToCartButton';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="product-card-public">
      <Link href={`/products/${product.slug}`} className="product-card-public__link">
        <div className="product-card-public__image">
          {product.image ? (
            <img src={product.image} alt={product.title} />
          ) : (
            <div className="product-card-public__placeholder">
              <Icon name="image" size={48} />
            </div>
          )}
          {product.category && (
            <div className="product-card-public__category">
              {product.category.name}
            </div>
          )}
        </div>

        <div className="product-card-public__content">
          <h3 className="product-card-public__title">{product.title}</h3>
          
          <p className="product-card-public__description">
            {product.description}
          </p>

          {product.price && (
            <div className="product-card-public__price">
              ${product.price.toFixed(2)}
            </div>
          )}

          {product.features && product.features.length > 0 && (
            <div className="product-card-public__features">
              {product.features.slice(0, 3).map((feature, index) => (
                <span key={index} className="product-card-public__feature">
                  <Icon name="check" size={12} />
                  {feature}
                </span>
              ))}
              {product.features.length > 3 && (
                <span className="product-card-public__feature-more">
                  +{product.features.length - 3} more features
                </span>
              )}
            </div>
          )}

          <div className="product-card-public__footer">
            <div className="product-card-public__actions">
              <AddToCartButton 
                productId={product.id} 
                className="product-card-public__add-to-cart"
              />
              <span className="product-card-public__cta">
                Learn More
                <Icon name="arrow-right" size={16} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
