/**
 * Link Service - URL validation and link management
 * Handles link creation, editing, and validation
 */

export interface LinkData {
  url: string;
  text: string;
  target: '_blank' | '_self';
  title?: string;
}

export interface LinkValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

export class LinkService {
  /**
   * Validate and normalize URL
   */
  static validateUrl(url: string): LinkValidationResult {
    if (!url || url.trim() === '') {
      return { isValid: false, error: 'URL is required' };
    }

    const trimmedUrl = url.trim();
    
    // Check for common URL patterns
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    const emailPattern = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    const telPattern = /^tel:\+?[\d\s\-\(\)]+$/i;
    
    // Handle different URL types
    if (trimmedUrl.startsWith('mailto:') || trimmedUrl.startsWith('tel:')) {
      if (emailPattern.test(trimmedUrl) || telPattern.test(trimmedUrl)) {
        return { isValid: true, normalizedUrl: trimmedUrl };
      }
      return { isValid: false, error: 'Invalid email or phone format' };
    }
    
    // Add protocol if missing
    let normalizedUrl = trimmedUrl;
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + trimmedUrl;
    }
    
    if (urlPattern.test(normalizedUrl)) {
      return { isValid: true, normalizedUrl };
    }
    
    return { isValid: false, error: 'Invalid URL format' };
  }

  /**
   * Create link element
   */
  static createLink(linkData: LinkData): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = linkData.url;
    link.textContent = linkData.text;
    link.target = linkData.target;
    if (linkData.title) {
      link.title = linkData.title;
    }
    return link;
  }

  /**
   * Get link data from element
   */
  static getLinkData(element: HTMLAnchorElement): LinkData {
    return {
      url: element.href,
      text: element.textContent || '',
      target: (element.target as '_blank' | '_self') || '_self',
      title: element.title
    };
  }

  /**
   * Find link element at current selection
   */
  static findLinkAtSelection(): HTMLAnchorElement | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;
    
    // If text node, get parent element
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement!;
    }
    
    // Check if current element or parent is a link
    while (element && element !== document.body) {
      if (element.nodeName === 'A') {
        return element as HTMLAnchorElement;
      }
      element = element.parentElement!;
    }
    
    return null;
  }

  /**
   * Apply link to current selection
   */
  static applyLink(linkData: LinkData): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    // Use selected text or provided text
    const linkText = selectedText || linkData.text;
    
    // Create link element
    const link = this.createLink({
      ...linkData,
      text: linkText
    });
    
    // Replace selection with link
    range.deleteContents();
    range.insertNode(link);
    
    // Position cursor after the link
    range.setStartAfter(link);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Remove link from current selection
   */
  static removeLink(): void {
    const link = this.findLinkAtSelection();
    if (!link) return;

    const parent = link.parentNode;
    if (!parent) return;

    // Replace link with its text content
    const textNode = document.createTextNode(link.textContent || '');
    parent.replaceChild(textNode, link);
  }

  /**
   * Edit existing link
   */
  static editLink(linkData: LinkData): void {
    const link = this.findLinkAtSelection();
    if (!link) return;

    link.href = linkData.url;
    link.textContent = linkData.text;
    link.target = linkData.target;
    if (linkData.title) {
      link.title = linkData.title;
    } else {
      link.removeAttribute('title');
    }
  }
}
