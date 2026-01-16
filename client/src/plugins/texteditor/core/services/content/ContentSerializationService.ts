/**
 * Content serialization service for proper format preservation
 * Ensures formatting is maintained when saving/loading blog posts
 */

import { SecurityService } from '../../../shared/utils/SecurityService';

export class ContentSerializationService {
  /**
   * Serialize editor content for storage with format preservation
   */
  static serializeContent(editorElement: HTMLElement): string {
    if (!editorElement) return '';
    
    // Clone the element to avoid modifying the original
    const clone = editorElement.cloneNode(true) as HTMLElement;
    
    // Normalize formatting elements
    this.normalizeFormattingElements(clone);
    
    // Clean up empty elements but preserve structure
    this.cleanupEmptyElements(clone);
    
    return SecurityService.sanitizeHTML(clone.innerHTML);
  }
  
  /**
   * Deserialize stored content for editor with format restoration
   */
  static deserializeContent(htmlContent: string): string {
    if (!htmlContent) return '<p><br></p>';
    
    // Sanitize the content first
    const sanitized = SecurityService.sanitizeHTML(htmlContent);
    
    // Create temporary container
    const temp = document.createElement('div');
    temp.innerHTML = sanitized;
    
    // Restore formatting structure
    this.restoreFormattingStructure(temp);
    
    // Ensure proper paragraph structure
    this.ensureParagraphStructure(temp);
    
    return temp.innerHTML;
  }
  
  /**
   * Normalize formatting elements for consistent storage
   */
  private static normalizeFormattingElements(container: HTMLElement): void {
    // Convert deprecated tags to modern equivalents
    const deprecatedTags = container.querySelectorAll('b, i');
    deprecatedTags.forEach(element => {
      const newTag = element.tagName.toLowerCase() === 'b' ? 'strong' : 'em';
      const replacement = document.createElement(newTag);
      replacement.innerHTML = element.innerHTML;
      element.parentNode?.replaceChild(replacement, element);
    });
    
    // Merge adjacent identical formatting elements
    this.mergeAdjacentFormats(container);
  }
  
  /**
   * Restore formatting structure from stored content
   */
  private static restoreFormattingStructure(container: HTMLElement): void {
    // Ensure all formatting elements are properly nested
    const formatElements = container.querySelectorAll('strong, em, u, span[style]');
    formatElements.forEach(element => {
      // Ensure text nodes are properly contained
      if (element.childNodes.length === 0) {
        element.appendChild(document.createTextNode(''));
      }
    });
  }
  
  /**
   * Ensure proper paragraph structure
   */
  private static ensureParagraphStructure(container: HTMLElement): void {
    // If no paragraphs exist, wrap content in paragraph
    if (!container.querySelector('p')) {
      const p = document.createElement('p');
      if (container.innerHTML.trim()) {
        p.innerHTML = container.innerHTML;
      } else {
        p.appendChild(document.createElement('br'));
      }
      container.innerHTML = '';
      container.appendChild(p);
    }
    
    // Ensure empty paragraphs have br elements
    const emptyPs = container.querySelectorAll('p:empty');
    emptyPs.forEach(p => {
      p.appendChild(document.createElement('br'));
    });
  }
  
  /**
   * Clean up empty elements while preserving structure
   */
  private static cleanupEmptyElements(container: HTMLElement): void {
    const emptyElements = container.querySelectorAll('strong:empty, em:empty, u:empty, span:empty');
    emptyElements.forEach(element => {
      // Only remove if it has no meaningful attributes
      if (element.tagName.toLowerCase() === 'span' && element.getAttribute('style')) {
        // Keep styled spans even if empty (for cursor positioning)
        return;
      }
      element.remove();
    });
  }
  
  /**
   * Merge adjacent identical formatting elements
   */
  private static mergeAdjacentFormats(container: HTMLElement): void {
    const formatTags = ['strong', 'em', 'u'];
    
    formatTags.forEach(tag => {
      const elements = container.querySelectorAll(tag);
      
      elements.forEach(element => {
        const nextSibling = element.nextSibling;
        
        if (nextSibling?.nodeType === Node.ELEMENT_NODE) {
          const nextElement = nextSibling as Element;
          if (nextElement.tagName.toLowerCase() === tag) {
            // Move content from next element to current
            while (nextElement.firstChild) {
              element.appendChild(nextElement.firstChild);
            }
            nextElement.remove();
          }
        }
      });
    });
  }
}
