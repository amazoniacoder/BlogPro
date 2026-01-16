/**
 * DOM manipulation utilities for the text editor
 */

import { SecurityService } from './SecurityService';

/**
 * Normalize content structure to ensure proper paragraph formatting
 */
export const normalizeContent = (element: HTMLElement): void => {
  // Convert div elements to paragraphs (browser sometimes creates divs)
  const divs = element.querySelectorAll('div');
  divs.forEach(div => {
    const p = document.createElement('p');
    const sanitizedContent = SecurityService.sanitizeHTML(div.innerHTML || '<br>');
    p.innerHTML = sanitizedContent;
    div.parentNode?.replaceChild(p, div);
  });
  
  // Ensure we have at least one paragraph
  if (!element.querySelector('p')) {
    const p = document.createElement('p');
    p.innerHTML = element.innerHTML || '<br>';
    element.innerHTML = '';
    element.appendChild(p);
  }
  
  // Ensure empty paragraphs have <br> for proper height
  const emptyPs = element.querySelectorAll('p:empty');
  emptyPs.forEach(p => {
    p.innerHTML = '<br>';
  });
  
  // Preserve formatting elements structure
  const formatElements = element.querySelectorAll('strong, em, u');
  formatElements.forEach(el => {
    // Ensure formatting elements have at least an empty text node for cursor positioning
    if (el.childNodes.length === 0) {
      el.appendChild(document.createTextNode(''));
    }
  });
};

/**
 * Clean up empty formatting elements while preserving cursor positioning elements
 */
export const cleanupEmptyFormatElements = (editorElement?: HTMLElement): void => {
  const editor = editorElement || document.querySelector('.editor-content') as HTMLElement;
  if (!editor) return;
  
  // Get current selection to avoid removing elements that contain the cursor
  const selection = window.getSelection();
  const cursorContainer = selection?.rangeCount ? selection.getRangeAt(0).startContainer : null;
  
  const emptyElements = editor.querySelectorAll('strong:empty, em:empty, u:empty');
  emptyElements.forEach(el => {
    // Don't remove if cursor is inside this element or its parent chain
    if (cursorContainer && (el.contains(cursorContainer) || el === cursorContainer.parentElement)) {
      return;
    }
    el.remove();
  });
  
  // Also remove elements with only whitespace, but preserve cursor positioning
  const whitespaceElements = editor.querySelectorAll('strong, em, u');
  whitespaceElements.forEach(el => {
    if (el.textContent?.trim() === '') {
      // Don't remove if cursor is inside this element or its parent chain
      if (cursorContainer && (el.contains(cursorContainer) || el === cursorContainer.parentElement)) {
        return;
      }
      el.remove();
    }
  });
};
