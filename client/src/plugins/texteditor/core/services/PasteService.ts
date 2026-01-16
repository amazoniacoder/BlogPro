/**
 * Paste intelligence service
 * Handles smart paste operations with format preservation
 */

import { FormatState } from '../types/CoreTypes';
import { normalizeContent, cleanupEmptyFormatElements } from '../../shared/utils/domUtils';
import { InputValidator } from '../../shared/utils/InputValidator';
import { SecurityService } from '../../shared/utils/SecurityService';

export interface PasteOptions {
  readonly preserveFormatting: boolean;
  readonly cleanupHtml: boolean;
  readonly maxLength?: number;
}

export interface PasteResult {
  readonly success: boolean;
  readonly content: string;
  readonly error?: string;
}

export class PasteService {
  private static readonly ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'span'];
  private static readonly ALLOWED_ATTRIBUTES = ['style'];

  /**
   * Handle paste operation
   */
  static async handlePaste(
    clipboardData: DataTransfer, 
    options: PasteOptions = { preserveFormatting: true, cleanupHtml: true }
  ): Promise<PasteResult> {
    try {
      // Get clipboard content
      const htmlContent = clipboardData.getData('text/html');
      const textContent = clipboardData.getData('text/plain');

      let content: string;

      if (htmlContent && options.preserveFormatting) {
        // Process HTML content
        content = this.cleanupPastedContent(htmlContent);
      } else {
        // Use plain text
        content = this.processPlainText(textContent);
      }

      // Validate content
      if (!InputValidator.validateContent(content)) {
        return {
          success: false,
          content: '',
          error: 'Invalid content detected'
        };
      }

      // Check length limit
      if (options.maxLength && content.length > options.maxLength) {
        return {
          success: false,
          content: '',
          error: `Content exceeds maximum length of ${options.maxLength} characters`
        };
      }

      // Insert content
      await this.insertContent(content);

      return {
        success: true,
        content
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: SecurityService.sanitizeLog(error instanceof Error ? error.message : 'Unknown paste error')
      };
    }
  }

  /**
   * Clean up pasted HTML content
   */
  static cleanupPastedContent(html: string): string {
    // Sanitize HTML first
    const sanitizedHtml = SecurityService.sanitizeHTML(html);
    
    // Create temporary container
    const temp = document.createElement('div');
    temp.innerHTML = sanitizedHtml;

    // Check if we're pasting into an existing paragraph (inline paste)
    const selection = window.getSelection();
    const isInlinePaste = selection && selection.rangeCount > 0 && 
      selection.getRangeAt(0).startContainer.parentElement?.closest('p');

    if (isInlinePaste) {
      // For inline paste, extract only the text content and inline formatting
      return this.extractInlineContent(temp);
    } else {
      // For block paste, preserve paragraph structure
      this.sanitizeElement(temp);
      normalizeContent(temp);
      cleanupEmptyFormatElements(temp);
      return temp.innerHTML;
    }
  }

  /**
   * Process plain text for insertion
   */
  private static processPlainText(text: string): string {
    if (!text) return '';

    // Split by line breaks and wrap in paragraphs
    const lines = text.split(/\r?\n/);
    const paragraphs = lines.map(line => {
      const trimmed = line.trim();
      return trimmed ? `<p>${this.escapeHtml(trimmed)}</p>` : '<p><br></p>';
    });

    return paragraphs.join('');
  }

  /**
   * Sanitize HTML element recursively
   */
  private static sanitizeElement(element: Element): void {
    // Remove unwanted attributes
    Array.from(element.attributes).forEach(attr => {
      if (!this.ALLOWED_ATTRIBUTES.includes(attr.name.toLowerCase())) {
        element.removeAttribute(attr.name);
      }
    });

    // Process child nodes
    Array.from(element.childNodes).forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childElement = child as Element;
        const tagName = childElement.tagName.toLowerCase();

        if (this.ALLOWED_TAGS.includes(tagName)) {
          // Recursively sanitize allowed elements
          this.sanitizeElement(childElement);
        } else {
          // Replace unwanted elements with their content
          const fragment = document.createDocumentFragment();
          while (childElement.firstChild) {
            fragment.appendChild(childElement.firstChild);
          }
          element.replaceChild(fragment, childElement);
        }
      }
    });
  }

  /**
   * Extract inline content from pasted HTML (Google Docs style)
   */
  private static extractInlineContent(container: Element): string {
    const result = document.createElement('div');
    
    // Recursively extract inline content while preserving structure
    this.extractInlineNodes(container, result);
    
    return result.innerHTML;
  }

  /**
   * Recursively extract inline nodes while preserving formatting structure
   */
  private static extractInlineNodes(source: Node, target: Node): void {
    Array.from(source.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        // Copy text nodes directly
        target.appendChild(child.cloneNode(true));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as Element;
        const tagName = element.tagName.toLowerCase();
        
        if (['strong', 'b', 'em', 'i', 'u', 'span'].includes(tagName)) {
          // Clone inline formatting elements and preserve their structure
          const clone = element.cloneNode(false) as Element;
          
          // Preserve style attribute for spans
          if (tagName === 'span' && element.getAttribute('style')) {
            clone.setAttribute('style', element.getAttribute('style')!);
          }
          
          target.appendChild(clone);
          
          // Recursively process children
          this.extractInlineNodes(element, clone);
        } else {
          // For block elements (like p), extract their content without the wrapper
          this.extractInlineNodes(element, target);
        }
      }
    });
  }

  /**
   * Insert content at current cursor position
   */
  private static async insertContent(content: string): Promise<void> {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Delete current selection if any
    if (!selection.isCollapsed) {
      range.deleteContents();
    }

    // Use execCommand for simple text insertion (Google Docs approach)
    if (content && !content.includes('<')) {
      // Plain text - use insertText for proper cursor positioning
      document.execCommand('insertText', false, content);
    } else {
      // HTML content - use insertHTML for formatted content
      document.execCommand('insertHTML', false, content);
    }
  }

  /**
   * Preserve formatting context during paste
   */
  static preserveFormatting(content: string, targetFormat: FormatState): string {
    if (!content) return content;

    const temp = document.createElement('div');
    temp.innerHTML = content;

    // Apply target formatting to content
    this.applyFormatToElement(temp, targetFormat);

    return temp.innerHTML;
  }

  /**
   * Apply format to element and its children
   */
  private static applyFormatToElement(element: Element, format: FormatState): void {
    // Apply formatting based on format state
    if (format.bold) {
      this.wrapWithTag(element, 'strong');
    }
    if (format.italic) {
      this.wrapWithTag(element, 'em');
    }
    if (format.underline) {
      this.wrapWithTag(element, 'u');
    }

    // Apply font styles
    if (format.fontSize !== '12pt' || format.fontFamily !== 'Arial') {
      const style = element.getAttribute('style') || '';
      const newStyle = `${style}; font-size: ${format.fontSize}; font-family: ${format.fontFamily};`;
      element.setAttribute('style', newStyle);
    }
  }

  /**
   * Wrap element content with formatting tag
   */
  private static wrapWithTag(element: Element, tagName: string): void {
    const wrapper = document.createElement(tagName);
    while (element.firstChild) {
      wrapper.appendChild(element.firstChild);
    }
    element.appendChild(wrapper);
  }

  /**
   * Escape HTML characters
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Check if clipboard has HTML content
   */
  static hasHtmlContent(clipboardData: DataTransfer): boolean {
    return clipboardData.types.includes('text/html');
  }

  /**
   * Check if clipboard has image content
   */
  static hasImageContent(clipboardData: DataTransfer): boolean {
    return Array.from(clipboardData.types).some(type => type.startsWith('image/'));
  }

  /**
   * Initialize service
   */
  static async initialize(): Promise<void> {
    console.log('PasteService: Initialized');
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
    return { preserveFormatting: true, sanitizeHtml: true, maxLength: 50000 };
  }
}
