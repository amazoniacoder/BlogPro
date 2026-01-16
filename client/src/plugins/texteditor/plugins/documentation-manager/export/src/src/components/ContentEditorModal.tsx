import { Icon } from '../../../../../../../../ui-system/icons/components';
/**
 * Content Editor Modal Component
 * Modal wrapper for the integrated text editor
 */

import React, { useState, useEffect } from 'react';
import { LibraryContext } from '../types/LibraryContext';
import { IntegratedTextEditor } from './IntegratedTextEditor';

interface ContentEditorModalProps {
  isOpen: boolean;
  contentId?: string;
  libraryContext: LibraryContext;
  onClose: () => void;
  onSave: (contentId: string, content: string) => Promise<void>;
}

export const ContentEditorModal: React.FC<ContentEditorModalProps> = ({
  isOpen,
  contentId,
  libraryContext,
  onClose,
  onSave
}) => {
  const [initialContent, setInitialContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && contentId) {
      loadContent();
    } else if (isOpen && !contentId) {
      // New content creation
      setInitialContent('');
      setLoading(false);
      setError(null);
    }
  }, [isOpen, contentId]);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    
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
      setInitialContent(data.content || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
      setInitialContent('');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content: string) => {
    try {
      if (contentId) {
        await onSave(contentId, content);
      } else {
        // Handle new content creation
        const newContentId = await createNewContent(content);
        await onSave(newContentId, content);
      }
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      // Error handling is done in IntegratedTextEditor
    }
  };

  const createNewContent = async (content: string): Promise<string> => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/documentation/content', {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'New Document',
        slug: `new-document-${Date.now()}`,
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
    return data.id;
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="content-editor-modal" onClick={handleOverlayClick}>
      <div className="modal-overlay" />
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {contentId ? 'Edit Content' : 'Create New Content'} - {libraryContext.libraryName}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">
              <span>⏳</span>
              <p>Loading content...</p>
            </div>
          ) : error ? (
            <div className="modal-error">
              <Icon name="delete" size={16} />
              <p>Error: {error}</p>
              <button onClick={() => contentId && loadContent()}>
                Try Again
              </button>
            </div>
          ) : (
            <IntegratedTextEditor
              contentId={contentId}
              initialContent={initialContent}
              libraryContext={libraryContext}
              onSave={handleSave}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};
