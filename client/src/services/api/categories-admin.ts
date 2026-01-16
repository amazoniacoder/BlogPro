// client/src/services/api/categories-admin.ts - Direct API service for admin (no caching)
import { BlogCategory, CategoryTreeNode, ApiResponse } from '@/../../shared/types/api';
import { CreateCategoryInput, UpdateCategoryInput } from '@/../../shared/validation/categories';
import { httpClient } from '../cache/http-client';

const API_BASE = '/api';

export const categoriesAdminService = {
  // Get all categories as hierarchical tree
  getCategoriesTree: async (): Promise<CategoryTreeNode[]> => {
    try {
      const response = await httpClient.get<ApiResponse<CategoryTreeNode[]>>(`${API_BASE}/categories`, { bypassCache: true });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories tree:', error);
      return [];
    }
  },

  // Get category by ID
  getCategoryById: async (id: number, includeChildren = true): Promise<BlogCategory | null> => {
    try {
      const params = new URLSearchParams({ 
        includeChildren: includeChildren.toString() 
      });
      const response = await httpClient.get<ApiResponse<BlogCategory>>(`${API_BASE}/categories/${id}?${params}`, { bypassCache: true });
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return null;
    }
  },

  // Create new category (Admin only)
  createCategory: async (data: CreateCategoryInput): Promise<BlogCategory> => {
    const response = await httpClient.post<ApiResponse<BlogCategory>>(`${API_BASE}/categories`, data);
    return response.data;
  },

  // Update category (Admin only)
  updateCategory: async (id: number, data: UpdateCategoryInput): Promise<BlogCategory> => {
    const response = await httpClient.put<ApiResponse<BlogCategory>>(`${API_BASE}/categories/${id}`, data);
    return response.data;
  },

  // Delete category (Admin only)
  deleteCategory: async (id: number): Promise<void> => {
    await httpClient.delete(`${API_BASE}/categories/${id}`);
  }
};
