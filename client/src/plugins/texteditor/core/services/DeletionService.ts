/**
 * Smart deletion service
 * Implements Google Docs-style deletion behavior
 */

import { cleanupEmptyFormatElements } from '../../shared/utils/domUtils';

export interface DeletionResult {
  readonly shouldResetFormat: boolean;
  readonly deletedContent: string;
  readonly newCursorPosition: number;
}

export interface DeletionContext {
  readonly isAtFormatBoundary: boolean;
  readonly isInFormattedElement: boolean;
  readonly isDeletingAcrossBoundary: boolean;
  readonly deletedText: string;
}

export class DeletionService {
  /**
   * Handle backspace key with smart formatting
   */
  static handleBackspace(): DeletionResult {
    const selection = window.getSelection();
    if (!selection) {
      return {
        shouldResetFormat: false,
        deletedContent: '',
        newCursorPosition: 0
      };
    }

    // Handle selection deletion
    if (!selection.isCollapsed) {
      return this.handleSelectionDeletion();
    }

    // Handle single character deletion
    return this.handleSingleCharacterBackspace();
  }

  /**
   * Handle delete key with smart formatting
   */
  static handleDelete(): DeletionResult {
    const selection = window.getSelection();
    if (!selection) {
      return {
        shouldResetFormat: false,
        deletedContent: '',
        newCursorPosition: 0
      };
    }

    // Handle selection deletion
    if (!selection.isCollapsed) {
      return this.handleSelectionDeletion();
    }

    // Handle single character forward deletion
    return this.handleSingleCharacterDelete();
  }

  /**
   * Handle deletion of selected text
   */
  private static handleSelectionDeletion(): DeletionResult {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return {
        shouldResetFormat: false,
        deletedContent: '',
        newCursorPosition: 0
      };
    }

    const range = selection.getRangeAt(0);
    const deletedContent = range.toString();

    // Check if deletion spans across format boundaries
    const isDeletingAcrossBoundary = this.isDeletingAcrossFormatBoundary(range);
    
    // Delete the content
    range.deleteContents();

    // Clean up empty format elements
    setTimeout(() => {
      if (document.querySelector('.editor-content')) {
        cleanupEmptyFormatElements();
      }
    }, 0);

    return {
      shouldResetFormat: isDeletingAcrossBoundary || deletedContent.includes(' '),
      deletedContent,
      newCursorPosition: range.startOffset
    };
  }

  /**
   * Handle single character backspace
   */
  private static handleSingleCharacterBackspace(): DeletionResult {
    const selection = window.getSelection();
    if (!selection || !selection.isCollapsed) {
      return {
        shouldResetFormat: false,
        deletedContent: '',
        newCursorPosition: 0
      };
    }

    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    const offset = range.startOffset;

    // At start of formatted element
    if (container.nodeType === Node.TEXT_NODE && offset === 0 && 
        container.parentElement?.matches('strong, em, u')) {
      
      const formattedParent = container.parentElement;
      const textBefore = formattedParent.previousSibling;
      
      if (textBefore?.nodeType === Node.TEXT_NODE && textBefore.textContent) {
        const deletedChar = textBefore.textContent[textBefore.textContent.length - 1];
        
        // Delete character from previous text node
        textBefore.textContent = textBefore.textContent.slice(0, -1);
        
        // Move cursor to end of previous text
        const newRange = document.createRange();
        newRange.setStart(textBefore, textBefore.textContent.length);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        return {
          shouldResetFormat: true,
          deletedContent: deletedChar,
          newCursorPosition: textBefore.textContent.length
        };
      }
    }

    // Normal backspace - let browser handle
    return {
      shouldResetFormat: false,
      deletedContent: '',
      newCursorPosition: Math.max(0, offset - 1)
    };
  }

  /**
   * Handle single character forward delete
   */
  private static handleSingleCharacterDelete(): DeletionResult {
    const selection = window.getSelection();
    if (!selection || !selection.isCollapsed) {
      return {
        shouldResetFormat: false,
        deletedContent: '',
        newCursorPosition: 0
      };
    }

    const range = selection.getRangeAt(0);
    const offset = range.startOffset;

    // Let browser handle normal delete
    return {
      shouldResetFormat: false,
      deletedContent: '',
      newCursorPosition: offset
    };
  }

  /**
   * Check if deletion spans across format boundaries
   */
  private static isDeletingAcrossFormatBoundary(range: Range): boolean {
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    // Different containers might indicate boundary crossing
    if (startContainer !== endContainer) {
      return true;
    }

    // Check if selection contains formatted elements
    const contents = range.cloneContents();
    const formatElements = contents.querySelectorAll('strong, em, u');
    
    return formatElements.length > 0;
  }

  /**
   * Determine if format should be reset after deletion
   */
  static shouldResetFormat(context: DeletionContext): boolean {
    // Reset if deleting across format boundary
    if (context.isDeletingAcrossBoundary) return true;
    
    // Reset if deleted text contains spaces
    if (context.deletedText.includes(' ')) return true;
    
    // Reset if at format boundary after deletion
    if (context.isAtFormatBoundary) return true;
    
    return false;
  }

  /**
   * Get deletion context for current operation
   */
  static getDeletionContext(deletedText: string): DeletionContext {
    // Simple boundary check - if cursor is at end of formatted text
    const selection = window.getSelection();
    const isAtFormatBoundary = !!(selection?.anchorNode?.nodeType === Node.TEXT_NODE &&
      selection.anchorNode.parentElement?.matches('strong, em, u, span[style]') &&
      selection.focusOffset === selection.anchorNode.textContent?.length);
    
    const isInFormattedElement = !!(selection?.anchorNode?.parentElement?.matches('strong, em, u'));
    
    return {
      isAtFormatBoundary,
      isInFormattedElement,
      isDeletingAcrossBoundary: deletedText.includes(' ') || deletedText.length > 1,
      deletedText
    };
  }

  /**
   * Initialize service
   */
  static async initialize(): Promise<void> {
    console.log('DeletionService: Initialized');
  }

  /**
   * Destroy service and cleanup
   */
  static destroy(): void {
    // No cleanup needed for static service
  }

  /**
   * Get service configuration
   */
  static getConfig(): any {
    return { preserveFormatting: true, smartBoundaries: true };
  }
}
