import { useState, useEffect } from 'react';
import { Product } from '../../../shared/types/product';
import { productsService } from '../services/api/products';

interface UseProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  active?: boolean;
}

export const useProducts = (params: UseProductsParams = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (newParams?: UseProductsParams) => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = { ...params, ...newParams };
      const response = await productsService.getAll(queryParams);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [params.page, params.limit, params.category, params.search, params.active]);

  const createProduct = async (productData: any) => {
    try {
      const newProduct = await productsService.create(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: any) => {
    try {
      const updatedProduct = await productsService.update(id, productData);
      setProducts(prev => prev.map(prod => prod.id === id ? updatedProduct : prod));
      return updatedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsService.delete(id);
      setProducts(prev => prev.filter(prod => prod.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  return {
    products,
    pagination,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};
