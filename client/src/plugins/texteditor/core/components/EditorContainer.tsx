/**
 * Editor Container Component
 * 
 * Main container that orchestrates all editor components.
 */

import React, { useRef, useState, useEffect } from 'react';
import { Toolbar } from './Toolbar';
import { EditorCore } from './EditorCore';
import { PluginManagerComponent } from './PluginManagerComponent';
import { useFormatState } from '../hooks/useFormatState';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useEditorHandlers } from '../hooks/useEditorHandlers';
import { useEditorCommandHandler } from './handlers/EditorCommandHandler';
import { useEditorSelectionHandler } from './handlers/EditorSelectionHandler';
import { useEditorFocusHandler } from './handlers/EditorFocusHandler';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';
import { useAccessibility } from '../hooks/useAccessibility';
import { ServiceFactory } from '../services/ServiceFactory';
import TableColorEditor from './TableColorEditor';
import CellColorEditor from './CellColorEditor';
import { AdminAnalyticsMenu } from './analytics/AdminAnalyticsMenu';
import { PluginModal } from './modals/PluginModal';
import { ComponentModal } from './modals/ComponentModal';
import './ContentEditableEditor.css';

export interface EditorProps {
  readonly initialContent?: string;
  readonly onChange?: (content: string) => void;
  readonly onSave?: (content: string) => Promise<void>;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly className?: string;
  readonly 'data-testid'?: string;
  readonly userRole?: string;
  readonly postId?: number; // Blog post ID for database integration
  readonly autoLoad?: boolean; // Auto-load content from database
}

export const EditorContainer: React.FC<EditorProps> = ({
  initialContent = '',
  onChange,
  onSave,
  placeholder = 'Start typing...',
  readOnly = false,
  className = '',
  userRole = 'admin',
  postId,
  autoLoad = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentContent, setCurrentContent] = useState(initialContent);
  const [spellCheckEnabled] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [showFooterMenu, setShowFooterMenu] = useState(false);
  const [showPluginModal, setShowPluginModal] = useState<string | null>(null);
  const [showComponentModal, setShowComponentModal] = useState<string | null>(null);
  const footerMenuRef = useRef<HTMLDivElement>(null);

  

  
  // Plugin panel handlers
  const handlePluginClick = (pluginType: string) => {
    if (pluginType === 'documentation-manager') {
      // Documentation opens in new page
      const pluginButton = document.querySelector('.documentation-manager-button') as HTMLButtonElement;
      if (pluginButton) {
        pluginButton.click();
      }
    } else {
      // All other plugins open in modal
      setShowPluginModal(pluginType);
    }
    setShowFooterMenu(false);
  };

  const { trackRender, trackOperation } = usePerformanceMonitoring();
  const renderStartTime = useRef<number>(0);
  
  // Accessibility hook
  useAccessibility(editorRef);
  
  // Format state management
  const { formatState, updateFormatState, immediateUpdateFormatState } = useFormatState(editorRef);
  const [historyService, setHistoryService] = useState<any>(null);
  
  // Initialize history service asynchronously
  useEffect(() => {
    const initHistoryService = async () => {
      try {
        // Use direct instantiation to avoid circular dependency
        const { HistoryService } = await import('../services/HistoryService');
        setHistoryService(new HistoryService());
      } catch (error) {
        console.error('Failed to initialize history service:', error);
        setHistoryService(null);
      }
    };
    initHistoryService();
  }, []);

  // Load content from database
  const loadBlogContent = async (blogPostId: number) => {
    console.log('📚 EditorContainer: Loading blog content from database', { blogPostId });
    setIsLoadingContent(true);
    try {
      const response = await fetch(`/api/blog/${blogPostId}`);
      if (response.ok) {
        const result = await response.json();
        const blogPost = result.data;
        console.log('✅ EditorContainer: Successfully loaded blog content from database', {
          blogPostId,
          title: blogPost.title,
          contentLength: blogPost.content?.length || 0,
          status: blogPost.status
        });
        
        // Deserialize content for editor
        const { ContentSerializationService } = await import('../services/content/ContentSerializationService');
        const editorContent = ContentSerializationService.deserializeContent(blogPost.content);
        
        // Set content in editor
        if (editorRef.current) {
          editorRef.current.innerHTML = editorContent;
        }
        setCurrentContent(editorContent);
        onChange?.(editorContent);
        console.log('💾 EditorContainer: Blog content loaded into editor successfully');
      } else {
        console.error('❌ EditorContainer: Failed to load blog content - HTTP', response.status);
      }
    } catch (error) {
      console.error('❌ EditorContainer: Failed to load blog post content:', error);
      setError('Failed to load blog post content');
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Content change handler
  const handleContentChange = (content: string) => {
    trackOperation('content-change', () => {
      setCurrentContent(content);
      onChange?.(content);
    });
  };

  // Event handlers (only initialize when historyService is ready)
  const handlers = useEditorHandlers({
    editorRef,
    initialContent,
    onChange: handleContentChange,
    setContent,
    setError,
    updateFormatState
  });

  // Command handler (only when historyService is available)
  const { execCommand } = useEditorCommandHandler({
    editorRef,
    historyService,
    updateFormatState,
    onChange,
    onSave,
    setContent,
    setError,
    setIsLoading,
    setIsFullscreen,
    isFullscreen
  });

  // Keyboard shortcuts (only when historyService is available)
  useKeyboardShortcuts(editorRef, immediateUpdateFormatState, onSave, historyService, onChange);
  
  // Selection and focus handlers
  useEditorSelectionHandler({ editorRef, updateFormatState });
  useEditorFocusHandler({ editorRef });

  // Fullscreen mode effect
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('editor-fullscreen');
      document.documentElement.classList.add('editor-fullscreen');
    } else {
      document.body.classList.remove('editor-fullscreen');
      document.documentElement.classList.remove('editor-fullscreen');
    }
    
    return () => {
      document.body.classList.remove('editor-fullscreen');
      document.documentElement.classList.remove('editor-fullscreen');
    };
  }, [isFullscreen]);

  // Service cleanup on unmount
  useEffect(() => {
    return () => {
      ServiceFactory.cleanup();
    };
  }, []);

  // Load content on mount if postId provided
  useEffect(() => {
    if (postId && autoLoad) {
      loadBlogContent(postId);
    }
  }, [postId, autoLoad]);

  // Footer menu click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (footerMenuRef.current && !footerMenuRef.current.contains(event.target as Node)) {
        setShowFooterMenu(false);
      }
    };

    if (showFooterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFooterMenu]);
  
  // Modal escape key handler
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showPluginModal) setShowPluginModal(null);
        if (showComponentModal) setShowComponentModal(null);
      }
    };

    if (showPluginModal || showComponentModal) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [showPluginModal, showComponentModal]);
  
  // Plugin modal custom event handler
  useEffect(() => {
    const handlePluginModal = (event: CustomEvent) => {
      const { plugin } = event.detail;
      if (['security', 'performance', 'analytics', 'plugin'].includes(plugin)) {
        setShowPluginModal(plugin);
      } else {
        setShowComponentModal(plugin);
      }
    };

    document.addEventListener('openPluginModal', handlePluginModal as EventListener);
    return () => document.removeEventListener('openPluginModal', handlePluginModal as EventListener);
  }, []);
  
  // Global click outside handler for all modal overlays
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.classList.contains('analytics-modal-overlay') || 
          target.classList.contains('plugin-panel-overlay') ||
          target.classList.contains('plugin-modal-overlay') ||
          target.classList.contains('image-upload__panel') ||
          target.classList.contains('link-manager__panel') ||
          target.classList.contains('grid-editor__panel')) {
        // Close any open modals
        setShowPluginModal(null);
        setShowComponentModal(null);
        
        // Close analytics modal if open
        const analyticsCloseBtn = document.querySelector('.analytics-modal .close-button') as HTMLButtonElement;
        if (analyticsCloseBtn) {
          analyticsCloseBtn.click();
        }
        
        // Close plugin control panel if open
        const pluginPanelCloseBtn = document.querySelector('.plugin-control-panel .close-button') as HTMLButtonElement;
        if (pluginPanelCloseBtn) {
          pluginPanelCloseBtn.click();
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Performance tracking
  useEffect(() => {
    renderStartTime.current = performance.now();
  });
  
  useEffect(() => {
    if (renderStartTime.current > 0) {
      trackRender(renderStartTime.current);
    }
  });

  return (
    <div className={`contenteditable-editor ${className} ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className="editor-header">
        <Toolbar 
          formatState={formatState}
          onCommand={execCommand}
          isFullscreen={isFullscreen}
        />
        <div className="editor-header-right">
          {/* AutoSave plugin renders here */}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="editor-error-message" role="alert">
          {error}
          <button 
            onClick={() => setError(null)}
            className="error-dismiss"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {(isLoading || isLoadingContent) && (
        <div className="editor-loading" aria-live="polite">
          {isLoadingContent ? 'Loading content...' : 'Saving...'}
        </div>
      )}

      {/* Editor Core */}
      <EditorCore
        ref={editorRef}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheckEnabled={spellCheckEnabled}
        onInput={handlers.handleInput}
        onKeyDown={handlers.handleKeyDown}
        onClick={handlers.handleClick}
        onPaste={handlers.handlePaste}
        onContextMenu={handlers.handleContextMenu}
        error={error}
      />
      
      {/* Footer */}
      <div className="editor-footer">
        <div className="editor-footer-left">
          {/* SpellCheck plugin renders here */}
        </div>
        
        <div className="editor-footer-controls">
          {/* Word Counter */}
          <div className="plugin-word-count">
            {currentContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length} words
          </div>
          
          <PluginManagerComponent
            editorRef={editorRef}
            currentContent={currentContent}
            onContentChange={handleContentChange}
            onSave={onSave}
            userRole={userRole}
            spellCheckEnabled={spellCheckEnabled}
            onError={setError}
          />
          
          {/* Analytics Menu */}
          <AdminAnalyticsMenu 
            userRole={userRole}
            className="editor-analytics-menu plugin-performance"
          />
          
          {/* Footer menu toggle for responsive */}
          <button 
            type="button"
            className="editor-footer-menu-toggle"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Footer menu toggle clicked, current state:', showFooterMenu);
              setShowFooterMenu(!showFooterMenu);
            }}
            title="Show more tools"
          >
            ⋯
          </button>
        </div>
        
        {/* Collapsible footer menu */}
        {showFooterMenu && (
          <div 
            ref={footerMenuRef}
            className="editor-footer-menu editor-footer-menu--open"
          >
            <div className="editor-footer-menu__section">
              <div className="editor-footer-menu__title">Tools</div>
              <div className="editor-footer-menu__items">
                <button 
                  className="plugin-control-button"
                  onClick={() => handlePluginClick('documentation-manager')}
                >
                  Documentation
                </button>
                <button 
                  className="plugin-control-button"
                  onClick={() => handlePluginClick('performance')}
                >
                  Performance
                </button>
                <button 
                  className="plugin-control-button"
                  onClick={() => handlePluginClick('analytics')}
                >
                  Analytics
                </button>
                <button 
                  className="plugin-control-button"
                  onClick={() => handlePluginClick('security')}
                >
                  Security
                </button>
                <button 
                  className="plugin-control-button"
                  onClick={() => handlePluginClick('plugin')}
                >
                  Plugins
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Plugin Modal */}
      <PluginModal 
        showPluginModal={showPluginModal}
        onClose={() => setShowPluginModal(null)}
        userRole={userRole}
      />
      
      {/* Component Modal */}
      <ComponentModal 
        showComponentModal={showComponentModal}
        onClose={() => setShowComponentModal(null)}
      />
      
      {/* Additional Components */}
      <TableColorEditor />
      <CellColorEditor />
    </div>
  );
};
