import { Icon } from '../../../../../../../../../ui-system/icons/components';
/**
 * Minimal Content Component
 * Database-driven content with fallback placeholders
 * Max 300 lines - strict TypeScript compliance
 */

import React, { useState, useEffect } from 'react';
import { LibraryType, ContentItem } from '../../types/SharedTypes';
import { useLibraryContent } from '../../hooks/useLibraryContent';
import { useUserRole } from '../../hooks/useUserRole';
import { useWebSocketUpdates } from '../../hooks/useWebSocketUpdates';
import { useContentManagement } from '../../hooks/useContentManagement';
import { ContextMenu } from '../common/ContextMenu';
import { InlineEditor } from '../common/InlineEditor';

interface MinimalContentProps {
  readonly libraryType: LibraryType;
}

/**
 * Main content component that displays database content or fallback placeholders
 */
export const MinimalContent: React.FC<MinimalContentProps> = ({ libraryType }) => {
  const { content, loading, error, reload } = useLibraryContent(libraryType);
  const { canEdit } = useUserRole();
  const { contentLocks } = useWebSocketUpdates(libraryType);
  const { updateContent } = useContentManagement(libraryType);
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    x: 0,
    y: 0,
    contentId: ''
  });
  const [editingContent, setEditingContent] = useState<{
    contentId: string;
    type: 'text' | 'html';
    initialContent: string;
  } | null>(null);

  /**
   * Listen for admin mode toggle and inline edit events
   */
  useEffect(() => {
    const handleAdminModeToggle = (e: CustomEvent): void => {
      setIsAdminMode(e.detail.isAdminMode);
    };

    const handleStartInlineEdit = (e: CustomEvent): void => {
      const { contentId } = e.detail;
      const contentItem = content.find(item => item.id === contentId);
      
      if (contentItem && canEdit && isAdminMode) {
        setEditingContent({
          contentId,
          type: 'html',
          initialContent: contentItem.content
        });
      }
    };

    window.addEventListener('adminModeToggle', handleAdminModeToggle as EventListener);
    window.addEventListener('startInlineEdit', handleStartInlineEdit as EventListener);
    
    return () => {
      window.removeEventListener('adminModeToggle', handleAdminModeToggle as EventListener);
      window.removeEventListener('startInlineEdit', handleStartInlineEdit as EventListener);
    };
  }, [content, canEdit, isAdminMode]);

  /**
   * Handle context menu for admin users
   */
  const handleContextMenu = (e: React.MouseEvent, contentId: string): void => {
    if (!canEdit || !isAdminMode) return;

    e.preventDefault();
    setContextMenu({
      isVisible: true,
      x: e.clientX,
      y: e.clientY,
      contentId
    });
  };

  /**
   * Handle double-click for inline editing
   */
  const handleDoubleClick = (e: React.MouseEvent, contentId: string): void => {
    if (!canEdit || !isAdminMode) return;

    const element = e.target as HTMLElement;
    // Dispatch inline edit event
    window.dispatchEvent(new CustomEvent('startInlineEdit', {
      detail: { contentId, element }
    }));
  };

  /**
   * Handle saving inline edited content
   */
  const handleSaveInlineContent = async (newContent: string): Promise<void> => {
    if (!editingContent) return;
    
    await updateContent(editingContent.contentId, { content: newContent });
    await reload();
    setEditingContent(null);
  };

  /**
   * Handle canceling inline edit
   */
  const handleCancelInlineEdit = (): void => {
    setEditingContent(null);
  };

  /**
   * Render database content sections
   */
  const renderDatabaseContent = (): React.ReactNode => {
    return content.map(item => {
      const isLocked = contentLocks.has(item.id);
      const lock = contentLocks.get(item.id);
      const isEditing = editingContent?.contentId === item.id;
      
      return (
        <section 
          key={item.id} 
          id={item.slug}
          className={`content-section ${
            canEdit && isAdminMode ? 'content-section--editable' : ''
          } ${
            isLocked ? 'content-section--locked' : ''
          }`}
          onContextMenu={(e) => handleContextMenu(e, item.id)}
          onDoubleClick={(e) => handleDoubleClick(e, item.id)}
          data-content-id={item.id}
          data-locked-by={lock?.userName}
        >
          <h2 className="content-section__title">{item.title}</h2>
          
          {isEditing ? (
            <InlineEditor
              contentId={item.id}
              initialContent={item.content}
              contentType="html"
              libraryType={libraryType}
              onSave={handleSaveInlineContent}
              onCancel={handleCancelInlineEdit}
            />
          ) : (
            <div 
              className="content-section__body"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          )}
          
          {item.excerpt && (
            <p className="content-section__excerpt">{item.excerpt}</p>
          )}
          
          {isLocked && (
            <div className="content-section__lock-notice">
              🔒 Being edited by {lock?.userName}
            </div>
          )}
        </section>
      );
    });
  };

  /**
   * Render fallback placeholder content
   */
  const renderPlaceholderContent = (): React.ReactNode => {
    const placeholders = libraryType === 'texteditor' 
      ? getTextEditorPlaceholders()
      : getSitePlaceholders();

    return placeholders.map(placeholder => (
      <section key={placeholder.id} id={placeholder.slug} className="content-section">
        <h2 className="content-section__title">{placeholder.title}</h2>
        <div 
          className="content-section__body"
          dangerouslySetInnerHTML={{ __html: placeholder.content }}
        />
      </section>
    ));
  };

  /**
   * Get text editor placeholder content
   */
  const getTextEditorPlaceholders = (): ContentItem[] => {
    return [
      {
        id: 'placeholder-1',
        title: 'Welcome to Text Editor Documentation',
        slug: 'getting-started',
        content: `
          <div class="hero">
            <h1 class="hero__title">BlogPro Text Editor</h1>
            <p class="hero__subtitle">Professional text editing with advanced features and real-time collaboration.</p>
            <div class="hero-stats">
              <div class="stat">
                <span class="stat__value">99.97%</span>
                <span class="stat__label">Memory Reduction</span>
              </div>
              <div class="stat">
                <span class="stat__value">85%+</span>
                <span class="stat__label">Test Coverage</span>
              </div>
              <div class="stat">
                <span class="stat__value">60fps</span>
                <span class="stat__label">Performance</span>
              </div>
            </div>
          </div>
        `,
        excerpt: 'Get started with the BlogPro text editor',
        libraryType: 'texteditor',
        isPublished: true,
        orderIndex: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  };

  /**
   * Get site placeholder content
   */
  const getSitePlaceholders = (): ContentItem[] => {
    return [
      {
        id: 'placeholder-1',
        title: 'Welcome to Website Documentation',
        slug: 'user-guide',
        content: `
          <div class="hero">
            <h1 class="hero__title">BlogPro Website</h1>
            <p class="hero__subtitle">Complete guide to using the BlogPro platform and its features.</p>
          </div>
        `,
        excerpt: 'Learn how to use the BlogPro website',
        libraryType: 'site',
        isPublished: true,
        orderIndex: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  };

  if (loading) {
    return (
      <div className="content-loading">
        <span className="loading-spinner">⏳</span>
        <p>Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-error">
        <Icon name="delete" size={16} />
        <p>Failed to load content: {error}</p>
        <p>
          <a href="/plugins/texteditor/documentation-manager">
            Create content in admin panel
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="minimal-content">
      {content.length > 0 ? renderDatabaseContent() : renderPlaceholderContent()}
      
      {canEdit && isAdminMode && (
        <div className="admin-notice">
          <p>🔓 Admin mode active - Right-click to edit content</p>
        </div>
      )}

      <ContextMenu
        isVisible={contextMenu.isVisible}
        x={contextMenu.x}
        y={contextMenu.y}
        contentId={contextMenu.contentId}
        onClose={() => setContextMenu(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default MinimalContent;
