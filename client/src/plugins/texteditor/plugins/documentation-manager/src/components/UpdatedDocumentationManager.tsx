import { Icon } from '../../../../../../ui-system/icons/components';
/**
 * Updated Documentation Manager Component
 * Multi-library system with public access and role-based admin features
 * Max 350 lines, strict TypeScript compliance
 */

import React, { useState, useEffect } from 'react';
import { LibraryContext } from '../types/LibraryContext';
import { useLibraryContent } from '../hooks/useLibraryContent';
import { useLibraryContext } from '../hooks/useLibraryContext';
import { LibrarySwitcher } from './LibrarySwitcher';
import { ContextMenu, ContextMenuAction } from './ContextMenu';
import { InlineEditor } from './InlineEditor';
import { DocumentationHeader } from './DocumentationHeader';
import { DocumentationSidebar } from './DocumentationSidebar';
import { DocumentationContent } from './DocumentationContent';
import { DocumentationModals } from './DocumentationModals';
import { DocumentationSearch } from './DocumentationSearch';

// Import Plugin CSS
import '../styles/reset.css';
import '../styles/scoped-main.css';
import '../styles/search-panel.css';
import '../styles/admin-mode.css';

interface DocumentationManagerProps {
  libraryContext: LibraryContext;
  userRole?: 'admin' | 'editor' | 'user' | null;
}

const UpdatedDocumentationManager: React.FC<DocumentationManagerProps> = ({
  libraryContext,
  userRole = null
}) => {
  // Library context management
  const { context, switchLibrary } = useLibraryContext(libraryContext.libraryType);
  const { sections, content, loading, error, reload } = useLibraryContent(context.libraryType);
  
  // UI state
  const [activeTab, setActiveTab] = useState('installation');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Admin features - only for editor/admin roles
  const canEdit = userRole === 'admin' || userRole === 'editor';
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    x: 0,
    y: 0,
    actions: [] as ContextMenuAction[]
  });

  // Inline editing state
  const [editingElement, setEditingElement] = useState<{
    contentId: string;
    element: HTMLElement;
    type: 'text' | 'content';
  } | null>(null);

  // Export modal state
  const [exportModal, setExportModal] = useState<{
    isOpen: boolean;
    contentId: string | null;
    contentTitle: string;
  }>({ isOpen: false, contentId: null, contentTitle: '' });

  // Admin panel modal state
  const [adminPanel, setAdminPanel] = useState<{
    isOpen: boolean;
    activePanel: 'content' | 'sections' | 'menu' | 'files' | 'converter' | 'search';
  }>({ isOpen: false, activePanel: 'content' });

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.isVisible) {
        setContextMenu({...contextMenu, isVisible: false});
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu.isVisible]);

  // Library-aware search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length >= 2) {
      try {
        const response = await fetch(`/api/documentation/public/search/${context.libraryType}?q=${encodeURIComponent(query)}`);
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results || []);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleResultClick = (url: string) => {
    closeSearch();
    const element = document.querySelector(url);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Navigation handler for anchor links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update active link
      document.querySelectorAll('.sidebar-nav__link').forEach(link => {
        link.classList.remove('sidebar-nav__link--active');
      });
      e.currentTarget.classList.add('sidebar-nav__link--active');
    }
  };

  // Dynamic menu rendering
  const renderDynamicMenu = (menuItems: any[]) => {
    return menuItems.map(item => (
      <li key={item.id}>
        <a 
          href={`#${item.slug}`} 
          className="sidebar-nav__link"
          onClick={(e) => handleNavClick(e, `#${item.slug}`)}
        >
          {item.icon && <span className="menu-icon">{item.icon}</span>}
          {item.name}
        </a>
        {item.children && item.children.length > 0 && (
          <ul className="sidebar-nav__sublist">
            {renderDynamicMenu(item.children)}
          </ul>
        )}
      </li>
    ));
  };

  // Dynamic content rendering with library context
  const renderContentSections = () => {
    if (Array.isArray(content) && content.length > 0) {
      return content.map((sectionContent: any) => (
        <section key={sectionContent.id} id={sectionContent.slug}>
          {/* Title with conditional inline editing */}
          {editingElement && editingElement.contentId === sectionContent.id && editingElement.type === 'text' ? (
            <InlineEditor
              contentId={sectionContent.id}
              initialContent={sectionContent.title}
              contentType="text"
              onSave={async (newContent) => {
                await saveContent(sectionContent.id, newContent, true);
                setEditingElement(null);
              }}
              onCancel={() => setEditingElement(null)}
            />
          ) : (
            <h2 
              className={`content-title ${canEdit && isAdminMode ? 'editable-text' : ''}`}
              data-content-id={sectionContent.id}
              onDoubleClick={(e) => canEdit && isAdminMode && enableInlineEdit(e.target as HTMLElement)}
            >
              {sectionContent.title}
            </h2>
          )}
          
          {/* Content with conditional inline editing */}
          {editingElement && editingElement.contentId === sectionContent.id && editingElement.type === 'content' ? (
            <InlineEditor
              contentId={sectionContent.id}
              initialContent={sectionContent.content}
              contentType="html"
              onSave={async (newContent) => {
                await saveContent(sectionContent.id, newContent, false);
                setEditingElement(null);
              }}
              onCancel={() => setEditingElement(null)}
            />
          ) : (
            <div 
              className={`content-body ${canEdit && isAdminMode ? 'editable-content' : ''}`}
              data-content-id={sectionContent.id}
              onDoubleClick={(e) => canEdit && isAdminMode && enableInlineEdit(e.target as HTMLElement)}
              dangerouslySetInnerHTML={{ __html: sectionContent.content }}
            />
          )}
        </section>
      ));
    }
    return null;
  };

  // Context menu handler - only for admin/editor in admin mode
  const handleRightClick = (e: React.MouseEvent) => {
    if (!canEdit || !isAdminMode) return;
    
    e.preventDefault();
    const target = e.target as HTMLElement;
    const actions = getContextActions(target);
    
    if (actions.length > 0) {
      setContextMenu({
        isVisible: true,
        x: e.clientX,
        y: e.clientY,
        actions
      });
    }
  };

  // Context actions based on element type
  const getContextActions = (element: HTMLElement): ContextMenuAction[] => {
    const actions: ContextMenuAction[] = [];
    const contentId = element.getAttribute('data-content-id');
    
    if (element.classList.contains('editable-text')) {
      actions.push({
        id: 'edit-text',
        label: 'Edit Text',
        icon: '<Icon name="edit" size={16} />',
        action: () => enableInlineEdit(element)
      });
    }
    
    if (element.classList.contains('editable-content')) {
      actions.push({
        id: 'edit-content',
        label: 'Edit Content',
        icon: '📝',
        action: () => openContentEditor(element)
      });
    }
    
    // Add export action for content elements
    if (contentId && (element.classList.contains('editable-text') || element.classList.contains('editable-content'))) {
      const contentItem = Array.isArray(content) ? content.find(c => c.id === contentId) : null;
      actions.push({
        id: 'export-content',
        label: 'Export Content',
        icon: '📥',
        action: () => openExportModal(contentId, contentItem?.title || 'Document')
      });
    }
    
    return actions;
  };

  // Save content to database with authentication
  const saveContent = async (contentId: string, newContent: string, isTitle: boolean = false) => {
    if (!canEdit) throw new Error('Insufficient permissions');
    
    const token = localStorage.getItem('token');
    
    const response = await fetch(`/api/documentation/content/${contentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        [isTitle ? 'title' : 'content']: newContent,
        library_type: context.libraryType,
        updated_by: userRole || 'editor'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save content');
    }
    
    // Refresh content after save
    await reload();
  };

  // Inline editing functions
  const enableInlineEdit = (element: HTMLElement) => {
    const contentId = element.getAttribute('data-content-id');
    if (!contentId) return;
    
    const isTitle = element.classList.contains('editable-text');
    setEditingElement({
      contentId,
      element,
      type: isTitle ? 'text' : 'content'
    });
  };

  const openContentEditor = (element: HTMLElement) => {
    enableInlineEdit(element);
  };

  // Export modal functions
  const openExportModal = (contentId: string, contentTitle: string) => {
    setExportModal({
      isOpen: true,
      contentId,
      contentTitle
    });
  };

  const closeExportModal = () => {
    setExportModal({
      isOpen: false,
      contentId: null,
      contentTitle: ''
    });
  };

  // Admin panel functions
  const openAdminPanel = (panel: 'content' | 'sections' | 'menu' | 'files' | 'converter' | 'search') => {
    setAdminPanel({
      isOpen: true,
      activePanel: panel
    });
  };

  const closeAdminPanel = () => {
    setAdminPanel({
      isOpen: false,
      activePanel: 'content'
    });
  };

  if (loading) {
    return (
      <div className="documentation-manager-plugin loading">
        <div className="loading-spinner">
          <span>⏳</span>
          <p>Loading {context.libraryName}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documentation-manager-plugin error">
        <div className="error-message">
          <Icon name="delete" size={16} />
          <p>Failed to load documentation: {error}</p>
          <button onClick={reload}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`documentation-manager library-${context.libraryType} ${canEdit && isAdminMode ? 'admin-mode' : ''}`} onContextMenu={handleRightClick}>
      <div className="documentation">
        <DocumentationHeader
          userRole={userRole || undefined}
          isAdminMode={isAdminMode}
          setIsAdminMode={setIsAdminMode}
          toggleSearch={toggleSearch}
          openExportModal={openExportModal}
          openAdminPanel={openAdminPanel}
          handleNavClick={handleNavClick}
        />

        {/* Library Switcher for admins/editors */}
        {canEdit && (
          <LibrarySwitcher
            activeLibrary={context.libraryType}
            onSwitch={switchLibrary}
            userRole={userRole}
          />
        )}

        <DocumentationSearch
          isSearchOpen={isSearchOpen}
          searchQuery={searchQuery}
          searchResults={searchResults}
          onSearch={handleSearch}
          onResultClick={handleResultClick}
          onClose={closeSearch}
          onQueryChange={setSearchQuery}
        />

        <main className="main">
          <DocumentationSidebar
            sections={sections}
            renderDynamicMenu={renderDynamicMenu}
            handleNavClick={handleNavClick}
          />

          <article className="content">
            {/* Library-specific content */}
            {renderContentSections()}
            
            {/* Fallback static content if no dynamic content */}
            {(!content || content.length === 0) && (
              <DocumentationContent
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}
          </article>
        </main>
        
        {/* Context Menu - only in admin mode */}
        {canEdit && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            isVisible={contextMenu.isVisible}
            actions={contextMenu.actions}
            onClose={() => setContextMenu({...contextMenu, isVisible: false})}
          />
        )}
        
        {/* Admin features - only for authorized users */}
        {canEdit && (
          <DocumentationModals
            exportModal={exportModal}
            adminPanel={adminPanel}
            closeExportModal={closeExportModal}
            closeAdminPanel={closeAdminPanel}
            loadDynamicContent={reload}
          />
        )}
      </div>
    </div>
  );
};

export { UpdatedDocumentationManager as DocumentationManager };
export default UpdatedDocumentationManager;
