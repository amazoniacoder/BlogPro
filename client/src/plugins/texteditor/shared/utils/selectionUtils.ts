/**
 * Enhanced selection management utilities for the text editor
 */

interface SelectionState {
  start: number;
  end: number;
  isCollapsed: boolean;
  anchorNode: Node | null;
  focusNode: Node | null;
  direction: 'forward' | 'backward' | 'none';
}

export interface SelectionInfo {
  readonly selection: Selection;
  readonly range: Range;
  readonly isCollapsed: boolean;
  readonly startContainer: Node;
  readonly endContainer: Node;
  readonly startOffset: number;
  readonly endOffset: number;
  readonly text: string;
}

export interface SelectionBounds {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Get current selection information with enhanced details
 */
export const getCurrentSelection = (): SelectionInfo | null => {
  try {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    return {
      selection,
      range,
      isCollapsed: selection.isCollapsed,
      startContainer: range.startContainer,
      endContainer: range.endContainer,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      text: range.toString()
    };
  } catch (error) {
    return null;
  }
};

/**
 * Convert browser selection to SelectionState with improved direction detection
 */
export const getSelectionState = (): SelectionState | null => {
  try {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    return {
      start: range.startOffset,
      end: range.endOffset,
      isCollapsed: selection.isCollapsed,
      anchorNode: selection.anchorNode,
      focusNode: selection.focusNode,
      direction: getSelectionDirection(selection)
    };
  } catch (error) {
    return null;
  }
};

/**
 * Get selection direction with proper comparison
 */
export const getSelectionDirection = (selection: Selection): 'forward' | 'backward' | 'none' => {
  if (selection.isCollapsed) return 'none';
  
  const position = selection.anchorNode?.compareDocumentPosition(selection.focusNode!);
  
  if (position === undefined) return 'none';
  
  // If focus is after anchor in document order
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return 'forward';
  }
  // If focus is before anchor in document order
  if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return 'backward';
  }
  
  // Same node - compare offsets
  return selection.anchorOffset <= selection.focusOffset ? 'forward' : 'backward';
};

/**
 * Set cursor position with error handling
 */
export const setCursorPosition = (element: Node, offset: number): boolean => {
  try {
    const selection = window.getSelection();
    if (!selection) return false;
    
    // Validate offset bounds
    const maxOffset = element.nodeType === Node.TEXT_NODE 
      ? (element.textContent?.length || 0)
      : element.childNodes.length;
    
    const safeOffset = Math.max(0, Math.min(offset, maxOffset));
    
    const range = document.createRange();
    range.setStart(element, safeOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Set selection range with bounds validation
 */
export const setSelectionRange = (startNode: Node, startOffset: number, endNode: Node, endOffset: number): boolean => {
  try {
    const selection = window.getSelection();
    if (!selection) return false;
    
    // Validate start offset
    const startMaxOffset = startNode.nodeType === Node.TEXT_NODE 
      ? (startNode.textContent?.length || 0)
      : startNode.childNodes.length;
    const safeStartOffset = Math.max(0, Math.min(startOffset, startMaxOffset));
    
    // Validate end offset
    const endMaxOffset = endNode.nodeType === Node.TEXT_NODE 
      ? (endNode.textContent?.length || 0)
      : endNode.childNodes.length;
    const safeEndOffset = Math.max(0, Math.min(endOffset, endMaxOffset));
    
    const range = document.createRange();
    range.setStart(startNode, safeStartOffset);
    range.setEnd(endNode, safeEndOffset);
    selection.removeAllRanges();
    selection.addRange(range);
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get selection bounds for positioning UI elements
 */
export const getSelectionBounds = (): SelectionBounds | null => {
  try {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  } catch (error) {
    return null;
  }
};

/**
 * Check if selection is within specific element
 */
export const isSelectionInElement = (element: Element): boolean => {
  try {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    return element.contains(range.commonAncestorContainer);
  } catch (error) {
    return false;
  }
};

/**
 * Get text content of current selection
 */
export const getSelectionText = (): string => {
  try {
    const selection = window.getSelection();
    return selection?.toString() || '';
  } catch (error) {
    return '';
  }
};

/**
 * Clear current selection
 */
export const clearSelection = (): void => {
  try {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  } catch (error) {
    // Ignore errors when clearing selection
  }
};
