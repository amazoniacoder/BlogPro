/**
 * Command implementations for the editor
 * Concrete command classes for undo/redo system
 */

import { FormatCommand, InsertCommand, DeleteCommand, ReplaceCommand } from '../types/SystemTypes';
import { FormatState, SelectionState } from '../types/CoreTypes';
import { ServiceFactory } from './ServiceFactory';
import { getSelectionState } from '../../shared/utils/selectionUtils';

/**
 * Base command interface
 */
interface BaseCommand {
  readonly id: string;
  readonly timestamp: number;
  readonly type: string;
  execute(): Promise<void>;
  undo(): Promise<void>;
  canExecute(): boolean;
  canUndo(): boolean;
}

/**
 * Abstract base command implementation
 */
abstract class AbstractCommand implements BaseCommand {
  readonly id: string;
  readonly timestamp: number;
  abstract readonly type: string;

  constructor(id?: string) {
    this.id = id || `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = Date.now();
  }

  abstract execute(): Promise<void>;
  abstract undo(): Promise<void>;
  abstract canExecute(): boolean;
  abstract canUndo(): boolean;
}

/**
 * Format command implementation
 */
export class FormatCommandImpl extends AbstractCommand implements FormatCommand {
  readonly type = 'format' as const;
  readonly formatType: keyof FormatState;
  readonly value: FormatState[keyof FormatState];
  readonly range: SelectionState;
  private previousValue?: FormatState[keyof FormatState];

  constructor(
    formatType: keyof FormatState,
    value: FormatState[keyof FormatState],
    range: SelectionState
  ) {
    super();
    this.formatType = formatType;
    this.value = value;
    this.range = range;
  }

  async execute(): Promise<void> {
    const formatService = await ServiceFactory.getUnifiedFormatService();
    
    // Store previous value for undo
    const currentState = formatService.getFormatState();
    this.previousValue = currentState[this.formatType];

    // Apply format based on type
    switch (this.formatType) {
      case 'bold':
        formatService.applyBold();
        break;
      case 'italic':
        formatService.applyItalic();
        break;
      case 'underline':
        formatService.applyUnderline();
        break;
    }
  }

  async undo(): Promise<void> {
    if (this.previousValue !== undefined) {
      const formatService = await ServiceFactory.getUnifiedFormatService();
      
      // Apply opposite of current format to restore previous state
      switch (this.formatType) {
        case 'bold':
          formatService.applyBold();
          break;
        case 'italic':
          formatService.applyItalic();
          break;
        case 'underline':
          formatService.applyUnderline();
          break;
      }
    }
  }

  canExecute(): boolean {
    return true;
  }

  canUndo(): boolean {
    return this.previousValue !== undefined;
  }
}

/**
 * Insert command implementation
 */
export class InsertCommandImpl extends AbstractCommand implements InsertCommand {
  readonly type = 'insert' as const;
  readonly content: string;
  readonly position: number;

  constructor(content: string, position: number) {
    super();
    this.content = content;
    this.position = position;
  }

  async execute(): Promise<void> {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(this.content);
      
      range.deleteContents();
      range.insertNode(textNode);
      
      // Move cursor after inserted text
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      // Fallback to execCommand for compatibility
      document.execCommand('insertText', false, this.content);
    }
  }

  async undo(): Promise<void> {
    const selection = window.getSelection();
    if (!selection) return;

    // Select and delete inserted content
    const range = document.createRange();
    const textNode = selection.anchorNode;
    
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      range.setStart(textNode, this.position);
      range.setEnd(textNode, this.position + this.content.length);
      range.deleteContents();
    }
  }

  canExecute(): boolean {
    return this.content.length > 0;
  }

  canUndo(): boolean {
    return true;
  }
}

/**
 * Delete command implementation
 */
export class DeleteCommandImpl extends AbstractCommand implements DeleteCommand {
  readonly type = 'delete' as const;
  readonly range: SelectionState;
  readonly deletedContent: string;

  constructor(range: SelectionState, deletedContent: string) {
    super();
    this.range = range;
    this.deletedContent = deletedContent;
  }

  async execute(): Promise<void> {
    // Delete content in range
    const selection = window.getSelection();
    if (!selection) return;

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
    }
  }

  async undo(): Promise<void> {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(this.deletedContent);
      
      range.insertNode(textNode);
      
      // Move cursor after restored text
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      // Fallback to modern text insertion
      const formatService = await ServiceFactory.getUnifiedFormatService();
      formatService.insertText(this.deletedContent);
    }
  }

  canExecute(): boolean {
    return this.deletedContent.length > 0;
  }

  canUndo(): boolean {
    return true;
  }
}

/**
 * Replace command implementation
 */
export class ReplaceCommandImpl extends AbstractCommand implements ReplaceCommand {
  readonly type = 'replace' as const;
  readonly range: SelectionState;
  readonly oldContent: string;
  readonly newContent: string;

  constructor(range: SelectionState, oldContent: string, newContent: string) {
    super();
    this.range = range;
    this.oldContent = oldContent;
    this.newContent = newContent;
  }

  async execute(): Promise<void> {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(this.newContent);
      
      range.deleteContents();
      range.insertNode(textNode);
      
      // Move cursor after new content
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      // Fallback to modern text insertion
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const formatService = await ServiceFactory.getUnifiedFormatService();
        formatService.insertText(this.newContent);
      }
    }
  }

  async undo(): Promise<void> {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      
      // Select new content to replace
      const startOffset = range.startOffset - this.newContent.length;
      if (startOffset >= 0) {
        range.setStart(range.startContainer, startOffset);
        range.setEnd(range.startContainer, range.startOffset);
        
        const textNode = document.createTextNode(this.oldContent);
        range.deleteContents();
        range.insertNode(textNode);
        
        // Move cursor after old content
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (error) {
      // Fallback to modern text insertion
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.setStart(range.startContainer, range.startOffset - this.newContent.length);
        range.setEnd(range.startContainer, range.startOffset);
        range.deleteContents();
        const formatService = await ServiceFactory.getUnifiedFormatService();
        formatService.insertText(this.oldContent);
      }
    }
  }

  canExecute(): boolean {
    return this.oldContent !== this.newContent;
  }

  canUndo(): boolean {
    return true;
  }
}

/**
 * Command factory for creating commands
 */
export class CommandFactory {
  static createFormatCommand(
    formatType: keyof FormatState,
    value: FormatState[keyof FormatState],
    range?: SelectionState
  ): FormatCommandImpl {
    const currentRange = range || getSelectionState() || {
      start: 0,
      end: 0,
      isCollapsed: true,
      anchorNode: null,
      focusNode: null,
      direction: 'none' as const
    };
    
    return new FormatCommandImpl(formatType, value, currentRange);
  }

  static createInsertCommand(content: string, position?: number): InsertCommandImpl {
    const currentPosition = position || window.getSelection()?.getRangeAt(0)?.startOffset || 0;
    return new InsertCommandImpl(content, currentPosition);
  }

  static createDeleteCommand(range: SelectionState, deletedContent: string): DeleteCommandImpl {
    return new DeleteCommandImpl(range, deletedContent);
  }

  static createReplaceCommand(
    range: SelectionState,
    oldContent: string,
    newContent: string
  ): ReplaceCommandImpl {
    return new ReplaceCommandImpl(range, oldContent, newContent);
  }
}
