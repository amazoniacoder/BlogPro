/**
 * Text Editor Integration Hook
 * Manages text editor state and content operations
 */

import { useState, useCallback } from 'react';
import { LibraryContext } from '../types/LibraryContext';

interface ContentData {
  id: string;
  title: string;
  content: string;
  library_type: string;
}

interface UseTextEditorIntegrationReturn {
  isEditorOpen: boolean;
  currentContent: ContentData | null;
  saving: boolean;
  error: string | null;
  openEditor: (contentId?: string) => void;
  closeEditor: () => void;
  saveContent: (contentId: string, content: string) => Promise<void>;
  createContent: (content: string, title: string) => Promise<string>;
}

export const useTextEditorIntegration = (
  libraryContext: LibraryContext,
  onContentUpdate?: () => void
): UseTextEditorIntegrationReturn => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEditor = useCallback(async (contentId?: string) => {
    setError(null);
    
    if (contentId) {
      // Load existing content
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/documentation/content/${contentId}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load content');
        }

        const data = await response.json();
        setCurrentContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
        return;
      }
    } else {
      // New content
      setCurrentContent(null);
    }
    
    setIsEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setCurrentContent(null);
    setError(null);
  }, []);

  const saveContent = useCallback(async (contentId: string, content: string) => {
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documentation/content/${contentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          library_type: libraryContext.libraryType,
          updated_by: 'editor'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      // Update current content
      if (currentContent) {
        setCurrentContent({ ...currentContent, content });
      }

      // Notify parent component
      onContentUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [libraryContext.libraryType, currentContent, onContentUpdate]);

  const createContent = useCallback(async (content: string, title: string): Promise<string> => {
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const response = await fetch('/api/documentation/content', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          slug: `${slug}-${Date.now()}`,
          content,
          library_type: libraryContext.libraryType,
          is_published: false,
          created_by: 'editor'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create content');
      }

      const data = await response.json();
      
      // Update current content
      setCurrentContent(data);
      
      // Notify parent component
      onContentUpdate?.();
      
      return data.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [libraryContext.libraryType, onContentUpdate]);

  return {
    isEditorOpen,
    currentContent,
    saving,
    error,
    openEditor,
    closeEditor,
    saveContent,
    createContent
  };
};
