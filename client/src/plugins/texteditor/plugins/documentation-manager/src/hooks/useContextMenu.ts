/**
 * Context Menu Hook
 * 
 * Hook for managing right-click context menu state and actions.
 */

import { useState, useCallback } from 'react';
import { ContextMenuAction } from '../components/ContextMenu';

interface ContextMenuState {
  isVisible: boolean;
  x: number;
  y: number;
  target: any;
  actions: ContextMenuAction[];
}

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isVisible: false,
    x: 0,
    y: 0,
    target: null,
    actions: []
  });

  const showContextMenu = useCallback((
    event: React.MouseEvent,
    target: any,
    actions: ContextMenuAction[]
  ) => {
    event.preventDefault();
    event.stopPropagation();

    // Adjust position to keep menu within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 200; // Approximate menu width
    const menuHeight = actions.length * 40; // Approximate item height

    let x = event.clientX;
    let y = event.clientY;

    // Adjust horizontal position
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10;
    }

    // Adjust vertical position
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10;
    }

    setContextMenu({
      isVisible: true,
      x,
      y,
      target,
      actions
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu
  };
};
