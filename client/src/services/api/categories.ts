// client/src/services/api/categories.ts
import { httpClient } from '../cache/http-client';
import { BlogCategory, CategoryTreeNode, CategoryWithPosts, ApiResponse } from '@/../../shared/types/api';
import { CreateCategoryInput, UpdateCategoryInput } from '@/../../shared/validation/categories';

export const categoriesService = {
  // Get all categories as hierarchical tree
  getCategoriesTree: async (): Promise<CategoryTreeNode[]> => {
    try {
      const response = await httpClient.get<ApiResponse<CategoryTreeNode[]>>('/api/categories');
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
      const response = await httpClient.get<ApiResponse<BlogCategory>>(`/api/categories/${id}?${params}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return null;
    }
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<BlogCategory | null> => {
    try {
      const response = await httpClient.get<ApiResponse<BlogCategory>>(`/api/categories/slug/${slug}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching category by slug ${slug}:`, error);
      return null;
    }
  },

  // Get posts in category
  getCategoryPosts: async (id: number, includeSubcategories = true): Promise<CategoryWithPosts | null> => {
    try {
      const params = new URLSearchParams({ 
        includeSubcategories: includeSubcategories.toString() 
      });
      const response = await httpClient.get<ApiResponse<CategoryWithPosts>>(`/api/categories/${id}/posts?${params}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching category posts ${id}:`, error);
      return null;
    }
  },

  // Get category breadcrumb path
  getCategoryPath: async (id: number): Promise<BlogCategory[]> => {
    try {
      const response = await httpClient.get<ApiResponse<BlogCategory[]>>(`/api/categories/${id}/path`);
      return response.data || [];
    } catch (error: any) {
      // Silently handle missing categories
      return [];
    }
  },

  // Create new category (Admin only)
  createCategory: async (data: CreateCategoryInput): Promise<BlogCategory> => {
    const response = await httpClient.post<ApiResponse<BlogCategory>>('/api/categories', data);
    return response.data;
  },

  // Update category (Admin only)
  updateCategory: async (id: number, data: UpdateCategoryInput): Promise<BlogCategory> => {
    const response = await httpClient.put<ApiResponse<BlogCategory>>(`/api/categories/${id}`, data);
    return response.data;
  },

  // Delete category (Admin only)
  deleteCategory: async (id: number): Promise<void> => {
    await httpClient.delete(`/api/categories/${id}`);
  }
};
