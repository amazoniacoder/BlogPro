import React from 'react';
import { Product } from '../../../../../../shared/types/product';
import { Button } from '../../button';
import { Icon } from '../../../icons/components';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete
}) => {
  if (products.length === 0) {
    return (
      <div className="product-list__empty">
        <Icon name="grid" size={48} />
        <p>No products yet. Create your first product to get started.</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="product-list__grid">
        {products.map(product => (
          <div key={product.id} className="product-list__item">
            <div className="product-card">
              {product.image && (
                <div className="product-card__image">
                  <img src={product.image} alt={product.title} />
                </div>
              )}
              
              <div className="product-card__content">
                <div className="product-card__header">
                  <h3 className="product-card__title">{product.title}</h3>
                  {product.category && (
                    <span className="product-card__category">
                      {product.category.name}
                    </span>
                  )}
                </div>
                
                <p className="product-card__description">
                  {product.description}
                </p>
                
                {product.price && (
                  <div className="product-card__price">
                    ${product.price.toFixed(2)}
                  </div>
                )}
                
                {product.features && product.features.length > 0 && (
                  <div className="product-card__features">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="product-card__feature">
                        {feature}
                      </span>
                    ))}
                    {product.features.length > 3 && (
                      <span className="product-card__feature-more">
                        +{product.features.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="product-card__meta">
                  <span className="product-card__slug">/{product.slug}</span>
                  <span className={`product-card__status ${product.isActive ? 'active' : 'inactive'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="product-card__actions">
                <Button
                  size="sm"
                  variant="ghost"
                  icon="edit"
                  onClick={() => onEdit(product)}
                  title="Edit product"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  icon="delete"
                  onClick={() => onDelete(product.id)}
                  title="Delete product"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
