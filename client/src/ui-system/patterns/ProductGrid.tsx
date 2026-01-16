import React from 'react';
import { Product } from '../../../../shared/types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="product-grid__empty">
        <div className="product-grid__empty-content">
          <h3>No products found</h3>
          <p>Try adjusting your search criteria or browse different categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid">
      <div className="product-grid__container">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
