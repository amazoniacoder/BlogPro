/**
 * Version Manager Component
 * Manages content versions and history
 * Max 150 lines - strict TypeScript compliance
 */

import React, { useState } from 'react';
import { LibraryType } from '../../types/SharedTypes';
import { useLibraryContent } from '../../hooks/useLibraryContent';

interface VersionManagerProps {
  readonly libraryType: LibraryType;
}

/**
 * Version manager for content history and restoration
 */
export const VersionManager: React.FC<VersionManagerProps> = ({ libraryType }) => {
  const { content, loading } = useLibraryContent(libraryType);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="version-manager version-manager--loading">
        <div className="loading-spinner">
          <span>⏳</span>
          <p>Loading versions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="version-manager">
      <div className="version-manager__header">
        <h2 className="version-manager__title">
          📋 {libraryType === 'texteditor' ? 'Text Editor' : 'Website'} Versions
        </h2>
      </div>

      <div className="version-manager__content">
        <div className="version-manager__sidebar">
          <h3 className="version-manager__sidebar-title">Content Items</h3>
          
          <div className="content-selector">
            {content.map(item => (
              <button
                key={item.id}
                className={`content-selector__item ${selectedContent === item.id ? 'content-selector__item--active' : ''}`}
                onClick={() => setSelectedContent(item.id)}
              >
                <span className="content-selector__title">{item.title}</span>
                <span className="content-selector__date">
                  {new Date(item.updated_at).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="version-manager__main">
          {selectedContent ? (
            <div className="version-history">
              <h3 className="version-history__title">Version History</h3>
              
              <div className="version-list">
                <div className="version-item version-item--current">
                  <div className="version-item__info">
                    <span className="version-item__number">Current</span>
                    <span className="version-item__date">
                      {new Date().toLocaleDateString()}
                    </span>
                    <span className="version-item__author">current_user</span>
                  </div>
                  
                  <div className="version-item__actions">
                    <button className="version-item__action">👁️ View</button>
                  </div>
                </div>
                
                {/* Placeholder for version history */}
                <div className="version-history__placeholder">
                  <p>📋 Version history will appear here</p>
                  <p>Make changes to content to see version tracking in action</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="version-manager__empty">
              <div className="empty-state">
                <span className="empty-state__icon">📋</span>
                <h3 className="empty-state__title">Select content to view versions</h3>
                <p className="empty-state__description">
                  Choose a content item from the sidebar to see its version history.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionManager;
