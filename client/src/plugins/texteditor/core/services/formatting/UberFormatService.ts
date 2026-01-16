/**
 * UberFormatService - Consolidated formatting service
 * Combines TextFormatService + FontFormatService + LayoutFormatService
 */

import { IUnifiedFormatService } from '../UnifiedServiceInterfaces';
import { FormatState } from '../../types/CoreTypes';

export class UberFormatService implements IUnifiedFormatService {
  // Text formatting methods
  applyBold(): void {
    document.execCommand('bold', false);
  }

  applyItalic(): void {
    document.execCommand('italic', false);
  }

  applyUnderline(): void {
    document.execCommand('underline', false);
  }

  // Font formatting methods
  applyFontSize(fontSize: string): void {
    document.execCommand('fontSize', false, fontSize);
  }

  applyFontFamily(fontFamily: string): void {
    document.execCommand('fontName', false, fontFamily);
  }

  // Layout formatting methods
  applyTextAlign(textAlign: string): void {
    document.execCommand('justify' + textAlign.charAt(0).toUpperCase() + textAlign.slice(1), false);
  }

  applyTextColor(color: string): void {
    document.execCommand('foreColor', false, color);
  }

  applyBackgroundColor(color: string): void {
    document.execCommand('backColor', false, color);
  }

  // List operations
  applyBulletList(): void {
    document.execCommand('insertUnorderedList', false);
  }

  applyNumberedList(): void {
    document.execCommand('insertOrderedList', false);
  }

  removeList(): void {
    document.execCommand('insertUnorderedList', false);
  }

  increaseListNesting(): void {
    document.execCommand('indent', false);
  }

  decreaseListNesting(): void {
    document.execCommand('outdent', false);
  }

  // Link operations
  applyLink(linkData: any): void {
    document.execCommand('createLink', false, linkData.url);
  }

  editLink(linkData: any): void {
    this.applyLink(linkData);
  }

  removeLink(): void {
    document.execCommand('unlink', false);
  }

  // Media operations
  insertImage(imageData: any): void {
    document.execCommand('insertImage', false, imageData.src);
  }

  // Cursor management
  handleSpace(): boolean {
    return false; // Let default behavior handle
  }

  handleEnter(): boolean {
    return false; // Let default behavior handle
  }

  // Format state detection
  getFormatState(): FormatState {
    return {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      fontSize: document.queryCommandValue('fontSize') as any,
      fontFamily: document.queryCommandValue('fontName') as any,
      textAlign: this.getTextAlign(),
      textColor: document.queryCommandValue('foreColor'),
      backgroundColor: document.queryCommandValue('backColor'),
      listState: {
        isInList: document.queryCommandState('insertUnorderedList') || document.queryCommandState('insertOrderedList'),
        listType: document.queryCommandState('insertUnorderedList') ? 'bullet' : 
                 document.queryCommandState('insertOrderedList') ? 'numbered' : null,
        nestingLevel: 0
      }
    };
  }

  insertText(text: string): void {
    document.execCommand('insertText', false, text);
  }

  private getTextAlign(): 'left' | 'center' | 'right' | 'justify' {
    if (document.queryCommandState('justifyCenter')) return 'center';
    if (document.queryCommandState('justifyRight')) return 'right';
    if (document.queryCommandState('justifyFull')) return 'justify';
    return 'left';
  }

  destroy(): void {
    // Cleanup if needed
  }
}
