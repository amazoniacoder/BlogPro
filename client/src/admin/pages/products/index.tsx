import React from 'react';
import { ProductsManager } from '@/ui-system/components/admin/products/ProductsManager';

const ProductsPage: React.FC = () => {
  return (
    <div className="admin-content-wrapper">
      <ProductsManager />
    </div>
  );
};

export default ProductsPage;
