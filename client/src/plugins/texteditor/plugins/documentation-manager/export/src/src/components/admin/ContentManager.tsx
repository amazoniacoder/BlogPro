import { Icon } from '../../../../../../../../../ui-system/icons/components';
/**
 * Content Manager Component
 * Main interface for creating and editing documentation content
 * Max 300 lines - strict TypeScript compliance
 */

import React, { useState } from 'react';
import { LibraryType, ContentItem, Section } from '../../types/SharedTypes';
import { useLibraryContent } from '../../hooks/useLibraryContent';
import { useContentManagement } from '../../hooks/useContentManagement';
import { ContentList } from './ContentList';
import { ContentForm } from './ContentForm';

interface ContentManagerProps {
  readonly libraryType: LibraryType;
  readonly textEditor: React.ReactNode;
}

/**
 * Content manager with list and editing interface
 */
export const ContentManager: React.FC<ContentManagerProps> = ({
  libraryType,
  textEditor
}) => {
  const { content, sections, loading, error, reload } = useLibraryContent(libraryType);
  const { createContent, updateContent, deleteContent } = useContentManagement(libraryType);
  
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Handle creating new content
   */
  const handleCreate = (): void => {
    setSelectedContent(null);
    setIsCreating(true);
    setIsEditing(true);
  };

  /**
   * Handle editing existing content
   */
  const handleEdit = (content: ContentItem): void => {
    setSelectedContent(content);
    setIsCreating(false);
    setIsEditing(true);
  };

  /**
   * Handle saving content (create or update)
   */
  const handleSave = async (contentData: Partial<ContentItem>): Promise<void> => {
    try {
      if (isCreating) {
        await createContent({
          ...contentData,
          libraryType,
          isPublished: false,
          orderIndex: content.length + 1
        } as ContentItem);
      } else if (selectedContent) {
        await updateContent(selectedContent.id, contentData);
      }
      
      await reload();
      handleCancel();
    } catch (error) {
      console.error('Failed to save content:', error);
      throw error;
    }
  };

  /**
   * Handle deleting content
   */
  const handleDelete = async (contentId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      await deleteContent(contentId);
      await reload();
      
      // Clear selection if deleted content was selected
      if (selectedContent?.id === contentId) {
        handleCancel();
      }
    } catch (error) {
      console.error('Failed to delete content:', error);
      throw error;
    }
  };

  /**
   * Handle canceling edit/create
   */
  const handleCancel = (): void => {
    setSelectedContent(null);
    setIsCreating(false);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="content-manager content-manager--loading">
        <div className="loading-spinner">
          <span>⏳</span>
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-manager content-manager--error">
        <div className="error-message">
          <Icon name="delete" size={16} />
          <p>Failed to load content: {error}</p>
          <button onClick={reload} className="retry-button">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-manager">
      <div className="content-manager__header">
        <h2 className="content-manager__title">
          {libraryType === 'texteditor' ? '📝 Text Editor' : '🌐 Website'} Content
        </h2>
        
        <div className="content-manager__stats">
          <span className="stat">
            📄 {content.length} documents
          </span>
          <span className="stat">
            ✅ {content.filter(c => c.is_published).length} published
          </span>
        </div>

        <button
          className="content-manager__create-btn"
          onClick={handleCreate}
          disabled={isEditing}
        >
          <Icon name="add" size={16} /> Create New
        </button>
      </div>

      <div className="content-manager__body">
        {/* Content List */}
        <div className="content-manager__list">
          <ContentList
            content={content.map(c => ({
              ...c,
              libraryType: c.library_type || libraryType,
              isPublished: c.is_published,
              orderIndex: c.order_index,
              createdAt: c.created_at,
              updatedAt: c.updated_at
            } as ContentItem))}
            selectedContent={selectedContent}
            onSelect={setSelectedContent}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditing={isEditing}
          />
        </div>

        {/* Content Editor */}
        {isEditing && (
          <div className="content-manager__editor">
            <ContentForm
              content={selectedContent}
              sections={sections.map(s => ({
                ...s,
                orderIndex: s.order_index,
                isActive: s.is_active,
                libraryType: s.library_type || libraryType
              } as Section))}
              textEditor={textEditor}
              isCreating={isCreating}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {content.length === 0 && !isEditing && (
        <div className="content-manager__empty">
          <div className="empty-state">
            <span className="empty-state__icon">📄</span>
            <h3 className="empty-state__title">No content yet</h3>
            <p className="empty-state__description">
              Create your first documentation page for the {libraryType} library.
            </p>
            <button
              className="empty-state__action"
              onClick={handleCreate}
            >
              <Icon name="add" size={16} /> Create First Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;
