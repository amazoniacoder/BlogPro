/**
 * Content Editor Component
 * Visual editing interface with syntax highlighting and live preview
 * Max 400 lines, strict TypeScript compliance
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DocumentFile } from '../types/Documentation';

interface ContentEditorProps {
  readonly file: DocumentFile;
  readonly onSave: (filePath: string, content: string) => void;
}

interface EditorState {
  readonly content: string;
  readonly hasChanges: boolean;
  readonly isEditing: boolean;
  readonly cursorPosition: number;
  readonly selectedText: string;
}

interface EditorAction {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly shortcut?: string;
  readonly action: () => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({ file, onSave }) => {
  const [state, setState] = useState<EditorState>({
    content: file.content || '',
    hasChanges: false,
    isEditing: false,
    cursorPosition: 0,
    selectedText: ''
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const originalContent = useRef<string>(file.content || '');

  /**
   * Update content when file changes
   */
  useEffect(() => {
    setState(prev => ({
      ...prev,
      content: file.content || '',
      hasChanges: false
    }));
    originalContent.current = file.content || '';
  }, [file.content, file.path]);

  /**
   * Handle content changes
   */
  const handleContentChange = useCallback((newContent: string) => {
    setState(prev => ({
      ...prev,
      content: newContent,
      hasChanges: newContent !== originalContent.current
    }));
  }, []);

  /**
   * Save file content
   */
  const handleSave = useCallback(() => {
    if (state.hasChanges) {
      onSave(file.path, state.content);
      originalContent.current = state.content;
      setState(prev => ({ ...prev, hasChanges: false }));
    }
  }, [state.content, state.hasChanges, file.path, onSave]);

  /**
   * Reset content to original
   */
  const handleReset = useCallback(() => {
    setState(prev => ({
      ...prev,
      content: originalContent.current,
      hasChanges: false
    }));
  }, []);

  /**
   * Toggle editing mode
   */
  const toggleEditMode = useCallback(() => {
    setState(prev => ({ ...prev, isEditing: !prev.isEditing }));
  }, []);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'z':
          if (!e.shiftKey) {
            e.preventDefault();
            // TODO: Implement undo
          }
          break;
      }
    }
  }, [handleSave]);

  /**
   * Insert text at cursor position
   */
  const insertText = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = state.content.substring(0, start) + text + state.content.substring(end);
    
    handleContentChange(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  }, [state.content, handleContentChange]);

  /**
   * Format selected text
   */
  const formatText = useCallback((prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = state.content.substring(start, end);
    
    if (selectedText) {
      const formattedText = prefix + selectedText + suffix;
      const newContent = state.content.substring(0, start) + formattedText + state.content.substring(end);
      handleContentChange(newContent);
      
      // Restore selection
      setTimeout(() => {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = start + prefix.length + selectedText.length;
        textarea.focus();
      }, 0);
    }
  }, [state.content, handleContentChange]);

  /**
   * Get editor actions based on file type
   */
  const getEditorActions = useCallback((): EditorAction[] => {
    const commonActions: EditorAction[] = [
      {
        id: 'save',
        label: 'Save',
        icon: '<Icon name="save" size={16} />',
        shortcut: 'Ctrl+S',
        action: handleSave
      },
      {
        id: 'reset',
        label: 'Reset',
        icon: '↶',
        action: handleReset
      }
    ];

    if (file.type === 'markdown') {
      return [
        ...commonActions,
        {
          id: 'bold',
          label: 'Bold',
          icon: '𝐁',
          shortcut: 'Ctrl+B',
          action: () => formatText('**', '**')
        },
        {
          id: 'italic',
          label: 'Italic',
          icon: '𝐼',
          action: () => formatText('*', '*')
        },
        {
          id: 'code',
          label: 'Code',
          icon: '</>',
          action: () => formatText('`', '`')
        },
        {
          id: 'link',
          label: 'Link',
          icon: '🔗',
          action: () => formatText('[', '](url)')
        }
      ];
    }

    if (file.type === 'html') {
      return [
        ...commonActions,
        {
          id: 'heading',
          label: 'Heading',
          icon: 'H',
          action: () => insertText('<h2></h2>')
        },
        {
          id: 'paragraph',
          label: 'Paragraph',
          icon: 'P',
          action: () => insertText('<p></p>')
        }
      ];
    }

    return commonActions;
  }, [file.type, handleSave, handleReset, formatText, insertText]);

  /**
   * Get syntax highlighting class
   */
  const getSyntaxClass = useCallback((): string => {
    switch (file.type) {
      case 'html': return 'language-html';
      case 'markdown': return 'language-markdown';
      case 'json': return 'language-json';
      case 'css': return 'language-css';
      case 'javascript': return 'language-javascript';
      case 'typescript': return 'language-typescript';
      default: return 'language-text';
    }
  }, [file.type]);

  const actions = getEditorActions();

  return (
    <div className="content-editor">
      {/* Editor Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <span className="file-info">
            📄 {file.name} ({file.type})
          </span>
          {state.hasChanges && <span className="unsaved-indicator">●</span>}
        </div>
        
        <div className="toolbar-center">
          {actions.map(action => (
            <button
              key={action.id}
              className="toolbar-btn"
              onClick={action.action}
              title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ''}`}
              disabled={action.id === 'save' && !state.hasChanges}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
        
        <div className="toolbar-right">
          <button
            className={`mode-toggle ${state.isEditing ? 'editing' : 'preview'}`}
            onClick={toggleEditMode}
          >
            {state.isEditing ? '👁️ Preview' : '<Icon name="edit" size={16} /> Edit'}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="editor-content">
        {state.isEditing ? (
          <textarea
            ref={textareaRef}
            className={`editor-textarea ${getSyntaxClass()}`}
            value={state.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start typing your content..."
            spellCheck={file.type === 'markdown'}
          />
        ) : (
          <div className="editor-preview">
            {file.type === 'markdown' ? (
              <div 
                className="markdown-preview"
                dangerouslySetInnerHTML={{ 
                  __html: state.content.replace(/\n/g, '<br>') 
                }}
              />
            ) : (
              <pre className={getSyntaxClass()}>
                <code>{state.content}</code>
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Editor Status */}
      <div className="editor-status">
        <div className="status-left">
          <span>Lines: {state.content.split('\n').length}</span>
          <span>Characters: {state.content.length}</span>
          <span>Words: {state.content.split(/\s+/).filter(w => w).length}</span>
        </div>
        
        <div className="status-right">
          {state.hasChanges ? (
            <span className="status-unsaved">Unsaved changes</span>
          ) : (
            <span className="status-saved">All changes saved</span>
          )}
        </div>
      </div>
    </div>
  );
};
