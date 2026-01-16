/**
 * Context Menu Component
 * 
 * Right-click context menu for inline editing functionality.
 */

import React, { useEffect, useRef } from 'react';

export interface ContextMenuAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  isVisible: boolean;
  actions: ContextMenuAction[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  isVisible,
  actions,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 1000
      }}
    >
      {actions.map(action => (
        <button
          key={action.id}
          className={`context-menu__item ${action.disabled ? 'context-menu__item--disabled' : ''}`}
          onClick={() => {
            if (!action.disabled) {
              action.action();
              onClose();
            }
          }}
          disabled={action.disabled}
        >
          <span className="context-menu__icon">{action.icon}</span>
          <span className="context-menu__label">{action.label}</span>
        </button>
      ))}
    </div>
  );
};
