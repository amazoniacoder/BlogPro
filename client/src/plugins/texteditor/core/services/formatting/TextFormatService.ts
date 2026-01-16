/**
 * Text formatting service for basic text styles (bold, italic, underline)
 * Uses DOMManipulationService for common DOM operations
 */

import { DOMManipulationService } from '../dom/DOMManipulationService';

export class TextFormatService {
  /**
   * Apply bold formatting
   */
  static applyBold(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    if (range.collapsed) {
      this.setFormatAtCursor('bold', true);
    } else {
      DOMManipulationService.wrapSelection('strong');
    }
  }

  /**
   * Apply italic formatting
   */
  static applyItalic(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    if (range.collapsed) {
      this.setFormatAtCursor('italic', true);
    } else {
      DOMManipulationService.wrapSelection('em');
    }
  }

  /**
   * Apply underline formatting
   */
  static applyUnderline(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    if (range.collapsed) {
      this.setFormatAtCursor('underline', true);
    } else {
      DOMManipulationService.wrapSelection('u');
    }
  }

  /**
   * Check if element has formatting in its hierarchy
   */
  static hasFormattingInHierarchy(element: Element, tagNames: string[]): boolean {
    return DOMManipulationService.hasFormattingInHierarchy(element, tagNames);
  }

  /**
   * Check if element has specific style property in hierarchy
   */
  static hasStyleProperty(element: Element, property: string, values: string[]): boolean {
    return DOMManipulationService.hasStyleProperty(element, property, values);
  }

  /**
   * Set format marker at cursor position (text-specific logic)
   */
  private static setFormatAtCursor(format: string, value: boolean): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const marker = document.createElement('span');
    marker.setAttribute('data-format', format);
    marker.setAttribute('data-value', value.toString());
    marker.style.display = 'none';
    
    range.insertNode(marker);
    range.setStartAfter(marker);
    range.collapse(true);
    
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
