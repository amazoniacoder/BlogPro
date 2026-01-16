/**
 * Layout formatting service for alignment and colors
 */

import { TextAlign } from '../../types/CoreTypes';

export class LayoutFormatService {
  /**
   * Apply text alignment formatting
   */
  static applyTextAlign(textAlign: TextAlign): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let blockElement = this.findBlockElement(range.startContainer);
    
    if (blockElement && blockElement instanceof HTMLElement) {
      blockElement.style.textAlign = textAlign;
    }
  }

  /**
   * Apply text color formatting
   */
  static applyTextColor(color: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    if (range.collapsed) {
      this.setFormatAtCursor('textColor', color);
    } else {
      this.wrapSelectionWithStyle('textColor', color);
    }
  }

  /**
   * Apply background color formatting
   */
  static applyBackgroundColor(color: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    if (range.collapsed) {
      this.setFormatAtCursor('backgroundColor', color);
    } else {
      this.wrapSelectionWithStyle('backgroundColor', color);
    }
  }

  /**
   * Get text alignment from element
   */
  static getTextAlign(element: Element): TextAlign {
    let current: Element | null = element;
    
    while (current && !current.matches('.editor-content, body')) {
      if (current instanceof HTMLElement) {
        if (current.style.textAlign) {
          return this.parseTextAlign(current.style.textAlign);
        }
        
        const computedStyle = window.getComputedStyle(current);
        const textAlign = computedStyle.textAlign;
        if (textAlign && textAlign !== 'inherit') {
          return this.parseTextAlign(textAlign);
        }
      }
      current = current.parentElement;
    }
    return 'left';
  }

  /**
   * Get text color from element
   */
  static getTextColor(element: Element): string {
    let current: Element | null = element;
    
    while (current && !current.matches('.editor-content, body')) {
      if (current instanceof HTMLElement) {
        if (current.style.color) {
          return this.normalizeColor(current.style.color);
        }
        
        const computedStyle = window.getComputedStyle(current);
        const color = computedStyle.color;
        if (color && color !== 'inherit' && color !== 'rgb(0, 0, 0)') {
          return this.normalizeColor(color);
        }
      }
      current = current.parentElement;
    }
    return '#000000';
  }

  /**
   * Get background color from element
   */
  static getBackgroundColor(element: Element): string {
    let current: Element | null = element;
    
    while (current && !current.matches('.editor-content, body')) {
      if (current instanceof HTMLElement) {
        if (current.style.backgroundColor) {
          return this.normalizeColor(current.style.backgroundColor);
        }
        
        const computedStyle = window.getComputedStyle(current);
        const backgroundColor = computedStyle.backgroundColor;
        if (backgroundColor && backgroundColor !== 'inherit' && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
          return this.normalizeColor(backgroundColor);
        }
      }
      current = current.parentElement;
    }
    return '#ffffff';
  }

  /**
   * Find block element (p, div, h1-h6) in hierarchy
   */
  private static findBlockElement(node: Node): Element | null {
    if (!node) return null;
    let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as Element;
    
    while (current && !current.matches('.editor-content')) {
      if (current.matches('p, div, h1, h2, h3, h4, h5, h6, blockquote, li')) {
        return current;
      }
      current = current.parentElement;
    }
    
    return null;
  }

  /**
   * Set format for cursor position (next typing)
   */
  private static setFormatAtCursor(format: string, value: string): void {
    const selection = window.getSelection()!;
    const range = selection.getRangeAt(0);
    
    const marker = document.createElement('span');
    marker.setAttribute('data-format', format);
    marker.setAttribute('data-value', value);
    marker.style.display = 'none';
    
    range.insertNode(marker);
    range.setStartAfter(marker);
    range.collapse(true);
    
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Wrap selection with style formatting
   */
  private static wrapSelectionWithStyle(styleType: string, value: string): void {
    const selection = window.getSelection()!;
    const range = selection.getRangeAt(0);
    
    const span = document.createElement('span');
    if (styleType === 'textColor') {
      span.style.color = value;
    } else if (styleType === 'backgroundColor') {
      span.style.backgroundColor = value;
    }
    
    try {
      range.surroundContents(span);
    } catch {
      try {
        span.appendChild(range.extractContents());
        range.insertNode(span);
      } catch {
        span.textContent = range.toString();
        range.deleteContents();
        range.insertNode(span);
      }
    }
    
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Parse text align string to TextAlign type
   */
  private static parseTextAlign(textAlign: string): TextAlign {
    const normalized = textAlign.toLowerCase().trim();
    if (normalized === 'center') return 'center';
    if (normalized === 'right') return 'right';
    if (normalized === 'justify') return 'justify';
    return 'left';
  }

  /**
   * Normalize color to hex format
   */
  private static normalizeColor(color: string): string {
    if (color.startsWith('#')) {
      return color;
    }
    
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1]);
      const g = parseInt(rgbaMatch[2]);
      const b = parseInt(rgbaMatch[3]);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    return color;
  }
}
