/**
 * System Types
 * 
 * Consolidated command pattern types and error handling for editor operations.
 */

import { FormatState, SelectionState } from './CoreTypes';

// Command pattern types
export interface EditorCommand {
  readonly id: string;
  readonly type: EditorCommandType;
  readonly timestamp: number;
  execute(): Promise<void>;
  undo(): Promise<void>;
  canExecute(): boolean;
  canUndo(): boolean;
}

export type EditorCommandType = 
  | 'format'
  | 'insert'
  | 'delete'
  | 'replace'
  | 'paste'
  | 'cut'
  | 'copy';

export interface FormatCommand extends EditorCommand {
  readonly type: 'format';
  readonly formatType: keyof FormatState;
  readonly value: FormatState[keyof FormatState];
  readonly range: SelectionState;
}

export interface InsertCommand extends EditorCommand {
  readonly type: 'insert';
  readonly content: string;
  readonly position: number;
}

export interface DeleteCommand extends EditorCommand {
  readonly type: 'delete';
  readonly range: SelectionState;
  readonly deletedContent: string;
}

export interface ReplaceCommand extends EditorCommand {
  readonly type: 'replace';
  readonly range: SelectionState;
  readonly oldContent: string;
  readonly newContent: string;
}

export type AnyEditorCommand = 
  | FormatCommand
  | InsertCommand
  | DeleteCommand
  | ReplaceCommand;

// Error handling types
export abstract class EditorError extends Error {
  abstract readonly code: string;
  abstract readonly severity: 'low' | 'medium' | 'high' | 'critical';

  constructor(
    message: string,
    public readonly context: Record<string, unknown> = {},
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class FormatError extends EditorError {
  readonly code = 'FORMAT_ERROR';
  readonly severity = 'medium';
}

export class SecurityError extends EditorError {
  readonly code = 'SECURITY_ERROR';
  readonly severity = 'critical';
}

export class ValidationError extends EditorError {
  readonly code = 'VALIDATION_ERROR';
  readonly severity = 'high';
}

export class PerformanceError extends EditorError {
  readonly code = 'PERFORMANCE_ERROR';
  readonly severity = 'medium';
}

export class BoundaryError extends EditorError {
  readonly code = 'BOUNDARY_ERROR';
  readonly severity = 'medium';
}

export class SelectionError extends EditorError {
  readonly code = 'SELECTION_ERROR';
  readonly severity = 'low';
}

export class DOMError extends EditorError {
  readonly code = 'DOM_ERROR';
  readonly severity = 'high';
}
