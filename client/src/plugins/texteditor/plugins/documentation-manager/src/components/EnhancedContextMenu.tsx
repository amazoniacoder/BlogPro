/**
 * Enhanced Context Menu Component
 * Role-based context menu with security features
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { LibraryContext } from '../types/LibraryContext';
import { ContextMenuAction } from './ContextMenu';

interface EnhancedContextMenuProps {
  userRole?: 'admin' | 'editor' | 'user' | null;
  libraryContext: LibraryContext;
  targetElement: HTMLElement | null;
  x: number;
  y: number;
  isVisible: boolean;
  onClose: () => void;
  onEditContent?: (contentId: string) => void;
  onEditStructure?: () => void;
  onExportContent?: (contentId: string) => void;
}

export const EnhancedContextMenu: React.FC<EnhancedContextMenuProps> = ({
  userRole,
  libraryContext,
  targetElement,
  x,
  y,
  isVisible,
  onClose,
  onEditContent,
  onEditStructure,
  onExportContent
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const getContextActions = useCallback((): ContextMenuAction[] => {
    if (!userRole || userRole === 'user') return [];
    
    const actions: ContextMenuAction[] = [];
    const canEdit = userRole === 'admin' || userRole === 'editor';
    const canManageStructure = userRole === 'admin';
    const contentId = targetElement?.getAttribute('data-content-id');
    
    // Text editing actions
    if (targetElement?.classList.contains('editable-text') && canEdit) {
      actions.push({
        id: 'edit-text',
        label: 'Edit with Text Editor',
        icon: '<Icon name="edit" size={16} />',
        action: () => {
          if (contentId && onEditContent) {
            onEditContent(contentId);
          }
          onClose();
        }
      });
    }
    
    // Content editing actions
    if (targetElement?.classList.contains('editable-content') && canEdit) {
      actions.push({
        id: 'edit-content',
        label: 'Edit Content',
        icon: '📝',
        action: () => {
          if (contentId && onEditContent) {
            onEditContent(contentId);
          }
          onClose();
        }
      });
    }
    
    // Structure management actions (admin only)
    if (targetElement?.closest('.nav-item') && canManageStructure) {
      actions.push({
        id: 'edit-structure',
        label: 'Edit Menu Structure',
        icon: '🔗',
        action: () => {
          if (onEditStructure) {
            onEditStructure();
          }
          onClose();
        }
      });
    }
    
    // Export actions
    if (contentId && (canEdit || userRole === 'user')) {
      actions.push({
        id: 'export-content',
        label: 'Export Content',
        icon: '📥',
        action: () => {
          if (onExportContent) {
            onExportContent(contentId);
          }
          onClose();
        }
      });
    }
    
    // Library-specific actions
    if (libraryContext.features.codeBlocks && canEdit) {
      actions.push({
        id: 'add-code-block',
        label: 'Add Code Block',
        icon: '💻',
        action: () => {
          // Implementation for adding code block
          onClose();
        }
      });
    }
    
    if (libraryContext.features.mediaUpload && canEdit) {
      actions.push({
        id: 'add-media',
        label: 'Add Media',
        icon: '<Icon name="image" size={16} />',
        action: () => {
          // Implementation for adding media
          onClose();
        }
      });
    }
    
    return actions;
  }, [userRole, libraryContext, targetElement, onEditContent, onEditStructure, onExportContent, onClose]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const actions = getContextActions();
  
  if (actions.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="enhanced-context-menu"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 1000
      }}
    >
      <div className="context-menu-header">
        <span className="context-menu-title">
          {libraryContext.libraryName} Actions
        </span>
        <span className="context-menu-role">
          {userRole}
        </span>
      </div>
      
      {actions.map((action) => (
        <button
          key={action.id}
          className={`context-menu-item ${action.disabled ? 'disabled' : ''}`}
          onClick={() => {
            if (!action.disabled) {
              action.action();
            }
          }}
          disabled={action.disabled}
        >
          <span className="context-menu-icon">{action.icon}</span>
          <span className="context-menu-label">{action.label}</span>
        </button>
      ))}
      
      <div className="context-menu-footer">
        <small>Right-click for more options</small>
      </div>
    </div>
  );
};
