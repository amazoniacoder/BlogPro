/**
 * Preview Pane Component
 * Live preview of documentation content with rendering
 * Max 400 lines, strict TypeScript compliance
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DocumentFile } from '../types/Documentation';

interface PreviewPaneProps {
  readonly file: DocumentFile;
  readonly onRefresh: () => void;
}

interface PreviewState {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly renderedContent: string;
  readonly previewMode: PreviewMode;
}

type PreviewMode = 'rendered' | 'source' | 'split';

export const PreviewPane: React.FC<PreviewPaneProps> = ({ file, onRefresh }) => {
  const [state, setState] = useState<PreviewState>({
    isLoading: false,
    error: null,
    renderedContent: '',
    previewMode: 'rendered'
  });

  /**
   * Process content based on file type
   */
  const processContent = useCallback(async (content: string, fileType: string): Promise<string> => {
    switch (fileType) {
      case 'markdown':
        return processMarkdown(content);
      case 'html':
        return content;
      case 'json':
        return processJSON(content);
      default:
        return `<pre><code>${escapeHtml(content)}</code></pre>`;
    }
  }, []);

  /**
   * Process Markdown content to HTML
   */
  const processMarkdown = useCallback((content: string): string => {
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');

    return `<div class="markdown-content">${html}</div>`;
  }, []);

  /**
   * Process JSON content with syntax highlighting
   */
  const processJSON = useCallback((content: string): string => {
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      return `<pre><code class="language-json">${escapeHtml(formatted)}</code></pre>`;
    } catch (error) {
      return `<div class="json-error">Invalid JSON: ${error}</div>`;
    }
  }, []);

  /**
   * Escape HTML characters
   */
  const escapeHtml = useCallback((text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }, []);

  /**
   * Update rendered content when file changes
   */
  useEffect(() => {
    const updateContent = async () => {
      if (!file.content) return;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const rendered = await processContent(file.content, file.type);
        setState(prev => ({
          ...prev,
          renderedContent: rendered,
          isLoading: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: `Failed to render content: ${error}`,
          isLoading: false
        }));
      }
    };

    updateContent();
  }, [file.content, file.type, processContent]);

  /**
   * Handle preview mode change
   */
  const handleModeChange = useCallback((mode: PreviewMode) => {
    setState(prev => ({ ...prev, previewMode: mode }));
  }, []);

  /**
   * Get file type icon
   */
  const getFileTypeIcon = useCallback((): string => {
    switch (file.type) {
      case 'html': return '🌐';
      case 'markdown': return '📝';
      case 'json': return '📋';
      case 'css': return '🎨';
      case 'javascript':
      case 'typescript': return '⚡';
      default: return '📄';
    }
  }, [file.type]);

  /**
   * Format file size
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  /**
   * Get content statistics
   */
  const contentStats = useMemo(() => {
    if (!file.content) return { lines: 0, words: 0, characters: 0 };
    
    const lines = file.content.split('\n').length;
    const words = file.content.split(/\s+/).filter(w => w.trim()).length;
    const characters = file.content.length;
    
    return { lines, words, characters };
  }, [file.content]);

  /**
   * Render preview content based on mode
   */
  const renderPreviewContent = (): React.ReactNode => {
    if (state.isLoading) {
      return <div className="preview-loading">Rendering content...</div>;
    }

    if (state.error) {
      return (
        <div className="preview-error">
          <p>{state.error}</p>
          <button onClick={onRefresh}>Retry</button>
        </div>
      );
    }

    switch (state.previewMode) {
      case 'rendered':
        return (
          <div 
            className="preview-rendered"
            dangerouslySetInnerHTML={{ __html: state.renderedContent }}
          />
        );
      
      case 'source':
        return (
          <pre className="preview-source">
            <code>{file.content}</code>
          </pre>
        );
      
      case 'split':
        return (
          <div className="preview-split">
            <div className="split-source">
              <h4>Source</h4>
              <pre><code>{file.content}</code></pre>
            </div>
            <div className="split-rendered">
              <h4>Rendered</h4>
              <div dangerouslySetInnerHTML={{ __html: state.renderedContent }} />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="preview-pane">
      {/* Preview Header */}
      <div className="preview-header">
        <div className="header-left">
          <span className="file-icon">{getFileTypeIcon()}</span>
          <span className="file-name">{file.name}</span>
          <span className="file-size">({formatFileSize(file.size)})</span>
        </div>
        
        <div className="header-center">
          <div className="preview-mode-selector">
            <button
              className={`mode-btn ${state.previewMode === 'rendered' ? 'active' : ''}`}
              onClick={() => handleModeChange('rendered')}
            >
              👁️ Rendered
            </button>
            <button
              className={`mode-btn ${state.previewMode === 'source' ? 'active' : ''}`}
              onClick={() => handleModeChange('source')}
            >
              📄 Source
            </button>
            <button
              className={`mode-btn ${state.previewMode === 'split' ? 'active' : ''}`}
              onClick={() => handleModeChange('split')}
            >
              ⚡ Split
            </button>
          </div>
        </div>
        
        <div className="header-right">
          <button onClick={onRefresh} title="Refresh preview">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="preview-content">
        {renderPreviewContent()}
      </div>

      {/* Preview Footer */}
      <div className="preview-footer">
        <div className="content-stats">
          <span className="stat-item">
            📏 {contentStats.lines} lines
          </span>
          <span className="stat-item">
            📝 {contentStats.words} words
          </span>
          <span className="stat-item">
            🔤 {contentStats.characters} characters
          </span>
        </div>
        
        <div className="file-info">
          <span className="file-type">Type: {file.type}</span>
          <span className="last-modified">
            Modified: {file.lastModified.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
