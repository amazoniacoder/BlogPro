import { Icon } from '../../../../../../../../ui-system/icons/components';
/**
 * Inline Editor Component
 * Provides in-place editing for text and content
 */

import React, { useState, useEffect, useRef } from 'react';

interface InlineEditorProps {
  contentId: string;
  initialContent: string;
  contentType: 'text' | 'html' | 'markdown';
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
  initialContent,
  contentType,
  onSave,
  onCancel
}) => {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [content]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(content);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inline-editor">
      {contentType === 'html' || contentType === 'markdown' ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="editor-textarea"
          rows={6}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="editor-input"
          type="text"
        />
      )}

      <div className="editor-actions">
        <button onClick={handleSave} disabled={saving}>
          {saving ? '<Icon name="save" size={16} /> Saving...' : '<Icon name="save" size={16} /> Save'}
        </button>
        <button onClick={onCancel}><Icon name="arrow-left" size={16} /> Cancel</button>
        <small className="editor-hint">
          Ctrl+Enter to save, Esc to cancel
        </small>
      </div>
    </div>
  );
};
