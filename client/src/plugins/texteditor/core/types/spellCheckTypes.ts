/**
 * Spell Check Types
 * 
 * Core type definitions for spell checking functionality
 * Supporting English and Russian languages
 * 
 * @author BlogPro Text Editor Team
 * @version 1.0.0
 */

export type Language = 'en' | 'ru';
export type ErrorType = 'spelling' | 'grammar';

export interface SpellCheckConfig {
  enabled: boolean;
  languages: Language[];
  autoDetect: boolean;
  customDictionary: boolean;
  autoCorrect: boolean;
  checkGrammar: boolean;
  debounceDelay: number;
}

export interface SpellError {
  word: string;
  start: number;
  end: number;
  type: ErrorType;
  suggestions: string[];
  language: Language;
  confidence: number;
}

export interface SpellCheckResult {
  errors: SpellError[];
  language: Language | 'mixed';
  confidence: number;
  processedAt: Date;
}

export interface DictionaryWord {
  id: string;
  word: string;
  language: Language;
  addedAt: Date;
  frequency: number;
}

export interface LanguageDetectionResult {
  language: Language | 'mixed';
  confidence: number;
  details: {
    cyrillicCount: number;
    latinCount: number;
    totalChars: number;
  };
}

export interface SuggestionOptions {
  maxSuggestions: number;
  minConfidence: number;
  includePhonetic: boolean;
  contextAware: boolean;
}

export interface SpellCheckEvents {
  onError: (error: SpellError) => void;
  onCorrection: (original: string, correction: string) => void;
  onDictionaryUpdate: (word: DictionaryWord) => void;
  onLanguageDetected: (result: LanguageDetectionResult) => void;
}

export interface AutoCorrectRule {
  from: string;
  to: string;
  language: Language;
  caseSensitive: boolean;
}

export interface GrammarRule {
  id: string;
  name: string;
  description: string;
  language: Language;
  pattern: RegExp;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
}

