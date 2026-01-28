import React, { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';
import websocketService from '@/services/websocket-service';
import { Product } from '../../../../../../shared/types/product';
import { useNotifications } from '@/ui-system/components/feedback';
import '../products.css';

export const ProductsManager: React.FC = () => {
  const { products, loading, error, createProduct, updateProduct, deleteProduct, fetchProducts } = useProducts();
  const { categories: productCategories, fetchCategories } = useProductCategories();
  const { showToastSuccess, showModalError } = useNotifications();

  useEffect(() => {
    // Connect WebSocket for real-time updates
    websocketService.connect();

    // Listen for real-time updates from other admin sessions
    const handleProductChange = () => {
      fetchProducts();
    };

    const handleCategoryChange = () => {
      fetchCategories();
    };

    websocketService.subscribe('product_created', handleProductChange);
    websocketService.subscribe('product_updated', handleProductChange);
    websocketService.subscribe('product_deleted', handleProductChange);
    websocketService.subscribe('category_created', handleCategoryChange);
    websocketService.subscribe('category_updated', handleCategoryChange);
    websocketService.subscribe('category_deleted', handleCategoryChange);

    return () => {
      websocketService.unsubscribe('product_created', handleProductChange);
      websocketService.unsubscribe('product_updated', handleProductChange);
      websocketService.unsubscribe('product_deleted', handleProductChange);
      websocketService.unsubscribe('category_created', handleCategoryChange);
      websocketService.unsubscribe('category_updated', handleCategoryChange);
      websocketService.unsubscribe('category_deleted', handleCategoryChange);
    };
  }, []);
  
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Listen for external create product events
  useEffect(() => {
    const handleCreateProduct = () => {
      if (!showForm) {
        handleCreate();
      }
    };

    window.addEventListener('createProduct', handleCreateProduct);
    return () => {
      window.removeEventListener('createProduct', handleCreateProduct);
    };
  }, [showForm]);

  const handleCreate = async (productData?: any) => {
    if (!productData) {
      // Just show the form
      setEditingProduct(null);
      setShowForm(true);
      return;
    }
    
    try {
      await createProduct(productData);
      setShowForm(false);
      showToastSuccess('Product created successfully');
    } catch (error) {
      console.error('Failed to create product:', error);
      showModalError('Failed to create product', 'Creation Error');
    }
  };

  const handleUpdate = async (productData: any) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
      setShowForm(false);
      showToastSuccess('Product updated successfully');
    } catch (error) {
      console.error('Failed to update product:', error);
      showModalError('Failed to update product', 'Update Error');
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    try {
      console.log('Attempting to delete product with ID:', productId);
      await deleteProduct(productId);
      console.log('Product deleted successfully');
      showToastSuccess('Product deleted successfully');
    } catch (error) {
      console.error('Failed to delete product:', error);
      showModalError('Failed to delete product. Please check the console for details.', 'Deletion Error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return <div className="products-manager__loading">Loading products...</div>;
  }

  if (error) {
    return <div className="products-manager__error">Error: {error}</div>;
  }

  return (
    <div className="products-manager">

      {showForm && (
        <div className="products-manager__form">
          <ProductForm
            product={editingProduct}
            categories={productCategories}
            onSubmit={editingProduct ? handleUpdate : handleCreate}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="products-manager__content">
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};
