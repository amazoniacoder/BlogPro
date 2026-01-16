/**
 * History service for undo/redo functionality
 * Implements command pattern for editor operations
 */

import { AnyEditorCommand } from '../types/SystemTypes';

export interface HistoryOptions {
  readonly maxSize: number;
  readonly mergeInterval: number; // ms
}

export class HistoryService {
  private history: AnyEditorCommand[] = [];
  private currentIndex: number = -1;
  private readonly maxSize: number;
  private readonly mergeInterval: number;
  private lastCommandTime: number = 0;
  
  // Simple content history for formatting operations
  private contentHistory: string[] = [];
  private contentIndex: number = -1;

  constructor(options: HistoryOptions = { maxSize: 100, mergeInterval: 1000 }) {
    this.maxSize = options.maxSize;
    this.mergeInterval = options.mergeInterval;
  }

  /**
   * Execute command and add to history
   */
  async execute(command: AnyEditorCommand): Promise<void> {
    if (!command.canExecute()) {
      throw new Error(`Command ${command.id} cannot be executed`);
    }

    await command.execute();

    // Add to history
    this.addToHistory(command);
  }

  /**
   * Undo last command
   */
  async undo(): Promise<boolean> {
    if (!this.canUndo()) return false;

    const command = this.history[this.currentIndex];
    if (!command.canUndo()) return false;

    await command.undo();
    this.currentIndex--;
    return true;
  }

  /**
   * Redo next command
   */
  async redo(): Promise<boolean> {
    if (!this.canRedo()) return false;

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    
    if (!command.canExecute()) {
      this.currentIndex--;
      return false;
    }

    await command.execute();
    return true;
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current history state
   */
  getHistoryState() {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentIndex: this.currentIndex,
      maxSize: this.maxSize
    };
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    this.lastCommandTime = 0;
  }

  /**
   * Add command to history with smart merging
   */
  private addToHistory(command: AnyEditorCommand): void {
    const now = Date.now();
    
    // Remove any commands after current index (when undoing then doing new action)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Try to merge with previous command if within merge interval
    if (this.shouldMergeWithPrevious(command, now)) {
      // Replace last command with merged version
      this.history[this.history.length - 1] = command;
    } else {
      // Add new command
      this.history.push(command);
      this.currentIndex++;
    }

    // Maintain max size
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.currentIndex--;
    }

    this.lastCommandTime = now;
  }

  /**
   * Check if command should be merged with previous
   */
  private shouldMergeWithPrevious(command: AnyEditorCommand, now: number): boolean {
    if (this.history.length === 0) return false;
    if (now - this.lastCommandTime > this.mergeInterval) return false;

    const lastCommand = this.history[this.history.length - 1];
    
    // Only merge same type of commands
    if (lastCommand.type !== command.type) return false;
    
    // Only merge insert commands for now
    return command.type === 'insert';
  }

  /**
   * Save content state for undo/redo
   */
  saveState(content: string): void {
    // Remove any states after current index
    if (this.contentIndex < this.contentHistory.length - 1) {
      this.contentHistory = this.contentHistory.slice(0, this.contentIndex + 1);
    }
    
    // Don't save duplicate states
    if (this.contentHistory[this.contentIndex] === content) {
      return;
    }
    
    this.contentHistory.push(content);
    this.contentIndex++;
    
    // Maintain max size
    if (this.contentHistory.length > this.maxSize) {
      this.contentHistory.shift();
      this.contentIndex--;
    }
  }
  
  /**
   * Undo to previous content state
   */
  async undoContent(): Promise<string | null> {
    if (this.contentIndex <= 0) {
      return null;
    }
    
    this.contentIndex--;
    return this.contentHistory[this.contentIndex];
  }
  
  /**
   * Redo to next content state
   */
  async redoContent(): Promise<string | null> {
    if (this.contentIndex >= this.contentHistory.length - 1) {
      return null;
    }
    
    this.contentIndex++;
    return this.contentHistory[this.contentIndex];
  }

  /**
   * Get history for debugging
   */
  getHistory(): readonly AnyEditorCommand[] {
    return [...this.history];
  }
}
