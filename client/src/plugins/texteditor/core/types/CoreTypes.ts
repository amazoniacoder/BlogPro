/**
 * Core Types
 * 
 * Consolidated core type definitions and event system types for the text editor.
 */

// Core type definitions
export type FontSize = '8pt' | '10pt' | '12pt' | '14pt' | '18pt' | '24pt' | '36pt';
export type FontFamily = 'Arial' | 'Helvetica' | 'Times New Roman' | 'Georgia' | 'Verdana' | 'Roboto' | 'Courier New';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface SelectionState {
  readonly start: number;
  readonly end: number;
  readonly isCollapsed: boolean;
  readonly anchorNode: Node | null;
  readonly focusNode: Node | null;
  readonly direction: 'forward' | 'backward' | 'none';
}

export interface FormatState {
  readonly bold: boolean;
  readonly italic: boolean;
  readonly underline: boolean;
  readonly fontSize: FontSize;
  readonly fontFamily: FontFamily;
  readonly textAlign: TextAlign;
  readonly textColor?: string;
  readonly backgroundColor?: string;
  readonly listState?: {
    readonly isInList: boolean;
    readonly listType: 'bullet' | 'numbered' | null;
    readonly nestingLevel: number;
  };
}

export interface DocumentContent {
  readonly html: string;
  readonly text: string;
  readonly wordCount: number;
  readonly characterCount: number;
}

export interface HistoryState {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly currentIndex: number;
  readonly maxSize: number;
}

export interface EditorState {
  readonly content: DocumentContent;
  readonly selection: SelectionState;
  readonly format: FormatState;
  readonly history: HistoryState;
  readonly isReadOnly: boolean;
  readonly isDirty: boolean;
}

// Event system types
export type EditorEventType = 
  | 'format-change'
  | 'selection-change'
  | 'content-change'
  | 'key-press'
  | 'paste'
  | 'cut'
  | 'copy'
  | 'undo'
  | 'redo'
  | 'save';

export type EventSource = 'keyboard' | 'mouse' | 'toolbar' | 'api' | 'paste';

export interface EditorEvent<TData = unknown> {
  readonly type: EditorEventType;
  readonly data: TData;
  readonly timestamp: number;
  readonly source: EventSource;
  preventDefault(): void;
  stopPropagation(): void;
}

export interface ContentChangeData {
  readonly previousContent: DocumentContent;
  readonly newContent: DocumentContent;
  readonly changeType: 'insert' | 'delete' | 'replace' | 'format';
}

export interface FormatChangeData {
  readonly previousFormat: FormatState;
  readonly newFormat: FormatState;
  readonly affectedRange: SelectionState;
}

export interface SelectionChangeData {
  readonly previousSelection: SelectionState;
  readonly newSelection: SelectionState;
}

export interface KeyPressData {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
  readonly metaKey: boolean;
}

export type EditorEventHandler<TData = unknown> = (event: EditorEvent<TData>) => void;
