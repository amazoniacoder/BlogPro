/**
 * Position utilities for context menus and popups
 */

export interface Position {
  x: number;
  y: number;
}

export interface MenuDimensions {
  width: number;
  height: number;
}

/**
 * Calculate optimal position for context menu relative to target element
 */
export const calculateContextMenuPosition = (
  targetElement: HTMLElement,
  _menuDimensions: MenuDimensions = { width: 200, height: 150 }
): Position => {
  const targetRect = targetElement.getBoundingClientRect();
  
  // Check if in fullscreen mode
  const isFullscreen = document.querySelector('.contenteditable-editor.fullscreen') !== null;
  
  // Calculate base position (below the target element)
  let x = targetRect.left;
  let y = targetRect.bottom + 5;
  
  // Apply offset correction for normal mode
  if (!isFullscreen) {
    x -= 60;  // Shift left by 60px
    y -= 119; // Shift up by 119px
  }
  
  return { x, y };
};

/**
 * Get menu dimensions from DOM element or estimate
 */
export const getMenuDimensions = (menuElement?: HTMLElement): MenuDimensions => {
  if (menuElement) {
    const rect = menuElement.getBoundingClientRect();
    return {
      width: rect.width || 200,
      height: rect.height || 150
    };
  }
  
  return { width: 200, height: 150 };
};
