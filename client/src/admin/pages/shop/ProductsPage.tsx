import React from 'react';
import { ProductsManager } from '../../../ui-system/components/admin/products/ProductsManager';

const ProductsPage: React.FC = () => {
  return (
    <div className="shop-products-page">
      <div className="shop-products-page__header">
        <h1 className="shop-products-page__title">Products Management</h1>
        <p className="shop-products-page__description">
          Manage your product catalog, inventory, and pricing
        </p>
      </div>
      
      <div className="shop-products-page__content">
        <ProductsManager />
      </div>
    </div>
  );
};

export default ProductsPage;