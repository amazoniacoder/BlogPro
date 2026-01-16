import { Icon } from '../../../../../../../../ui-system/icons/components';
/**
 * Integrated Text Editor Component
 * Uses BlogPro text editor for documentation content creation/editing
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { LibraryContext } from '../types/LibraryContext';

// Mock TextEditor import - in real implementation, import from BlogPro text editor
// import { TextEditor } from '../../../texteditor/components/TextEditor';

interface IntegratedTextEditorProps {
  contentId?: string;
  initialContent?: string;
  libraryContext: LibraryContext;
  onSave: (content: string) => Promise<void>;
  onCancel?: () => void;
}

export const IntegratedTextEditor: React.FC<IntegratedTextEditorProps> = ({
  contentId,
  initialContent = '',
  libraryContext,
  onSave,
  onCancel
}) => {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      await onSave(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [content, onSave]);

  const editorConfig = useMemo(() => ({
    toolbar: {
      formatting: true,
      codeBlocks: libraryContext.features.codeBlocks,
      mediaUpload: libraryContext.features.mediaUpload,
      advancedFormatting: libraryContext.features.advancedFormatting
    },
    placeholder: `Create ${libraryContext.libraryName} content...`,
    autoSave: true,
    saveInterval: 30000, // 30 seconds
    features: libraryContext.features
  }), [libraryContext]);

  // Auto-save functionality
  useEffect(() => {
    if (!editorConfig.autoSave || !content || content === initialContent) return;

    const autoSaveTimer = setTimeout(() => {
      if (content !== initialContent) {
        handleSave();
      }
    }, editorConfig.saveInterval);

    return () => clearTimeout(autoSaveTimer);
  }, [content, initialContent, editorConfig.autoSave, editorConfig.saveInterval, handleSave]);

  return (
    <div className={`integrated-text-editor library-${libraryContext.libraryType}`}>
      <div className="editor-header">
        <div className="editor-title">
          <h3>Content Editor - {libraryContext.libraryName}</h3>
          {contentId && (
            <span className="editor-id">ID: {contentId}</span>
          )}
        </div>
        
        <div className="editor-actions">
          <button 
            onClick={handleSave} 
            disabled={saving || !content.trim()}
            className="save-button"
          >
            {saving ? '<Icon name="save" size={16} /> Saving...' : '<Icon name="save" size={16} /> Save'}
          </button>
          {onCancel && (
            <button onClick={onCancel} className="cancel-button">
              <Icon name="arrow-left" size={16} /> Cancel
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="editor-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="editor-toolbar">
        <div className="toolbar-section">
          <span className="toolbar-label">Features:</span>
          {libraryContext.features.codeBlocks && <span className="feature-tag">Code</span>}
          {libraryContext.features.mediaUpload && <span className="feature-tag">Media</span>}
          {libraryContext.features.advancedFormatting && <span className="feature-tag">Format</span>}
        </div>
      </div>

      <div className="editor-container">
        {/* Mock text editor - replace with actual BlogPro TextEditor */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={editorConfig.placeholder}
          className="mock-text-editor"
          rows={20}
        />
        
        {/* Real implementation would use:
        <TextEditor
          initialContent={content}
          onChange={setContent}
          config={editorConfig}
          onSave={handleSave}
        />
        */}
      </div>

      <div className="editor-footer">
        <div className="editor-stats">
          <span>Characters: {content.length}</span>
          <span>Words: {content.split(/\s+/).filter(w => w.length > 0).length}</span>
        </div>
        
        <div className="editor-status">
          {saving && <span className="status-saving">Saving...</span>}
          {!saving && content !== initialContent && (
            <span className="status-modified">Modified</span>
          )}
          {!saving && content === initialContent && (
            <span className="status-saved">Saved</span>
          )}
        </div>
      </div>
    </div>
  );
};
