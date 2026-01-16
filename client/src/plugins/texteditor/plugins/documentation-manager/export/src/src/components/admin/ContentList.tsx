import { Icon } from '../../../../../../../../../ui-system/icons/components';
/**
 * Content List Component
 * List of content items with actions
 * Max 200 lines - strict TypeScript compliance
 */

import React from 'react';
import { ContentItem } from '../../types/SharedTypes';

interface ContentListProps {
  readonly content: ContentItem[];
  readonly selectedContent: ContentItem | null;
  readonly onSelect: (content: ContentItem) => void;
  readonly onEdit: (content: ContentItem) => void;
  readonly onDelete: (contentId: string) => void;
  readonly isEditing: boolean;
}

/**
 * List component for displaying and managing content items
 */
export const ContentList: React.FC<ContentListProps> = ({
  content,
  selectedContent,
  onSelect,
  onEdit,
  onDelete,
  isEditing
}) => {
  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Truncate text for preview
   */
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  /**
   * Strip HTML tags for preview
   */
  const stripHtml = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <div className="content-list">
      <div className="content-list__header">
        <h3 className="content-list__title">Content Items</h3>
        <span className="content-list__count">{content.length} items</span>
      </div>

      <div className="content-list__items">
        {content.map(item => (
          <div
            key={item.id}
            className={`content-item ${selectedContent?.id === item.id ? 'content-item--selected' : ''}`}
            onClick={() => onSelect(item)}
          >
            <div className="content-item__header">
              <h4 className="content-item__title">{item.title}</h4>
              
              <div className="content-item__status">
                <span className={`status-badge ${item.isPublished ? 'status-badge--published' : 'status-badge--draft'}`}>
                  {item.isPublished ? '✅ Published' : '📝 Draft'}
                </span>
              </div>
            </div>

            <div className="content-item__body">
              {item.excerpt ? (
                <p className="content-item__excerpt">
                  {truncateText(item.excerpt)}
                </p>
              ) : (
                <p className="content-item__preview">
                  {truncateText(stripHtml(item.content))}
                </p>
              )}
            </div>

            <div className="content-item__meta">
              <span className="content-item__date">
                📅 {formatDate(item.updatedAt)}
              </span>
              
              {item.updatedBy && (
                <span className="content-item__author">
                  👤 {item.updatedBy}
                </span>
              )}
              
              <span className="content-item__slug">
                🔗 #{item.slug}
              </span>
            </div>

            <div className="content-item__actions">
              <button
                className="content-item__action content-item__action--edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                disabled={isEditing}
                title="Edit content"
              >
                <Icon name="edit" size={16} /> Edit
              </button>
              
              <button
                className="content-item__action content-item__action--view"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/plugins/texteditor/documentation-${item.libraryType}#${item.slug}`, '_blank');
                }}
                title="View on library page"
              >
                👁️ View
              </button>
              
              <button
                className="content-item__action content-item__action--delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                disabled={isEditing}
                title="Delete content"
              >
                <Icon name="delete" size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {content.length === 0 && (
        <div className="content-list__empty">
          <p>No content items found.</p>
        </div>
      )}
    </div>
  );
};

export default ContentList;
