/**
 * Font Switching Service
 * Automatically applies different fonts to text vs numbers
 */

export class FontSwitchingService {
  private static instance: FontSwitchingService;
  private observer?: MutationObserver;

  static getInstance(): FontSwitchingService {
    if (!this.instance) {
      this.instance = new FontSwitchingService();
    }
    return this.instance;
  }

  initializeForEditor(editorElement: HTMLElement): void {
    this.applyFontSwitching(editorElement);
    this.setupMutationObserver(editorElement);
  }

  private applyFontSwitching(element: HTMLElement): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    textNodes.forEach(textNode => {
      this.processTextNode(textNode);
    });
  }

  private processTextNode(textNode: Text): void {
    const text = textNode.textContent || '';
    if (!text || !this.containsNumbers(text)) return;

    const parent = textNode.parentElement;
    if (!parent) return;

    // Don't process if inside formatting elements to preserve formatting
    if (this.isInsideFormattingElement(parent)) return;

    // Split text into segments of letters and numbers
    const segments = this.splitTextByType(text);
    if (segments.length <= 1) return;

    // Store cursor position before DOM manipulation
    const selection = window.getSelection();
    const cursorOffset = selection && selection.rangeCount > 0 ? 
      selection.getRangeAt(0).startOffset : 0;

    // Create document fragment with styled spans
    const fragment = document.createDocumentFragment();
    
    segments.forEach(segment => {
      if (this.isNumeric(segment.text)) {
        const span = document.createElement('span');
        span.className = 'number-char';
        span.textContent = segment.text;
        fragment.appendChild(span);
      } else {
        fragment.appendChild(document.createTextNode(segment.text));
      }
    });

    // Replace the text node with the fragment
    parent.replaceChild(fragment, textNode);

    // Restore cursor position
    this.restoreCursorPosition(parent, cursorOffset);
  }

  private isInsideFormattingElement(element: Element): boolean {
    const formattingTags = ['strong', 'b', 'em', 'i', 'u'];
    let current: Element | null = element;
    
    while (current && !current.matches('.editor-content')) {
      // Skip processing if inside any formatting element
      if (formattingTags.includes(current.tagName.toLowerCase())) {
        return true;
      }
      // Skip processing if inside styled spans (font formatting)
      if (current.tagName.toLowerCase() === 'span' && 
          (current.hasAttribute('style') || current.className.includes('number-char'))) {
        return true;
      }
      current = current.parentElement;
    }
    
    return false;
  }

  private restoreCursorPosition(parent: Element, offset: number): void {
    try {
      const selection = window.getSelection();
      if (!selection) return;

      const range = document.createRange();
      const walker = document.createTreeWalker(
        parent,
        NodeFilter.SHOW_TEXT,
        null
      );

      let currentOffset = 0;
      let targetNode: Node | null = null;
      let targetOffset = 0;

      let node;
      while (node = walker.nextNode()) {
        const nodeLength = node.textContent?.length || 0;
        if (currentOffset + nodeLength >= offset) {
          targetNode = node;
          targetOffset = offset - currentOffset;
          break;
        }
        currentOffset += nodeLength;
      }

      if (targetNode) {
        range.setStart(targetNode, targetOffset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (error) {
      // Ignore cursor restoration errors
    }
  }

  private splitTextByType(text: string): Array<{text: string, type: 'text' | 'number'}> {
    const segments: Array<{text: string, type: 'text' | 'number'}> = [];
    let currentSegment = '';
    let currentType: 'text' | 'number' | null = null;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const isDigit = /\d/.test(char);
      const charType = isDigit ? 'number' : 'text';

      if (currentType === null) {
        currentType = charType;
        currentSegment = char;
      } else if (currentType === charType) {
        currentSegment += char;
      } else {
        // Type changed, save current segment and start new one
        segments.push({ text: currentSegment, type: currentType });
        currentType = charType;
        currentSegment = char;
      }
    }

    // Add the last segment
    if (currentSegment) {
      segments.push({ text: currentSegment, type: currentType! });
    }

    return segments;
  }

  private containsNumbers(text: string): boolean {
    return /\d/.test(text);
  }

  private isNumeric(text: string): boolean {
    return /^\d+$/.test(text);
  }

  private setupMutationObserver(editorElement: HTMLElement): void {
    this.observer = new MutationObserver((mutations) => {
      // Debounce processing to avoid cursor displacement during typing
      setTimeout(() => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                this.processTextNode(node as Text);
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                this.applyFontSwitching(node as HTMLElement);
              }
            });
          } else if (mutation.type === 'characterData') {
            const textNode = mutation.target as Text;
            // Only process if not actively typing (avoid cursor displacement)
            if (!this.isActivelyTyping(textNode)) {
              this.processTextNode(textNode);
            }
          }
        });
      }, 100); // Small delay to avoid interfering with typing
    });

    this.observer.observe(editorElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private isActivelyTyping(textNode: Text): boolean {
    // Check if cursor is at the end of this text node (indicates active typing)
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    return range.startContainer === textNode && 
           range.startOffset === (textNode.textContent?.length || 0);
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }
}
