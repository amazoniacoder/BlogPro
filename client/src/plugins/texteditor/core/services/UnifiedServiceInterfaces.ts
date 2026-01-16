/**
 * Unified Service Interfaces
 * 
 * Consolidated interfaces for the unified services after consolidation.
 * Combines overlapping service interfaces into cohesive contracts.
 */

import { FormatState } from '../types/CoreTypes';
import { SpellCheckResult, Language } from '../types/spellCheckTypes';

export interface IBaseService {
  initialize?(): Promise<void>;
  destroy(): void;  // Make mandatory for memory cleanup
  getConfig?(): any;
}

/**
 * Unified Format Service Interface
 * Consolidates TextFormatService + ModernFormatService + SimpleCursorFix
 */
export interface IUnifiedFormatService extends IBaseService {
  // Text formatting (from TextFormatService)
  applyBold(): void;
  applyItalic(): void;
  applyUnderline(): void;
  
  // Cursor management (from SimpleCursorFix)
  handleSpace(): boolean;
  handleEnter(): boolean;
  
  // Format orchestration (from ModernFormatService)
  getFormatState(): FormatState;
  insertText(text: string): void;
  applyFontSize(fontSize: string): void;
  applyFontFamily(fontFamily: string): void;
  applyTextAlign(textAlign: string): void;
  applyTextColor(color: string): void;
  applyBackgroundColor(color: string): void;
  
  // List operations
  applyBulletList(): void;
  applyNumberedList(): void;
  removeList(): void;
  increaseListNesting(): void;
  decreaseListNesting(): void;
  
  // Link operations
  applyLink(linkData: any): void;
  editLink(linkData: any): void;
  removeLink(): void;
  
  // Media operations
  insertImage(imageData: any): void;
}

/**
 * Unified Text Analysis Service Interface
 * Consolidates TextAnalysisService + SyntaxAnalyzer + EnhancedSyntaxAnalyzer
 */
export interface IUnifiedTextAnalysisService extends IBaseService {
  // Basic analysis
  analyzeText(content: string, options?: any): any;
  getWordCount(content: string, options?: any): number;
  getCharacterCount(content: string, includeSpaces?: boolean, includeHtml?: boolean): number;
  getReadingTime(content: string, readingSpeed?: number): number;
  getParagraphCount(content: string, includeHtml?: boolean): number;
  getSentenceCount(content: string, options?: any): number;
  
  // Syntax analysis
  parseSentence(sentence: string): any;
  checkSyntax(text: string): any[];
  
  // Cache management
  clearCache(): void;
  getCacheStats(): { size: number; maxSize: number };
}

/**
 * Unified Spell Check Service Interface
 * Consolidates SpellCheckService + ServerSpellCheckService
 */
export interface IUnifiedSpellCheckService extends IBaseService {
  // Client-side methods
  checkText(text: string, language?: Language): Promise<SpellCheckResult>;
  getSuggestions(word: string, language: Language): Promise<string[]>;
  enableSpellCheck(element: HTMLElement, language?: Language): void;
  disableSpellCheck(element: HTMLElement): void;
  
  // Server integration
  isWordCorrect(word: string, language?: Language): Promise<boolean>;
  batchCheck(words: string[], language?: Language, fullText?: string): Promise<boolean[]>;
  getStats(): Promise<any>;
  
  // Configuration and cache
  updateConfig(config: any): void;
  clearCache(): void;
  getCacheStats(): { size: number; maxSize: number };
  
  // Learning and corrections
  learnCorrection(original: string, correction: string, language: Language): void;
  getSuggestionStats(): any;
  clearLearnedCorrections(): void;
  
  // Direct access to internal components
  getZeroDictionaryChecker?(): any;
  sessionStartTime?: number;
}

/**
 * Keep existing interfaces for services that don't need consolidation
 */
export interface IFontFormatService extends IBaseService {
  applyFontSize(fontSize: string): void;
  applyFontFamily(fontFamily: string): void;
  getFontSize(element: Element): string;
  getFontFamily(element: Element): string;
}

export interface ILayoutFormatService extends IBaseService {
  applyTextAlign(textAlign: string): void;
  applyTextColor(color: string): void;
  applyBackgroundColor(color: string): void;
  getTextAlign(element: Element): string;
  getTextColor(element: Element): string;
  getBackgroundColor(element: Element): string;
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

export interface IHistoryService {
  execute(command: any): Promise<void>;
  undo(): Promise<boolean>;
  redo(): Promise<boolean>;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
  saveState(content: string): void;
  [key: string]: any;
}

export interface IGrammarCheckService extends IBaseService {
  checkGrammar(text: string, language?: string): Promise<any>;
}

export interface IAutoSaveService {
  updateContent(content: string): void;
  manualSave(): Promise<boolean>;
  getStatus(): any;
  [key: string]: any;
}

export interface IPerformanceService {
  [key: string]: any;
}
