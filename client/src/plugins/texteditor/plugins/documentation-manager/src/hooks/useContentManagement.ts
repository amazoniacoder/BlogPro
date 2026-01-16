/**
 * Content Management Hook
 * Handles CRUD operations for documentation content
 * Max 200 lines - strict TypeScript compliance
 */

import { useCallback } from 'react';
import { ContentItem, LibraryType } from '../types/SharedTypes';

interface UseContentManagementReturn {
  readonly createContent: (content: Partial<ContentItem>) => Promise<ContentItem>;
  readonly updateContent: (id: string, content: Partial<ContentItem>) => Promise<ContentItem>;
  readonly deleteContent: (id: string) => Promise<void>;
  readonly publishContent: (id: string, isPublished: boolean) => Promise<ContentItem>;
}

/**
 * Hook for managing documentation content CRUD operations
 */
export const useContentManagement = (libraryType: LibraryType): UseContentManagementReturn => {
  /**
   * Get authentication headers
   */
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  /**
   * Handle API errors
   */
  const handleApiError = async (response: Response): Promise<never> => {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || errorData.error || `HTTP ${response.status}`;
    throw new Error(message);
  };

  /**
   * Create new content
   */
  const createContent = useCallback(async (contentData: Partial<ContentItem>): Promise<ContentItem> => {
    const response = await fetch('/api/documentation/content', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...contentData,
        library_type: libraryType,
        created_by: 'current_user', // TODO: Get from auth context
        updated_by: 'current_user'
      })
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  }, [libraryType]);

  /**
   * Update existing content
   */
  const updateContent = useCallback(async (id: string, contentData: Partial<ContentItem>): Promise<ContentItem> => {
    const response = await fetch(`/api/documentation/content/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...contentData,
        updated_by: 'current_user' // TODO: Get from auth context
      })
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  }, []);

  /**
   * Delete content
   */
  const deleteContent = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/documentation/content/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      await handleApiError(response);
    }
  }, []);

  /**
   * Publish or unpublish content
   */
  const publishContent = useCallback(async (id: string, isPublished: boolean): Promise<ContentItem> => {
    return updateContent(id, { isPublished });
  }, [updateContent]);

  return {
    createContent,
    updateContent,
    deleteContent,
    publishContent
  };
};
