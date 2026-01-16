// client/src/admin/pages/categories/hooks/useCategoryData.ts
import { useReducer, useEffect, useCallback } from 'react';
import { categoriesAdminService } from '@/services/api/categories-admin';
import { blogService } from '@/services/api/blog';
import { CategoryTreeNode } from '@/../../shared/types/api';
import { CreateCategoryInput, UpdateCategoryInput } from '@/../../shared/validation/categories';
import websocketService from '@/services/websocket-service';

interface CategoryState {
  categories: CategoryTreeNode[];
  loading: boolean;
  error: string | null;
}

type CategoryAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: CategoryTreeNode[] }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' };

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null
};

const categoryReducer = (state: CategoryState, action: CategoryAction): CategoryState => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, categories: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const useCategoryData = () => {
  const [state, dispatch] = useReducer(categoryReducer, initialState);

  const fetchCategories = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const categories = await categoriesAdminService.getCategoriesTree();
      
      // Try to get post counts, but don't fail if it doesn't work
      let postCounts: { [key: number]: number } = {};
      try {
        const blogPosts = await blogService.getPaginatedBlogPosts(1, 1000);
        console.log('Blog posts data:', blogPosts);
        
        // Handle PaginatedResult structure
        if (blogPosts.data && Array.isArray(blogPosts.data)) {
          blogPosts.data.forEach(post => {
            if (post.categoryId) {
              postCounts[post.categoryId] = (postCounts[post.categoryId] || 0) + 1;
            }
          });
        }
        console.log('Post counts:', postCounts);
      } catch (error) {
        console.warn('Could not fetch blog posts for counting:', error);
      }
      
      // Add post counts to categories
      const addPostCounts = (cats: CategoryTreeNode[]): CategoryTreeNode[] => {
        return cats.map(cat => ({
          ...cat,
          postCount: postCounts[cat.id] || 0,
          children: cat.children ? addPostCounts(cat.children) : []
        }));
      };
      
      const categoriesWithCounts = addPostCounts(categories);
      dispatch({ type: 'FETCH_SUCCESS', payload: categoriesWithCounts });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', error: 'Failed to fetch categories' });
    }
  }, []);

  const createCategory = useCallback(async (data: CreateCategoryInput) => {
    await categoriesAdminService.createCategory(data);
  }, []);

  const updateCategory = useCallback(async (id: number, data: UpdateCategoryInput) => {
    await categoriesAdminService.updateCategory(id, data);
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    await categoriesAdminService.deleteCategory(id);
    // Immediately refresh categories after delete
    await fetchCategories();
  }, [fetchCategories]);

  const refreshCategories = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCategories();
    
    // Connect WebSocket
    if (websocketService.shouldEnableForCurrentRoute()) {
      websocketService.connect();
      
      // Subscribe to category events
      const handleCategoryCreated = () => {
        console.log('Category created via WebSocket, refreshing...');
        fetchCategories();
      };
      
      const handleCategoryUpdated = () => {
        console.log('Category updated via WebSocket, refreshing...');
        fetchCategories();
      };
      
      const handleCategoryDeleted = () => {
        console.log('Category deleted via WebSocket, refreshing...');
        fetchCategories();
      };
      
      websocketService.subscribe('category_created', handleCategoryCreated);
      websocketService.subscribe('category_updated', handleCategoryUpdated);
      websocketService.subscribe('category_deleted', handleCategoryDeleted);
      
      // Cleanup
      return () => {
        websocketService.unsubscribe('category_created', handleCategoryCreated);
        websocketService.unsubscribe('category_updated', handleCategoryUpdated);
        websocketService.unsubscribe('category_deleted', handleCategoryDeleted);
      };
    }
  }, [fetchCategories]);

  return {
    state,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories
  };
};
