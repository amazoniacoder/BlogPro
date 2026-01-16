/**
 * DOM Manipulation Service - Centralized DOM operations
 * 
 * Consolidates common DOM manipulation operations from multiple services
 * to provide a single source of truth for DOM operations.
 */

import { setSelectionRange } from '../../../shared/utils/selectionUtils';
import { normalizeContent } from '../../../shared/utils/domUtils';
import { SecurityService } from '../../../shared/utils/SecurityService';

export class DOMManipulationService {
  /**
   * Wrap selection with HTML element
   */
  static wrapSelection(tagName: string): boolean {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;
      
      const range = selection.getRangeAt(0);
      
      // Check if selection is already formatted
      const isFormatted = this.isSelectionFormatted(range, tagName);
      
      if (isFormatted) {
        // Remove formatting
        return this.removeFormattingFromSelection(range, tagName);
      } else {
        // Apply formatting
        const element = document.createElement(tagName);
        try {
          range.surroundContents(element);
        } catch {
          try {
            element.appendChild(range.extractContents());
            range.insertNode(element);
          } catch {
            element.textContent = range.toString();
            range.deleteContents();
            range.insertNode(element);
          }
        }
        
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
      }
    } catch (error) {

      return false;
    }
  }
  
  /**
   * Check if selection is already formatted
   */
  private static isSelectionFormatted(range: Range, tagName: string): boolean {
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
    return element ? this.hasFormattingInHierarchy(element, [tagName]) : false;
  }
  
  /**
   * Remove formatting from selection
   */
  private static removeFormattingFromSelection(range: Range, tagName: string): boolean {
    const container = range.commonAncestorContainer;
    const formatElement = this.findFormatElement(container, tagName);
    
    if (formatElement) {
      this.unwrapElement(formatElement);
      return true;
    }
    return false;
  }

  /**
   * Apply style to selection
   */
  static applyStyleToSelection(property: string, value: string): boolean {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;

      const range = selection.getRangeAt(0);
      
      if (range.collapsed) {
        return this.setStyleAtCursor(property, value);
      } else {
        return this.wrapSelectionWithStyle(property, value);
      }
    } catch (error) {

      return false;
    }
  }

  /**
   * Insert node at current selection
   */
  static insertNodeAtSelection(node: Node): boolean {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;

      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    } catch (error) {

      return false;
    }
  }

  /**
   * Replace element with text node
   */
  static replaceElementWithText(element: HTMLElement, text: string): boolean {
    try {
      const sanitizedText = SecurityService.sanitizeHTML(text);
      const textNode = document.createTextNode(sanitizedText);
      const parent = element.parentNode;
      
      if (!parent) return false;
      
      parent.replaceChild(textNode, element);
      
      const editorElement = (parent as Element).closest('.editor-content') as HTMLElement;
      if (editorElement) {
        normalizeContent(editorElement);
      }
      
      setSelectionRange(textNode, text.length, textNode, text.length);
      return true;
    } catch (error) {

      return false;
    }
  }

  /**
   * Check if element has formatting in hierarchy
   */
  static hasFormattingInHierarchy(element: Element, tagNames: string[]): boolean {
    let current: Element | null = element;
    
    while (current && !current.matches('.editor-content, body')) {
      if (tagNames.some(tag => current!.tagName?.toLowerCase() === tag.toLowerCase())) {
        return true;
      }
      current = current.parentElement;
    }
    
    return false;
  }

  /**
   * Check if element has style property in hierarchy
   */
  static hasStyleProperty(element: Element, property: string, values: string[]): boolean {
    let current: Element | null = element;
    
    while (current && !current.matches('.editor-content, body')) {
      if (current instanceof HTMLElement) {
        const computedStyle = window.getComputedStyle(current);
        const styleValue = computedStyle.getPropertyValue(property).toLowerCase();
        
        if (values.some(value => styleValue.includes(value))) {
          return true;
        }
        
        const inlineValue = current.style.getPropertyValue(property).toLowerCase();
        if (values.some(value => inlineValue.includes(value))) {
          return true;
        }
      }
      current = current.parentElement;
    }
    
    return false;
  }

  /**
   * Get computed style value from element hierarchy
   */
  static getStyleFromHierarchy(element: Element, property: string, defaultValue: string = ''): string {
    let current: Element | null = element;
    
    while (current && !current.matches('.editor-content, body')) {
      if (current instanceof HTMLElement) {
        const inlineValue = current.style.getPropertyValue(property);
        if (inlineValue) return inlineValue;
        
        const computedStyle = window.getComputedStyle(current);
        const computedValue = computedStyle.getPropertyValue(property);
        if (computedValue && computedValue !== 'initial' && computedValue !== 'inherit') {
          return computedValue;
        }
      }
      current = current.parentElement;
    }
    
    return defaultValue;
  }

  /**
   * Create text node with formatting
   */
  static createFormattedTextNode(text: string, formatting: { bold?: boolean; italic?: boolean; underline?: boolean }): Node {
    let node: Node = document.createTextNode(text);
    
    if (formatting.underline) {
      const u = document.createElement('u');
      u.appendChild(node);
      node = u;
    }
    
    if (formatting.italic) {
      const em = document.createElement('em');
      em.appendChild(node);
      node = em;
    }
    
    if (formatting.bold) {
      const strong = document.createElement('strong');
      strong.appendChild(node);
      node = strong;
    }
    
    return node;
  }



  /**
   * Set style marker at cursor position
   */
  private static setStyleAtCursor(property: string, value: string): boolean {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;
      
      const range = selection.getRangeAt(0);
      const marker = document.createElement('span');
      marker.style.setProperty(property, value);
      marker.setAttribute('data-style-marker', 'true');
      
      range.insertNode(marker);
      range.setStart(marker, 0);
      range.collapse(true);
      
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wrap selection with styled span
   */
  private static wrapSelectionWithStyle(property: string, value: string): boolean {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;
      
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.setProperty(property, value);
      
      try {
        range.surroundContents(span);
      } catch {
        span.appendChild(range.extractContents());
        range.insertNode(span);
      }
      
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Find format element in hierarchy
   */
  private static findFormatElement(node: Node, tagName: string): Element | null {
    if (!node) return null;
    let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as Element;
    
    while (current && !current.matches('.editor-content')) {
      if (current.tagName?.toLowerCase() === tagName.toLowerCase()) {
        return current;
      }
      current = current.parentElement;
    }
    
    return null;
  }

  /**
   * Unwrap element (remove formatting)
   */
  private static unwrapElement(element: Element): void {
    const parent = element.parentNode;
    if (!parent) return;
    
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
  }
}
