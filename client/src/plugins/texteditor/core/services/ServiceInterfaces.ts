/**
 * Service Interfaces
 * 
 * Centralized service interface definitions for dependency injection.
 */

export interface IBaseService {
  initialize?(): Promise<void>;
  destroy?(): void;
  getConfig?(): any;
}

export interface ITextFormatService extends IBaseService {
  applyBold(): void;
  applyItalic(): void;
  applyUnderline(): void;
}

export interface IFontFormatService extends IBaseService {
  applyFontSize(fontSize: string): void;
  applyFontFamily(fontFamily: string): void;
}

export interface ILayoutFormatService extends IBaseService {
  applyTextAlign(textAlign: string): void;
  applyTextColor(color: string): void;
  applyBackgroundColor(color: string): void;
}

export interface ITextReplacementService extends IBaseService {
  replaceSpellError(errorElement: HTMLElement, replacementText: string): boolean;
  replaceTextInContext(targetNode: Node, startOffset: number, endOffset: number, replacementText: string): boolean;
}

export interface IDOMManipulationService extends IBaseService {
  wrapSelection(tagName: string): boolean;
  applyStyleToSelection(property: string, value: string): boolean;
  insertNodeAtSelection(node: Node): boolean;
  replaceElementWithText(element: HTMLElement, text: string): boolean;
  hasFormattingInHierarchy(element: Element, tagNames: string[]): boolean;
  hasStyleProperty(element: Element, property: string, values: string[]): boolean;
  getStyleFromHierarchy(element: Element, property: string, defaultValue?: string): string;
  createFormattedTextNode(text: string, formatting: { bold?: boolean; italic?: boolean; underline?: boolean }): Node;
}

export interface ISpellCheckService extends IBaseService {
  checkText(text: string, language?: any): Promise<any>;
  getSuggestions(word: string, language: any): Promise<string[]>;
  enableSpellCheck(element: HTMLElement, language?: any): void;
  disableSpellCheck(element: HTMLElement): void;
  updateConfig(config: any): void;
  clearCache(): void;
}

export interface ISearchService extends IBaseService {
  findAll(editorElement: HTMLElement, query: string, options: any): any[];
  findNext(): any;
  findPrevious(): any;
  replaceCurrent(replacement: string): boolean;
  replaceAll(editorElement: HTMLElement, query: string, replacement: string, options: any): number;
  clearSearch(editorElement: HTMLElement): void;
  getSearchStats(): { current: number; total: number; query: string };
}

export interface IHistoryService {
  execute(command: any): Promise<void>;
  undo(): Promise<boolean>;
  redo(): Promise<boolean>;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
  saveState(content: string): void;
  [key: string]: any; // Allow additional properties
}

export interface IGrammarCheckService extends IBaseService {
  checkGrammar(text: string, language?: string): Promise<any>;
}

export interface IAutoSaveService {
  updateContent(content: string): void;
  manualSave(): Promise<boolean>;
  getStatus(): any;
  [key: string]: any; // Allow additional properties
}

export interface IPerformanceService {
  [key: string]: any; // Flexible interface
}
