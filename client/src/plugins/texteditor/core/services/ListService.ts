/**
 * List Service
 * Handles list creation, management, and nesting operations
 */

export type ListType = 'bullet' | 'numbered';

export interface ListState {
  isInList: boolean;
  listType: ListType | null;
  nestingLevel: number;
}

export class ListService {
  /**
   * Create a bullet list
   */
  static createBulletList(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const currentElement = this.findCurrentElement(range);
    
    if (this.isInList(currentElement)) {
      this.toggleListType(currentElement, 'bullet');
    } else {
      this.convertToList(currentElement, 'bullet');
    }
  }

  /**
   * Create a numbered list
   */
  static createNumberedList(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const currentElement = this.findCurrentElement(range);
    
    if (this.isInList(currentElement)) {
      this.toggleListType(currentElement, 'numbered');
    } else {
      this.convertToList(currentElement, 'numbered');
    }
  }

  /**
   * Remove list formatting
   */
  static removeList(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const currentElement = this.findCurrentElement(range);
    const listItem = this.findListItem(currentElement);
    
    if (listItem) {
      this.convertListItemToParagraph(listItem);
    }
  }

  /**
   * Increase list nesting level
   */
  static increaseNesting(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const currentElement = this.findCurrentElement(range);
    const listItem = this.findListItem(currentElement);
    
    if (listItem) {
      this.nestListItem(listItem);
    }
  }

  /**
   * Decrease list nesting level
   */
  static decreaseNesting(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const currentElement = this.findCurrentElement(range);
    const listItem = this.findListItem(currentElement);
    
    if (listItem) {
      this.unnestListItem(listItem);
    }
  }

  /**
   * Get current list state
   */
  static getListState(): ListState {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return { isInList: false, listType: null, nestingLevel: 0 };
    }

    const range = selection.getRangeAt(0);
    const currentElement = this.findCurrentElement(range);
    const listItem = this.findListItem(currentElement);
    
    if (!listItem) {
      return { isInList: false, listType: null, nestingLevel: 0 };
    }

    const list = listItem.parentElement;
    const listType = list?.tagName.toLowerCase() === 'ul' ? 'bullet' : 'numbered';
    const nestingLevel = this.calculateNestingLevel(listItem);

    return {
      isInList: true,
      listType,
      nestingLevel
    };
  }

  /**
   * Find current element from selection
   */
  private static findCurrentElement(range: Range): Element {
    const container = range.startContainer;
    return container.nodeType === Node.TEXT_NODE 
      ? container.parentElement! 
      : container as Element;
  }

  /**
   * Check if element is in a list
   */
  private static isInList(element: Element): boolean {
    return this.findListItem(element) !== null;
  }

  /**
   * Find list item element
   */
  private static findListItem(element: Element): HTMLLIElement | null {
    let current: Element | null = element;
    
    while (current && !current.matches('.editor-content')) {
      if (current.tagName === 'LI') {
        return current as HTMLLIElement;
      }
      current = current.parentElement;
    }
    
    return null;
  }

  /**
   * Convert element to list
   */
  private static convertToList(element: Element, listType: ListType): void {
    const paragraph = this.findParagraph(element);
    if (!paragraph) return;

    const listElement = document.createElement(listType === 'bullet' ? 'ul' : 'ol');
    const listItem = document.createElement('li');
    
    // Move paragraph content to list item, but keep some content if empty
    if (paragraph.innerHTML.trim() === '' || paragraph.innerHTML === '<br>') {
      listItem.innerHTML = '<br>';
    } else {
      while (paragraph.firstChild) {
        listItem.appendChild(paragraph.firstChild);
      }
    }
    
    listElement.appendChild(listItem);
    paragraph.parentNode?.replaceChild(listElement, paragraph);
    
    // Set cursor at end of list item
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(listItem);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Toggle list type
   */
  private static toggleListType(element: Element, newType: ListType): void {
    const listItem = this.findListItem(element);
    if (!listItem) return;

    const currentList = listItem.parentElement;
    if (!currentList) return;

    const currentType = currentList.tagName.toLowerCase() === 'ul' ? 'bullet' : 'numbered';
    
    if (currentType === newType) {
      // Same type - remove list
      this.removeList();
    } else {
      // Different type - convert list
      const newList = document.createElement(newType === 'bullet' ? 'ul' : 'ol');
      
      // Move all list items to new list
      while (currentList.firstChild) {
        newList.appendChild(currentList.firstChild);
      }
      
      currentList.parentNode?.replaceChild(newList, currentList);
    }
  }

  /**
   * Convert list item to paragraph
   */
  private static convertListItemToParagraph(listItem: HTMLLIElement): void {
    const paragraph = document.createElement('p');
    
    // Move list item content to paragraph
    while (listItem.firstChild) {
      paragraph.appendChild(listItem.firstChild);
    }
    
    const list = listItem.parentElement;
    if (!list) return;

    // If this is the only item, replace the entire list
    if (list.children.length === 1) {
      list.parentNode?.replaceChild(paragraph, list);
    } else {
      // Insert paragraph after the list and remove the list item
      list.parentNode?.insertBefore(paragraph, list.nextSibling);
      listItem.remove();
    }
  }

  /**
   * Nest list item (increase indentation)
   */
  private static nestListItem(listItem: HTMLLIElement): void {
    const previousSibling = listItem.previousElementSibling as HTMLLIElement;
    if (!previousSibling) return; // Can't nest first item

    // Create nested list if it doesn't exist
    let nestedList = previousSibling.querySelector('ul, ol') as HTMLUListElement | HTMLOListElement;
    if (!nestedList) {
      const parentList = listItem.parentElement;
      const listType = parentList?.tagName.toLowerCase() === 'ul' ? 'ul' : 'ol';
      nestedList = document.createElement(listType);
      previousSibling.appendChild(nestedList);
    }

    // Move current item to nested list
    nestedList.appendChild(listItem);
  }

  /**
   * Unnest list item (decrease indentation)
   */
  private static unnestListItem(listItem: HTMLLIElement): void {
    const currentList = listItem.parentElement;
    const parentListItem = currentList?.parentElement;
    
    if (!currentList || !parentListItem || parentListItem.tagName !== 'LI') {
      return; // Already at top level
    }

    const grandparentList = parentListItem.parentElement;
    if (!grandparentList) return;

    // Insert after parent list item
    const nextSibling = parentListItem.nextElementSibling;
    if (nextSibling) {
      grandparentList.insertBefore(listItem, nextSibling);
    } else {
      grandparentList.appendChild(listItem);
    }

    // Clean up empty nested list
    if (currentList.children.length === 0) {
      currentList.remove();
    }
  }

  /**
   * Find paragraph element
   */
  private static findParagraph(element: Element): HTMLParagraphElement | null {
    let current: Element | null = element;
    
    while (current && !current.matches('.editor-content')) {
      if (current.tagName === 'P') {
        return current as HTMLParagraphElement;
      }
      current = current.parentElement;
    }
    
    return null;
  }

  /**
   * Calculate nesting level of list item
   */
  private static calculateNestingLevel(listItem: HTMLLIElement): number {
    let level = 0;
    let current: Element | null = listItem.parentElement;
    
    while (current && !current.matches('.editor-content')) {
      if (current.tagName === 'UL' || current.tagName === 'OL') {
        level++;
      }
      current = current.parentElement;
    }
    
    return level;
  }
}
