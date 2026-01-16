/**
 * Language Types
 * 
 * Consolidated grammar and morphology type definitions for language processing.
 */

// Grammar types
export type GrammarErrorType = 'punctuation' | 'syntax' | 'agreement' | 'style' | 'orthography';
export type GrammarErrorSubtype = 
  | 'comma' | 'quotes' | 'capitalization' | 'dash'
  | 'word_order' | 'subject_verb' | 'case_agreement'
  | 'gender_agreement' | 'number_agreement' | 'verb_aspect'
  | 'participle_agreement' | 'dependency_error' | 'clause_structure'
  | 'completeness' | 'repetition' | 'style_consistency'
  | 'spelling' | 'prefix' | 'suffix' | 'soft_sign' | 'double_consonants';

export type GrammarSeverity = 'error' | 'warning' | 'suggestion';

export interface GrammarRule {
  id: string;
  type: GrammarErrorType;
  subtype?: GrammarErrorSubtype;
  description: string;
  explanation: string;
  examples: {
    wrong: string;
    correct: string;
  }[];
  severity: GrammarSeverity;
  confidence: number;
  enabled: boolean;
  check(text: string): GrammarError[];
}

export interface GrammarError {
  id: string;
  ruleId: string;
  type: GrammarErrorType;
  subtype?: GrammarErrorSubtype;
  severity: GrammarSeverity;
  message: string;
  explanation: string;
  start: number;
  end: number;
  text: string;
  suggestions: string[];
  confidence: number;
  context: string;
}

export interface GrammarResult {
  errors: GrammarError[];
  suggestions: GrammarSuggestion[];
  confidence: number;
  processedAt: Date;
  language: 'ru';
  statistics: {
    totalRulesChecked: number;
    errorsFound: number;
    warningsFound: number;
    suggestionsFound: number;
  };
}

export interface GrammarSuggestion {
  errorId: string;
  text: string;
  confidence: number;
  explanation: string;
}

// Morphology types
export type Case = 'nominative' | 'genitive' | 'dative' | 'accusative' | 'instrumental' | 'prepositional';
export type Gender = 'masculine' | 'feminine' | 'neuter';
export type Number = 'singular' | 'plural';
export type Person = 'first' | 'second' | 'third';
export type Tense = 'present' | 'past' | 'future';
export type Aspect = 'perfective' | 'imperfective';
export type Voice = 'active' | 'passive';
export type Mood = 'indicative' | 'imperative' | 'conditional';

export type PartOfSpeech = 
  | 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' 
  | 'preposition' | 'conjunction' | 'particle' | 'interjection'
  | 'numeral' | 'participle' | 'gerund';

export interface MorphologicalInfo {
  lemma: string;
  partOfSpeech: PartOfSpeech;
  case?: Case;
  gender?: Gender;
  number?: Number;
  person?: Person;
  tense?: Tense;
  aspect?: Aspect;
  voice?: Voice;
  mood?: Mood;
  animacy?: 'animate' | 'inanimate';
  confidence: number;
}

export interface WordForm {
  word: string;
  lemma: string;
  morphology: MorphologicalInfo;
  frequency?: number;
}

export interface AgreementRule {
  id: string;
  description: string;
  primaryWord: PartOfSpeech;
  dependentWord: PartOfSpeech;
  agreementFeatures: (keyof MorphologicalInfo)[];
  exceptions?: string[];
}

export interface CaseGovernmentRule {
  id: string;
  governor: string;
  governorType: 'preposition' | 'verb';
  requiredCase: Case;
  description: string;
  examples: string[];
}

export interface MorphologyError {
  type: 'case_agreement' | 'gender_agreement' | 'number_agreement' | 'case_government' | 'verb_aspect';
  word1: string;
  word2?: string;
  expected: Partial<MorphologicalInfo>;
  actual: Partial<MorphologicalInfo>;
  suggestion: string;
  confidence: number;
}
