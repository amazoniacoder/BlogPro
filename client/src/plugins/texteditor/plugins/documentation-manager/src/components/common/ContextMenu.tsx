/**
 * Context Menu Component
 * Right-click context menu for admin content editing with real-time awareness
 * Max 200 lines - strict TypeScript compliance
 */

import React, { useEffect } from 'react';
import { ContextMenuAction } from '../../types/SharedTypes';
import { useWebSocketUpdates } from '../../hooks/useWebSocketUpdates';
import { useUserRole } from '../../hooks/useUserRole';

interface ContextMenuProps {
  readonly isVisible: boolean;
  readonly x: number;
  readonly y: number;
  readonly contentId: string;
  readonly onClose: () => void;
}

/**
 * Context menu component for admin content editing actions with real-time collaboration
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  isVisible,
  x,
  y,
  contentId,
  onClose
}) => {
  const { userRole } = useUserRole();
  const { contentLocks, lockContent, unlockContent } = useWebSocketUpdates('texteditor'); // TODO: Get library type from context
  /**
   * Close menu on outside click or escape key
   */
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (): void => {
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]);

  /**
   * Get context menu actions based on content and lock status
   */
  const getContextActions = (): ContextMenuAction[] => {
    const isLocked = contentLocks.has(contentId);
    const lock = contentLocks.get(contentId);
    const isLockedByCurrentUser = lock?.userId === userRole; // TODO: Get actual user ID

    const actions: ContextMenuAction[] = [];

    // Edit action - disabled if locked by another user
    actions.push({
      id: 'edit-content',
      label: isLocked && !isLockedByCurrentUser 
        ? `🔒 Editing by ${lock?.userName}` 
        : '<Icon name="edit" size={16} /> Edit Content',
      icon: isLocked && !isLockedByCurrentUser ? '🔒' : '<Icon name="edit" size={16} />',
      disabled: isLocked && !isLockedByCurrentUser,
      action: async () => {
        if (!isLocked) {
          await lockContent(contentId);
        }
        window.dispatchEvent(new CustomEvent('startInlineEdit', {
          detail: { contentId }
        }));
        onClose();
      }
    });

    // Unlock action - only if locked by current user
    if (isLocked && isLockedByCurrentUser) {
      actions.push({
        id: 'unlock-content',
        label: '🔓 Unlock Content',
        icon: '🔓',
        action: async () => {
          await unlockContent(contentId);
          onClose();
        }
      });
    }

    // View versions
    actions.push({
      id: 'view-versions',
      label: '📋 View Versions',
      icon: '📋',
      action: () => {
        window.open(`/plugins/texteditor/documentation-manager?content=${contentId}&tab=versions`, '_blank');
        onClose();
      }
    });

    // Export content
    actions.push({
      id: 'export-content',
      label: '📥 Export Content',
      icon: '📥',
      action: () => {
        window.dispatchEvent(new CustomEvent('exportContent', {
          detail: { contentId }
        }));
        onClose();
      }
    });

    // Open in admin panel
    actions.push({
      id: 'open-admin',
      label: '<Icon name="gear" size={16} /> Open in Admin Panel',
      icon: '<Icon name="gear" size={16} />',
      action: () => {
        window.open(`/plugins/texteditor/documentation-manager?content=${contentId}`, '_blank');
        onClose();
      }
    });

    return actions;
  };

  if (!isVisible) return null;

  const actions = getContextActions();

  return (
    <div 
      className="context-menu"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 1000
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <ul className="context-menu__list">
        {actions.map(action => (
          <li key={action.id} className="context-menu__item">
            <button
              className={`context-menu__button ${action.disabled ? 'context-menu__button--disabled' : ''}`}
              onClick={action.action}
              disabled={action.disabled}
            >
              <span className="context-menu__icon">{action.icon}</span>
              <span className="context-menu__label">{action.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;
