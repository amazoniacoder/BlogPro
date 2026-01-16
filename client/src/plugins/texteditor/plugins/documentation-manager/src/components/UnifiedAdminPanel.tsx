import { Icon } from '../../../../../../ui-system/icons/components';
/**
 * Unified Admin Panel Component
 * Single admin interface with library context switching
 */

import React, { useState } from 'react';
import { LibraryContext } from '../types/LibraryContext';
import { useLibraryContent } from '../hooks/useLibraryContent';
import { useTextEditorIntegration } from '../hooks/useTextEditorIntegration';
import { ContentEditorModal } from './ContentEditorModal';

interface UnifiedAdminPanelProps {
  context: LibraryContext;
  userRole: 'admin' | 'editor';
  onClose?: () => void;
}

export const UnifiedAdminPanel: React.FC<UnifiedAdminPanelProps> = ({
  context,
  userRole,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('content');
  const { content, sections, reload } = useLibraryContent(context.libraryType);
  
  const {
    isEditorOpen,
    currentContent,
    error,
    openEditor,
    closeEditor,
    saveContent
  } = useTextEditorIntegration(context, reload);

  const canManageContent = userRole === 'admin' || userRole === 'editor';
  const canManageStructure = userRole === 'admin';

  const handleContentEdit = (contentId: string) => {
    openEditor(contentId);
  };

  const handleCreateContent = () => {
    openEditor(); // No contentId = new content
  };

  const handleContentSave = async (contentId: string, content: string) => {
    await saveContent(contentId, content);
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documentation/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      await reload();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="unified-admin-panel">
      <div className="admin-panel-header">
        <div className="admin-panel-title">
          <h3>Admin Panel - {context.libraryName}</h3>
          {onClose && (
            <button className="admin-panel-close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
        
        <div className="admin-tabs">
          {canManageContent && (
            <button 
              className={`admin-tab ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              📝 Content
            </button>
          )}
          {canManageStructure && (
            <button 
              className={`admin-tab ${activeTab === 'structure' ? 'active' : ''}`}
              onClick={() => setActiveTab('structure')}
            >
              🔗 Structure
            </button>
          )}
          <button 
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Icon name="gear" size={16} /> Settings
          </button>
        </div>
      </div>

      <div className="admin-panel-content">
        {activeTab === 'content' && canManageContent && (
          <ContentManager
            content={content}
            libraryContext={context}
            onEditContent={handleContentEdit}
            onCreateContent={handleCreateContent}
            onDeleteContent={handleDeleteContent}
          />
        )}
        
        {activeTab === 'structure' && canManageStructure && (
          <StructureManager
            sections={sections}
            libraryContext={context}
          />
        )}
        
        {activeTab === 'settings' && (
          <LibrarySettings
            context={context}
            userRole={userRole}
          />
        )}
      </div>

      {/* Text Editor Modal */}
      <ContentEditorModal
        isOpen={isEditorOpen}
        contentId={currentContent?.id}
        libraryContext={context}
        onClose={closeEditor}
        onSave={handleContentSave}
      />

      {/* Error Display */}
      {error && (
        <div className="admin-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Content Manager Sub-component
interface ContentManagerProps {
  content: any[];
  libraryContext: LibraryContext;
  onEditContent: (contentId: string) => void;
  onCreateContent: () => void;
  onDeleteContent: (contentId: string) => void;
}

const ContentManager: React.FC<ContentManagerProps> = ({
  content,
  libraryContext,
  onEditContent,
  onCreateContent,
  onDeleteContent
}) => {
  return (
    <div className="content-manager">
      <div className="content-manager-header">
        <h4>Content Management</h4>
        <button className="create-content-btn" onClick={onCreateContent}>
          <Icon name="add" size={16} /> Create New
        </button>
      </div>
      
      <div className="content-list">
        {content.length === 0 ? (
          <div className="empty-state">
            <span>📄</span>
            <p>No content found for {libraryContext.libraryName}</p>
            <button onClick={onCreateContent}>Create First Document</button>
          </div>
        ) : (
          content.map((item) => (
            <div key={item.id} className="content-item">
              <div className="content-info">
                <h5>{item.title}</h5>
                <p>{item.excerpt || 'No description'}</p>
                <div className="content-meta">
                  <span className={`status ${item.is_published ? 'published' : 'draft'}`}>
                    {item.is_published ? '✅ Published' : '📝 Draft'}
                  </span>
                  <span className="updated">
                    Updated: {new Date(item.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="content-actions">
                <button onClick={() => onEditContent(item.id)}>
                  <Icon name="edit" size={16} /> Edit
                </button>
                <button 
                  onClick={() => onDeleteContent(item.id)}
                  className="delete-btn"
                >
                  <Icon name="delete" size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Structure Manager Sub-component
interface StructureManagerProps {
  sections: any[];
  libraryContext: LibraryContext;
}

const StructureManager: React.FC<StructureManagerProps> = ({
  sections,
  libraryContext
}) => {
  return (
    <div className="structure-manager">
      <div className="structure-manager-header">
        <h4>Structure Management</h4>
        <button className="create-section-btn">
          <Icon name="add" size={16} /> Add Section
        </button>
      </div>
      
      <div className="sections-tree">
        {sections.length === 0 ? (
          <div className="empty-state">
            <span>🗂️</span>
            <p>No sections found for {libraryContext.libraryName}</p>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="section-item">
              <div className="section-info">
                <span className="section-icon">{section.icon || '📁'}</span>
                <span className="section-name">{section.name}</span>
                <span className="section-level">Level {section.level}</span>
              </div>
              
              <div className="section-actions">
                <button><Icon name="edit" size={16} /> Edit</button>
                <button><Icon name="delete" size={16} /> Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Library Settings Sub-component
interface LibrarySettingsProps {
  context: LibraryContext;
  userRole: 'admin' | 'editor';
}

const LibrarySettings: React.FC<LibrarySettingsProps> = ({
  context,
  userRole
}) => {
  return (
    <div className="library-settings">
      <h4>Library Settings</h4>
      
      <div className="settings-section">
        <h5>Library Information</h5>
        <div className="setting-item">
          <label>Library Type:</label>
          <span>{context.libraryType}</span>
        </div>
        <div className="setting-item">
          <label>Library Name:</label>
          <span>{context.libraryName}</span>
        </div>
        <div className="setting-item">
          <label>Base Route:</label>
          <span>{context.baseRoute}</span>
        </div>
      </div>
      
      <div className="settings-section">
        <h5>Features</h5>
        <div className="feature-list">
          <div className={`feature-item ${context.features.codeBlocks ? 'enabled' : 'disabled'}`}>
            <span>{context.features.codeBlocks ? '✅' : '<Icon name="x" size={16} />'}</span>
            <span>Code Blocks</span>
          </div>
          <div className={`feature-item ${context.features.mediaUpload ? 'enabled' : 'disabled'}`}>
            <span>{context.features.mediaUpload ? '✅' : '<Icon name="x" size={16} />'}</span>
            <span>Media Upload</span>
          </div>
          <div className={`feature-item ${context.features.advancedFormatting ? 'enabled' : 'disabled'}`}>
            <span>{context.features.advancedFormatting ? '✅' : '<Icon name="x" size={16} />'}</span>
            <span>Advanced Formatting</span>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h5>User Permissions</h5>
        <div className="setting-item">
          <label>Current Role:</label>
          <span className={`role-badge ${userRole}`}>{userRole}</span>
        </div>
        <div className="permission-list">
          <div className="permission-item">
            <span>{userRole === 'admin' || userRole === 'editor' ? '✅' : '<Icon name="x" size={16} />'}</span>
            <span>Edit Content</span>
          </div>
          <div className="permission-item">
            <span>{userRole === 'admin' ? '✅' : '<Icon name="x" size={16} />'}</span>
            <span>Manage Structure</span>
          </div>
        </div>
      </div>
    </div>
  );
};
