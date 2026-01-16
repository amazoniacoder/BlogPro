import { Icon } from '../../../../../../../ui-system/icons/components';
/**
 * Inline Editor Component
 * Real-time inline content editing with WebSocket updates
 * Max 250 lines - strict TypeScript compliance
 */

import React, { useState, useEffect, useRef } from 'react';
import { useWebSocketUpdates } from '../../hooks/useWebSocketUpdates';

interface InlineEditorProps {
  readonly contentId: string;
  readonly initialContent: string;
  readonly contentType: 'text' | 'html';
  readonly libraryType: 'texteditor' | 'site';
  readonly onSave: (content: string) => Promise<void>;
  readonly onCancel: () => void;
}

/**
 * Inline editor component for real-time content editing
 */
export const InlineEditor: React.FC<InlineEditorProps> = ({
  contentId,
  initialContent,
  contentType,
  libraryType,
  onSave,
  onCancel
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | HTMLDivElement>(null);
  
  const { updateContent, unlockContent } = useWebSocketUpdates(libraryType);

  /**
   * Focus editor on mount
   */
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      // Select all text for easy replacement
      if (contentType === 'text' && editorRef.current instanceof HTMLTextAreaElement) {
        editorRef.current.select();
      }
    }
  }, [contentType]);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [content]);

  /**
   * Handle content changes with real-time updates
   */
  const handleContentChange = (newContent: string): void => {
    setContent(newContent);
    setError(null);
  };

  /**
   * Debounced real-time updates
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (content !== initialContent) {
        updateContent(contentId, content);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [content, contentId, initialContent, updateContent]);

  /**
   * Save content
   */
  const handleSave = async (): Promise<void> => {
    if (content.trim() === '') {
      setError('Content cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Save to database
      await onSave(content);
      
      // Unlock content
      await unlockContent(contentId);
      
      // Broadcast final update
      updateContent(contentId, content);
      
    } catch (error) {
      console.error('Failed to save content:', error);
      setError('Failed to save content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Cancel editing
   */
  const handleCancel = async (): Promise<void> => {
    // Unlock content
    await unlockContent(contentId);
    onCancel();
  };

  /**
   * Handle content input for HTML editor
   */
  const handleHtmlInput = (e: React.FormEvent<HTMLDivElement>): void => {
    const newContent = e.currentTarget.innerHTML;
    handleContentChange(newContent);
  };

  /**
   * Handle content change for text editor
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    handleContentChange(e.target.value);
  };

  return (
    <div className="inline-editor">
      <div className="inline-editor__container">
        {contentType === 'text' ? (
          <textarea
            ref={editorRef as React.RefObject<HTMLTextAreaElement>}
            className="inline-editor__textarea"
            value={content}
            onChange={handleTextChange}
            placeholder="Enter content..."
            disabled={isSaving}
            rows={3}
          />
        ) : (
          <div
            ref={editorRef as React.RefObject<HTMLDivElement>}
            className="inline-editor__html"
            contentEditable
            dangerouslySetInnerHTML={{ __html: content }}
            onInput={handleHtmlInput}
            suppressContentEditableWarning
          />
        )}

        <div className="inline-editor__toolbar">
          <div className="inline-editor__info">
            <span className="inline-editor__status">
              {isSaving ? '<Icon name="save" size={16} /> Saving...' : '<Icon name="edit" size={16} /> Editing'}
            </span>
            
            <span className="inline-editor__shortcuts">
              Ctrl+Enter to save, Esc to cancel
            </span>
          </div>

          <div className="inline-editor__actions">
            <button
              className="inline-editor__action inline-editor__action--cancel"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <Icon name="arrow-left" size={16} /> Cancel
            </button>
            
            <button
              className="inline-editor__action inline-editor__action--save"
              onClick={handleSave}
              disabled={isSaving || content.trim() === ''}
            >
              {isSaving ? '⏳ Saving...' : '<Icon name="save" size={16} /> Save'}
            </button>
          </div>
        </div>

        {error && (
          <div className="inline-editor__error">
            <Icon name="delete" size={16} />
            <span className="inline-editor__error-text">{error}</span>
          </div>
        )}
      </div>

      {/* Lock indicator */}
      <div className="inline-editor__lock-indicator">
        🔒 Content locked for editing
      </div>
    </div>
  );
};

export default InlineEditor;
