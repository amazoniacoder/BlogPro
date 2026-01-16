import { Icon } from '../../../../../../../../../ui-system/icons/components';
/**
 * Section Manager Component
 * Manages documentation sections and hierarchy
 * Max 150 lines - strict TypeScript compliance
 */

import React from 'react';
import { LibraryType } from '../../types/SharedTypes';
import { useLibraryContent } from '../../hooks/useLibraryContent';

interface SectionManagerProps {
  readonly libraryType: LibraryType;
}

/**
 * Section manager for organizing content hierarchy
 */
export const SectionManager: React.FC<SectionManagerProps> = ({ libraryType }) => {
  const { sections, loading } = useLibraryContent(libraryType);

  if (loading) {
    return (
      <div className="section-manager section-manager--loading">
        <div className="loading-spinner">
          <span>⏳</span>
          <p>Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-manager">
      <div className="section-manager__header">
        <h2 className="section-manager__title">
          🗂️ {libraryType === 'texteditor' ? 'Text Editor' : 'Website'} Sections
        </h2>
        
        <button className="section-manager__create-btn">
          <Icon name="add" size={16} /> Create Section
        </button>
      </div>

      <div className="section-manager__content">
        {sections.length > 0 ? (
          <div className="sections-tree">
            {sections.map(section => (
              <div key={section.id} className="section-item">
                <div className="section-item__info">
                  <span className="section-item__icon">{section.icon || '📁'}</span>
                  <span className="section-item__name">{section.name}</span>
                  <span className="section-item__level">Level {section.level}</span>
                </div>
                
                <div className="section-item__actions">
                  <button className="section-item__action"><Icon name="edit" size={16} /> Edit</button>
                  <button className="section-item__action"><Icon name="delete" size={16} /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="section-manager__empty">
            <div className="empty-state">
              <span className="empty-state__icon">🗂️</span>
              <h3 className="empty-state__title">No sections yet</h3>
              <p className="empty-state__description">
                Create sections to organize your {libraryType} documentation.
              </p>
              <button className="empty-state__action">
                <Icon name="add" size={16} /> Create First Section
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionManager;
