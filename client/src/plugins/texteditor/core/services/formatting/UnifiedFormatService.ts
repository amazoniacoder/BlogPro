/**
 * Unified Format Service
 * 
 * Consolidates TextFormatService + ModernFormatService + SimpleCursorFix
 * into a single, comprehensive formatting service with cursor management.
 */

import { FormatState, FontSize, FontFamily, TextAlign } from '../../types/CoreTypes';
import { IUnifiedFormatService } from '../UnifiedServiceInterfaces';
import { ServiceFactory } from '../ServiceFactory';
import { Disposable, LifecycleManager } from '../../lifecycle/LifecycleManager';
import { DOMAdapterFactory } from '../../dom/DOMAdapterFactory';
import { DOMAdapter } from '../../dom/DOMAdapter';

export class UnifiedFormatService implements IUnifiedFormatService, Disposable {
  private dom: DOMAdapter;
  
  constructor() {
    this.dom = DOMAdapterFactory.getInstance();
    
    // Register with lifecycle manager
    const lifecycleManager = LifecycleManager.getInstance();
    lifecycleManager.register(this);
  }
  
  // Text formatting methods (from TextFormatService)
  
  applyBold(): void {
    const selection = this.dom.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    if (range.collapsed) {
      this.setFormatAtCursor('bold', true);
    } else {
      this.wrapSelection('strong');
    }
  }

  applyItalic(): void {
    const selection = this.dom.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    if (range.collapsed) {
      this.setFormatAtCursor('italic', true);
    } else {
      this.wrapSelection('em');
    }
  }

  applyUnderline(): void {
    const selection = this.dom.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    if (range.collapsed) {
      this.setFormatAtCursor('underline', true);
    } else {
      this.wrapSelection('u');
    }
  }

  // Cursor management methods (from SimpleCursorFix)
  
  handleSpace(): boolean {
    const selection = this.dom.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    
    if (container.nodeType !== Node.TEXT_NODE) return false;
    
    const parent = container.parentElement;
    if (!parent) return false;
    
    const isFormattingTag = parent.matches('strong, em, u, b, i');
    const isStyledSpan = parent.matches('span') && 
      (parent.style.fontSize || parent.style.fontFamily || parent.style.color || parent.style.backgroundColor);
    const isSpellCheckHighlight = parent.matches('span.spell-error-highlight, span.spell-error');
    
    if (!isFormattingTag && !isStyledSpan && !isSpellCheckHighlight) return false;
    
    const offset = range.startOffset;
    const textLength = container.textContent?.length || 0;
    if (offset !== textLength) return false;
    
    const spaceNode = document.createTextNode(' ');
    const cursorNode = document.createTextNode('\u200B');
    
    parent.parentNode!.insertBefore(spaceNode, parent.nextSibling);
    parent.parentNode!.insertBefore(cursorNode, spaceNode.nextSibling);
    
    const newRange = document.createRange();
    newRange.setStart(cursorNode, 0);
    newRange.collapse(true);
    
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    return true;
  }

  handleEnter(): boolean {
    const selection = this.dom.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    
    const newP = document.createElement('p');
    const brElement = document.createElement('br');
    newP.appendChild(brElement);
    
    const container = range.startContainer;
    const currentP = container.nodeType === Node.TEXT_NODE 
      ? container.parentElement?.closest('p')
      : (container as Element).closest('p');
    
    if (!currentP || !currentP.parentNode) return false;
    
    currentP.parentNode.insertBefore(newP, currentP.nextSibling);
    
    const newRange = document.createRange();
    newRange.setStart(newP, 0);
    newRange.collapse(true);
    
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    return true;
  }

  // Format orchestration methods (from ModernFormatService)
  
  getFormatState(): FormatState {
    const selection = this.dom.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return this.getDefaultFormat();
    }

    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    const element = container.nodeType === Node.TEXT_NODE 
      ? container.parentElement 
      : container as Element;

    if (!element) return this.getDefaultFormat();

    return {
      bold: this.hasFormattingInHierarchy(element, ['strong', 'b']) || this.hasStyleProperty(element, 'font-weight', ['bold', '700', '800', '900']),
      italic: this.hasFormattingInHierarchy(element, ['em', 'i']) || this.hasStyleProperty(element, 'font-style', ['italic']),
      underline: this.hasFormattingInHierarchy(element, ['u']) || this.hasStyleProperty(element, 'text-decoration', ['underline']),
      fontSize: ServiceFactory.getFontFormatService().getFontSize(element) as FontSize,
      fontFamily: ServiceFactory.getFontFormatService().getFontFamily(element) as FontFamily,
      textAlign: ServiceFactory.getLayoutFormatService().getTextAlign(element) as TextAlign,
      textColor: ServiceFactory.getLayoutFormatService().getTextColor(element),
      backgroundColor: ServiceFactory.getLayoutFormatService().getBackgroundColor(element),
      listState: this.getListState(element)
    };
  }

  insertText(text: string): void {
    if (text === ' ') return;
    
    const format = this.getFormatState();
    const formattedNode = this.createFormattedTextNode(text, {
      bold: format.bold,
      italic: format.italic,
      underline: format.underline
    });
    
    this.insertNodeAtSelection(formattedNode);
  }

  // Font formatting delegation
  
  applyFontSize(fontSize: string): void {
    ServiceFactory.getFontFormatService().applyFontSize(fontSize as any);
  }

  applyFontFamily(fontFamily: string): void {
    ServiceFactory.getFontFormatService().applyFontFamily(fontFamily as any);
  }

  // Layout formatting delegation
  
  applyTextAlign(textAlign: string): void {
    ServiceFactory.getLayoutFormatService().applyTextAlign(textAlign as any);
  }

  applyTextColor(color: string): void {
    ServiceFactory.getLayoutFormatService().applyTextColor(color);
  }

  applyBackgroundColor(color: string): void {
    ServiceFactory.getLayoutFormatService().applyBackgroundColor(color);
  }

  // List operations delegation
  
  applyBulletList(): void {
    ServiceFactory.getListService().createBulletList();
  }

  applyNumberedList(): void {
    ServiceFactory.getListService().createNumberedList();
  }

  removeList(): void {
    ServiceFactory.getListService().removeList();
  }

  increaseListNesting(): void {
    ServiceFactory.getListService().increaseNesting();
  }

  decreaseListNesting(): void {
    ServiceFactory.getListService().decreaseNesting();
  }

  // Link operations delegation
  
  applyLink(linkData: any): void {
    ServiceFactory.getLinkService().applyLink(linkData);
  }

  editLink(linkData: any): void {
    ServiceFactory.getLinkService().editLink(linkData);
  }

  removeLink(): void {
    ServiceFactory.getLinkService().removeLink();
  }

  // Media operations delegation
  
  insertImage(imageData: any): void {
    ServiceFactory.getMediaService().insertImage(imageData);
  }

  // Private helper methods
  
  private setFormatAtCursor(format: string, value: boolean): void {
    const selection = this.dom.getSelection();
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

  private wrapSelection(tagName: string): boolean {
    return ServiceFactory.getDOMManipulationService().wrapSelection(tagName);
  }

  private hasFormattingInHierarchy(element: Element, tagNames: string[]): boolean {
    return ServiceFactory.getDOMManipulationService().hasFormattingInHierarchy(element, tagNames);
  }

  private hasStyleProperty(element: Element, property: string, values: string[]): boolean {
    return ServiceFactory.getDOMManipulationService().hasStyleProperty(element, property, values);
  }

  private createFormattedTextNode(text: string, formatting: { bold?: boolean; italic?: boolean; underline?: boolean }): Node {
    return ServiceFactory.getDOMManipulationService().createFormattedTextNode(text, formatting);
  }

  private insertNodeAtSelection(node: Node): boolean {
    return ServiceFactory.getDOMManipulationService().insertNodeAtSelection(node);
  }

  private getListState(element: Element): { isInList: boolean; listType: 'bullet' | 'numbered' | null; nestingLevel: number } {
    const listItem = this.findListItem(element);
    
    if (!listItem) {
      return { isInList: false, listType: null, nestingLevel: 0 };
    }

    const list = listItem.parentElement;
    const listType = list?.tagName.toLowerCase() === 'ul' ? 'bullet' : 'numbered';
    const nestingLevel = this.calculateNestingLevel(listItem);
    
    return { isInList: true, listType, nestingLevel };
  }

  private findListItem(element: Element): Element | null {
    let current = element;
    while (current && current.tagName.toLowerCase() !== 'li') {
      current = current.parentElement!;
      if (!current || current.tagName.toLowerCase() === 'body') {
        return null;
      }
    }
    return current;
  }

  private calculateNestingLevel(listItem: Element): number {
    let level = 0;
    let current = listItem.parentElement;
    
    while (current) {
      if (current.tagName.toLowerCase() === 'ul' || current.tagName.toLowerCase() === 'ol') {
        level++;
      }
      current = current.parentElement;
      if (!current || current.tagName.toLowerCase() === 'body') {
        break;
      }
    }
    
    return level;
  }

  private getDefaultFormat(): FormatState {
    return {
      bold: false,
      italic: false,
      underline: false,
      fontSize: '14px' as FontSize,
      fontFamily: 'Arial' as FontFamily,
      textAlign: 'left' as TextAlign,
      textColor: '#000000',
      backgroundColor: 'transparent',
      listState: { isInList: false, listType: null, nestingLevel: 0 }
    };
  }

  dispose(): void {
    // Unregister from lifecycle manager
    const lifecycleManager = LifecycleManager.getInstance();
    lifecycleManager.unregister(this);
    
    // Cleanup any resources if needed
  }
  
  destroy(): void {
    this.dispose();
  }
}
