/**
 * Search Service - Find and replace functionality
 * Following the development methodology for content persistence and re-editing
 */

export interface SearchResult {
  startOffset: number;
  endOffset: number;
  text: string;
  node: Text;
}

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export class SearchService {
  private currentResults: SearchResult[] = [];
  private currentIndex: number = -1;
  private currentQuery: string = '';

  /**
   * Find all occurrences of text in editor
   */
  findAll(editorElement: HTMLElement, query: string, options: SearchOptions): SearchResult[] {
    if (!query.trim()) {
      this.clearHighlights(editorElement);
      this.currentResults = [];
      return [];
    }

    this.currentQuery = query;
    this.currentResults = [];
    this.currentIndex = -1;

    const textNodes = this.getTextNodes(editorElement);
    
    textNodes.forEach(node => {
      const matches = this.findInTextNode(node, query, options);
      this.currentResults.push(...matches);
    });

    this.highlightResults(editorElement);
    return this.currentResults;
  }

  /**
   * Find next occurrence
   */
  findNext(): SearchResult | null {
    if (this.currentResults.length === 0) return null;
    
    this.currentIndex = (this.currentIndex + 1) % this.currentResults.length;
    const result = this.currentResults[this.currentIndex];
    
    this.highlightCurrent();
    this.scrollToResult();
    
    return result;
  }

  /**
   * Find previous occurrence
   */
  findPrevious(): SearchResult | null {
    if (this.currentResults.length === 0) return null;
    
    this.currentIndex = this.currentIndex <= 0 ? this.currentResults.length - 1 : this.currentIndex - 1;
    const result = this.currentResults[this.currentIndex];
    
    this.highlightCurrent();
    this.scrollToResult();
    
    return result;
  }

  /**
   * Replace current occurrence
   */
  replaceCurrent(replacement: string): boolean {
    // If no results or no current selection, try to select first result
    if (this.currentResults.length === 0) {
      return false;
    }
    
    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }
    
    if (this.currentIndex >= this.currentResults.length) {
      return false;
    }

    // Find the actual highlighted element
    const highlightElement = document.querySelector(`[data-search-index="${this.currentIndex}"]`);
    if (!highlightElement) {
      return false;
    }
    
    try {
      // Replace the entire highlight element with the replacement text
      const replacementNode = document.createTextNode(replacement);
      highlightElement.parentNode?.replaceChild(replacementNode, highlightElement);
      
      // Update results after replacement
      this.currentResults.splice(this.currentIndex, 1);
      if (this.currentIndex >= this.currentResults.length) {
        this.currentIndex = this.currentResults.length - 1;
      }
      
      this.triggerContentChange();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Replace all occurrences
   */
  replaceAll(editorElement: HTMLElement, query: string, replacement: string, options: SearchOptions): number {
    const results = this.findAll(editorElement, query, options);
    let replacedCount = 0;

    // Replace from end to start to maintain offsets
    for (let i = results.length - 1; i >= 0; i--) {
      const result = results[i];
      
      // Validate that the node still exists and has the expected content
      if (!result.node || !result.node.parentNode) {
        continue;
      }
      
      const nodeLength = result.node.textContent?.length || 0;
      if (result.startOffset >= nodeLength || result.endOffset > nodeLength) {
        continue;
      }
      
      const range = document.createRange();
      range.setStart(result.node, result.startOffset);
      range.setEnd(result.node, result.endOffset);
      
      range.deleteContents();
      range.insertNode(document.createTextNode(replacement));
      replacedCount++;
    }

    this.clearHighlights(editorElement);
    this.currentResults = [];
    this.currentIndex = -1;
    
    if (replacedCount > 0) {
      this.triggerContentChange();
    }
    
    return replacedCount;
  }

  /**
   * Clear all highlights and reset search
   */
  clearSearch(editorElement: HTMLElement): void {
    this.clearHighlights(editorElement);
    this.currentResults = [];
    this.currentIndex = -1;
    this.currentQuery = '';
  }

  /**
   * Get current search stats
   */
  getSearchStats(): { current: number; total: number; query: string } {
    return {
      current: this.currentIndex + 1,
      total: this.currentResults.length,
      query: this.currentQuery
    };
  }

  /**
   * Find matches in a text node
   */
  private findInTextNode(node: Text, query: string, options: SearchOptions): SearchResult[] {
    const results: SearchResult[] = [];
    const text = node.textContent || '';
    
    let searchText = text;
    let searchQuery = query;
    
    if (!options.caseSensitive) {
      searchText = text.toLowerCase();
      searchQuery = query.toLowerCase();
    }

    if (options.useRegex) {
      try {
        const flags = options.caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(query, flags);
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          results.push({
            startOffset: match.index,
            endOffset: match.index + match[0].length,
            text: match[0],
            node
          });
        }
      } catch (e) {
        // Invalid regex, fall back to literal search
        return this.findLiteralMatches(node, searchText, searchQuery, options);
      }
    } else {
      return this.findLiteralMatches(node, searchText, searchQuery, options);
    }

    return results;
  }

  /**
   * Find literal string matches
   */
  private findLiteralMatches(node: Text, searchText: string, searchQuery: string, options: SearchOptions): SearchResult[] {
    const results: SearchResult[] = [];
    let startIndex = 0;

    while (true) {
      let index = searchText.indexOf(searchQuery, startIndex);
      if (index === -1) break;

      // Check whole word boundary if required
      if (options.wholeWord) {
        const beforeChar = index > 0 ? searchText[index - 1] : ' ';
        const afterChar = index + searchQuery.length < searchText.length ? 
                         searchText[index + searchQuery.length] : ' ';
        
        if (!/\W/.test(beforeChar) || !/\W/.test(afterChar)) {
          startIndex = index + 1;
          continue;
        }
      }

      results.push({
        startOffset: index,
        endOffset: index + searchQuery.length,
        text: (node.textContent || '').substring(index, index + searchQuery.length),
        node
      });

      startIndex = index + 1;
    }

    return results;
  }

  /**
   * Get all text nodes in element
   */
  private getTextNodes(element: HTMLElement): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.textContent && node.textContent.trim()) {
        textNodes.push(node as Text);
      }
    }

    return textNodes;
  }

  /**
   * Highlight search results
   */
  private highlightResults(editorElement: HTMLElement): void {
    this.clearHighlights(editorElement);

    this.currentResults.forEach((result, index) => {
      // Validate that the node still exists and has the expected content
      if (!result.node || !result.node.parentNode) {
        return;
      }
      
      const nodeLength = result.node.textContent?.length || 0;
      if (result.startOffset >= nodeLength || result.endOffset > nodeLength) {
        return;
      }
      
      const range = document.createRange();
      range.setStart(result.node, result.startOffset);
      range.setEnd(result.node, result.endOffset);

      const highlight = document.createElement('mark');
      highlight.className = 'search-highlight';
      highlight.setAttribute('data-search-index', index.toString());
      
      try {
        range.surroundContents(highlight);
      } catch (e) {
        // Handle cases where range spans multiple elements
        try {
          const contents = range.extractContents();
          highlight.appendChild(contents);
          range.insertNode(highlight);
        } catch (e2) {
          // If highlighting fails, skip this result
          console.warn('Failed to highlight search result:', e2);
        }
      }
    });
  }

  /**
   * Highlight current result
   */
  private highlightCurrent(): void {
    // Remove previous current highlight
    const prevCurrent = document.querySelector('.search-highlight.current');
    if (prevCurrent) {
      prevCurrent.classList.remove('current');
    }

    // Add current highlight
    if (this.currentIndex >= 0) {
      const currentHighlight = document.querySelector(`[data-search-index="${this.currentIndex}"]`);
      if (currentHighlight) {
        currentHighlight.classList.add('current');
      }
    }
  }

  /**
   * Clear all highlights
   */
  private clearHighlights(editorElement: HTMLElement): void {
    const highlights = editorElement.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
        parent.normalize();
      }
    });
  }

  /**
   * Scroll to search result
   */
  private scrollToResult(): void {
    const highlight = document.querySelector(`[data-search-index="${this.currentIndex}"]`);
    if (highlight) {
      highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Trigger content change event
   */
  private triggerContentChange(): void {
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
    if (editor) {
      const event = new Event('input', { bubbles: true });
      editor.dispatchEvent(event);
    }
  }

  /**
   * Initialize service
   */
  async initialize(): Promise<void> {
    console.log('SearchService: Initialized');
  }

  /**
   * Destroy service and cleanup
   */
  destroy(): void {
    this.currentResults = [];
    this.currentIndex = -1;
    this.currentQuery = '';
  }

  /**
   * Get service configuration
   */
  getConfig(): any {
    return { maxResults: 100, caseSensitive: false };
  }
}
