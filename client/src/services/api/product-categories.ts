import { httpClient } from '../cache/http-client';
import { ProductCategory, CreateProductCategoryData, UpdateProductCategoryData } from '../../../../shared/types/product-category';

class ProductCategoriesService {
  async getAll(): Promise<ProductCategory[]> {
    try {
      const response = await httpClient.get('/api/product-categories');
      return response;
    } catch (error) {
      console.error('Error fetching product categories:', error);
      throw new Error('Failed to fetch product categories');
    }
  }

  async getBySlug(slug: string): Promise<ProductCategory> {
    try {
      const response = await httpClient.get(`/api/product-categories/${slug}`);
      return response;
    } catch (error) {
      console.error('Error fetching product category:', error);
      throw new Error('Failed to fetch product category');
    }
  }

  async create(data: CreateProductCategoryData): Promise<ProductCategory> {
    try {
      const response = await httpClient.post('/api/product-categories', data);
      return response;
    } catch (error) {
      console.error('Error creating product category:', error);
      throw new Error('Failed to create product category');
    }
  }

  async update(id: string, data: UpdateProductCategoryData): Promise<ProductCategory> {
    try {
      const response = await httpClient.put(`/api/product-categories/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating product category:', error);
      throw new Error('Failed to update product category');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await httpClient.delete(`/api/product-categories/${id}`);
    } catch (error) {
      console.error('Error deleting product category:', error);
      throw new Error('Failed to delete product category');
    }
  }
}

export const productCategoriesService = new ProductCategoriesService();
