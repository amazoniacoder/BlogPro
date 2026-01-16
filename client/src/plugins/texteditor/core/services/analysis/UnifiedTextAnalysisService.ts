/**
 * Unified Text Analysis Service
 * 
 * Consolidates text analysis, syntax analysis, and enhanced syntax analysis
 * into a single, comprehensive service with pluggable analyzers.
 */

import { GrammarError } from '../../types/LanguageTypes';

// Core interfaces
export interface TextAnalysisResult {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
  sentences: number;
  readingTime: number;
  averageWordsPerSentence: number;
  averageSentencesPerParagraph: number;
}

export interface AnalysisOptions {
  readingSpeed?: number;
  includeHtml?: boolean;
  minWordsPerSentence?: number;
  wordSeparators?: RegExp;
  sentenceSeparators?: RegExp;
}

export interface Word {
  text: string;
  position: number;
  partOfSpeech?: PartOfSpeech;
  lemma?: string;
  features?: WordFeatures;
}

export interface WordFeatures {
  case?: Case;
  gender?: Gender;
  number?: Number;
  person?: Person;
  tense?: Tense;
  aspect?: Aspect;
}

export interface SentenceStructure {
  subject: Word[];
  predicate: Word[];
  objects: Word[];
  modifiers: Word[];
  clauses: Clause[];
  conjunctions: Word[];
}

export interface Clause {
  type: 'main' | 'subordinate' | 'relative';
  words: Word[];
  conjunction?: Word;
}

export type PartOfSpeech = 
  | 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' 
  | 'preposition' | 'conjunction' | 'particle' | 'interjection'
  | 'numeral' | 'participle' | 'gerund';

export type Case = 'nominative' | 'genitive' | 'dative' | 'accusative' | 'instrumental' | 'prepositional';
export type Gender = 'masculine' | 'feminine' | 'neuter';
export type Number = 'singular' | 'plural';
export type Person = 'first' | 'second' | 'third';
export type Tense = 'present' | 'past' | 'future';
export type Aspect = 'perfective' | 'imperfective';

export class UnifiedTextAnalysisService {
  private static readonly DEFAULT_READING_SPEED = 200;
  private static readonly DEFAULT_SENTENCE_SEPARATORS = /[.!?]+/;
  private static readonly MIN_WORDS_PER_SENTENCE = 1;
  
  // Cache for performance
  private static analysisCache = new Map<string, TextAnalysisResult>();
  private static readonly MAX_CACHE_SIZE = 100;
  
  // Russian word dictionary
  private static russianWords: Map<string, PartOfSpeech> = new Map();
  private static conjunctions = new Set(['и', 'а', 'но', 'что', 'чтобы', 'когда', 'если', 'хотя', 'потому что', 'так как']);
  private static prepositions = new Set(['в', 'на', 'с', 'к', 'от', 'до', 'для', 'без', 'под', 'над', 'за', 'перед', 'после']);

  static {
    this.initializeBasicDictionary();
  }

  /**
   * Comprehensive text analysis
   */
  static analyzeText(content: string, options: AnalysisOptions = {}): TextAnalysisResult {
    const cacheKey = this.generateCacheKey(content, options);
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    const result = this.performAnalysis(content, options);
    this.cacheResult(cacheKey, result);
    
    return result;
  }

  /**
   * Parse sentence structure
   */
  static parseSentence(sentence: string): SentenceStructure {
    const words = this.tokenize(sentence);
    const classifiedWords = words.map(word => this.classifyWord(word));
    
    return {
      subject: this.findSubjects(classifiedWords),
      predicate: this.findPredicates(classifiedWords),
      objects: this.findObjects(classifiedWords),
      modifiers: this.findModifiers(classifiedWords),
      clauses: this.findClauses(classifiedWords),
      conjunctions: this.findConjunctions(classifiedWords)
    };
  }

  /**
   * Check syntax with comprehensive analysis
   */
  static checkSyntax(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    const sentences = this.splitIntoSentences(text);
    
    for (const sentence of sentences) {
      const structure = this.parseSentence(sentence.text);
      
      // Check subject-verb agreement
      const agreementErrors = this.checkSubjectVerbAgreement(structure, sentence.start);
      errors.push(...agreementErrors);
      
      // Check sentence completeness (conservative approach)
      const completenessErrors = this.checkSentenceCompleteness(structure, sentence);
      errors.push(...completenessErrors);
    }
    
    return errors;
  }

  /**
   * Get word count
   */
  static getWordCount(content: string, options: AnalysisOptions = {}): number {
    const plainText = options.includeHtml ? content : this.stripHtml(content);
    if (plainText.trim() === '') return 0;
    
    const wordMatches = plainText.match(/[\p{L}\p{N}]{2,}/gu);
    return wordMatches ? wordMatches.length : 0;
  }

  /**
   * Get character count
   */
  static getCharacterCount(content: string, includeSpaces: boolean = true, includeHtml: boolean = false): number {
    const text = includeHtml ? content : this.stripHtml(content);
    return includeSpaces ? text.length : text.replace(/\s/g, '').length;
  }

  /**
   * Estimate reading time
   */
  static getReadingTime(content: string, readingSpeed: number = this.DEFAULT_READING_SPEED): number {
    const wordCount = this.getWordCount(content);
    return Math.ceil(wordCount / readingSpeed);
  }

  /**
   * Get paragraph count
   */
  static getParagraphCount(content: string, includeHtml: boolean = false): number {
    const text = includeHtml ? content : this.stripHtml(content);
    if (text.trim() === '') return 0;
    
    const paragraphs = includeHtml 
      ? text.split(/<\/p>|<br\s*\/?>[\s]*<br\s*\/?>|\n\s*\n/).filter(p => p.trim().length > 0)
      : text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return paragraphs.length;
  }

  /**
   * Get sentence count
   */
  static getSentenceCount(content: string, options: AnalysisOptions = {}): number {
    const plainText = options.includeHtml ? content : this.stripHtml(content);
    const separators = options.sentenceSeparators || this.DEFAULT_SENTENCE_SEPARATORS;
    const minWords = options.minWordsPerSentence || this.MIN_WORDS_PER_SENTENCE;
    
    if (plainText.trim() === '') return 0;
    
    const sentences = plainText.split(separators)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter(s => this.getWordCount(s) >= minWords);
    
    return sentences.length;
  }

  /**
   * Clear analysis cache
   */
  static clearCache(): void {
    this.analysisCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.analysisCache.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }

  // Private methods
  private static performAnalysis(content: string, options: AnalysisOptions): TextAnalysisResult {
    const readingSpeed = options.readingSpeed || this.DEFAULT_READING_SPEED;
    
    const words = this.getWordCount(content, options);
    const characters = this.getCharacterCount(content, true, options.includeHtml);
    const charactersNoSpaces = this.getCharacterCount(content, false, options.includeHtml);
    const paragraphs = this.getParagraphCount(content, options.includeHtml);
    const sentences = this.getSentenceCount(content, options);
    const readingTime = Math.ceil(words / readingSpeed);
    
    const averageWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;
    const averageSentencesPerParagraph = paragraphs > 0 ? Math.round((sentences / paragraphs) * 10) / 10 : 0;
    
    return {
      words,
      characters,
      charactersNoSpaces,
      paragraphs,
      sentences,
      readingTime,
      averageWordsPerSentence,
      averageSentencesPerParagraph
    };
  }

  private static stripHtml(content: string): string {
    return content
      .replace(/<p[^>]*>\s*<\/p>/gi, ' ')
      .replace(/<(?:div|p|h[1-6]|li|ul|ol|blockquote|pre|section|article|header|footer|main|aside)\b[^>]*>/gi, ' ')
      .replace(/<\/(?:div|p|h[1-6]|li|ul|ol|blockquote|pre|section|article|header|footer|main|aside)>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static tokenize(sentence: string): Word[] {
    const words: Word[] = [];
    const tokens = sentence.match(/[а-яёa-z]+/gi) || [];
    let position = 0;
    
    for (const token of tokens) {
      const index = sentence.indexOf(token, position);
      words.push({
        text: token,
        position: index
      });
      position = index + token.length;
    }
    
    return words;
  }

  private static classifyWord(word: Word): Word {
    const partOfSpeech = this.getPartOfSpeech(word.text.toLowerCase());
    return {
      ...word,
      partOfSpeech,
      features: this.analyzeWordFeatures(word.text, partOfSpeech)
    };
  }

  private static getPartOfSpeech(word: string): PartOfSpeech {
    if (this.russianWords.has(word)) {
      return this.russianWords.get(word)!;
    }
    
    if (this.conjunctions.has(word)) return 'conjunction';
    if (this.prepositions.has(word)) return 'preposition';
    
    if (word.match(/(ет|ит|ут|ют|ать|ить|еть)$/)) return 'verb';
    if (word.match(/(ый|ий|ой|ая|яя|ое|ее|ые|ие)$/)) return 'adjective';
    if (word.match(/(о|е)$/)) return 'adverb';
    
    return 'noun';
  }

  private static analyzeWordFeatures(word: string, partOfSpeech: PartOfSpeech): WordFeatures {
    const features: WordFeatures = {};
    
    if (partOfSpeech === 'noun' || partOfSpeech === 'adjective') {
      if (word.match(/(а|я)$/)) features.gender = 'feminine';
      else if (word.match(/(о|е)$/)) features.gender = 'neuter';
      else features.gender = 'masculine';
      
      if (word.match(/(ы|и|а|я)$/)) features.number = 'plural';
      else features.number = 'singular';
    }
    
    if (partOfSpeech === 'verb') {
      if (word.match(/(л|ла|ло|ли)$/)) features.tense = 'past';
      else if (word.match(/(ет|ит|ут|ют)$/)) features.tense = 'present';
      else features.tense = 'future';
    }
    
    return features;
  }

  private static findSubjects(words: Word[]): Word[] {
    return words.filter(word => 
      word.partOfSpeech === 'noun' || word.partOfSpeech === 'pronoun'
    );
  }

  private static findPredicates(words: Word[]): Word[] {
    return words.filter(word => word.partOfSpeech === 'verb');
  }

  private static findObjects(words: Word[]): Word[] {
    return words.filter(word => 
      word.partOfSpeech === 'noun' && 
      word.features?.case && 
      word.features.case !== 'nominative'
    );
  }

  private static findModifiers(words: Word[]): Word[] {
    return words.filter(word => 
      word.partOfSpeech === 'adjective' || word.partOfSpeech === 'adverb'
    );
  }

  private static findClauses(words: Word[]): Clause[] {
    const clauses: Clause[] = [];
    const conjunctionWords = words.filter(word => word.partOfSpeech === 'conjunction');
    
    if (conjunctionWords.length === 0) {
      clauses.push({
        type: 'main',
        words: words
      });
    } else {
      let currentClause: Word[] = [];
      
      for (const word of words) {
        if (word.partOfSpeech === 'conjunction') {
          if (currentClause.length > 0) {
            clauses.push({
              type: 'main',
              words: currentClause
            });
            currentClause = [];
          }
        } else {
          currentClause.push(word);
        }
      }
      
      if (currentClause.length > 0) {
        clauses.push({
          type: 'subordinate',
          words: currentClause
        });
      }
    }
    
    return clauses;
  }

  private static findConjunctions(words: Word[]): Word[] {
    return words.filter(word => word.partOfSpeech === 'conjunction');
  }

  private static checkSubjectVerbAgreement(structure: SentenceStructure, offset: number): GrammarError[] {
    const errors: GrammarError[] = [];
    
    for (const subject of structure.subject) {
      for (const predicate of structure.predicate) {
        if (!this.checkAgreement(subject, predicate)) {
          errors.push({
            id: `agreement_${Date.now()}`,
            ruleId: 'subject_verb_agreement',
            type: 'syntax',
            subtype: 'subject_verb',
            severity: 'error',
            message: 'Несогласованность подлежащего и сказуемого',
            explanation: 'Подлежащее и сказуемое должны согласовываться в числе',
            start: offset + Math.min(subject.position, predicate.position),
            end: offset + Math.max(subject.position + subject.text.length, predicate.position + predicate.text.length),
            text: `${subject.text} ... ${predicate.text}`,
            suggestions: [],
            confidence: 0.7,
            context: `${subject.text} ... ${predicate.text}`
          });
        }
      }
    }
    
    return errors;
  }

  private static checkAgreement(subject: Word, verb: Word): boolean {
    if (!subject.features || !verb.features) {
      return true;
    }

    if (subject.features.number && verb.features.number) {
      return subject.features.number === verb.features.number;
    }

    return true;
  }

  private static checkSentenceCompleteness(structure: SentenceStructure, sentence: {text: string, start: number, end: number}): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Conservative approach - only flag very obvious incomplete sentences
    if (sentence.text.length > 30 && structure.predicate.length === 0 && structure.subject.length > 2) {
      const hasConjunctions = structure.conjunctions.length > 0;
      const hasQuestionWords = /^(что|как|где|когда|почему|зачем)/i.test(sentence.text);
      
      if (hasConjunctions || hasQuestionWords) {
        errors.push({
          id: `missing_predicate_${Date.now()}`,
          ruleId: 'sentence_completeness',
          type: 'syntax',
          subtype: 'completeness',
          severity: 'suggestion',
          message: 'Возможно, предложение не завершено',
          explanation: 'Проверьте, не отсутствует ли сказуемое',
          start: sentence.start,
          end: sentence.end,
          text: sentence.text,
          suggestions: [],
          confidence: 0.4,
          context: sentence.text
        });
      }
    }
    
    return errors;
  }

  private static splitIntoSentences(text: string): Array<{text: string, start: number, end: number}> {
    const sentences: Array<{text: string, start: number, end: number}> = [];
    const sentenceRegex = /[.!?]+\s*(?=[А-ЯЁ]|$)/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = sentenceRegex.exec(text)) !== null) {
      const sentenceEnd = match.index + match[0].length;
      const sentenceText = text.substring(lastIndex, sentenceEnd).trim();
      
      if (sentenceText.length > 0) {
        sentences.push({
          text: sentenceText,
          start: lastIndex,
          end: sentenceEnd
        });
      }
      
      lastIndex = sentenceEnd;
    }
    
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex).trim();
      if (remainingText.length > 0) {
        sentences.push({
          text: remainingText,
          start: lastIndex,
          end: text.length
        });
      }
    }
    
    return sentences;
  }

  private static generateCacheKey(content: string, options: AnalysisOptions): string {
    const optionsStr = JSON.stringify(options);
    return `${content.length}-${this.hashString(content + optionsStr)}`;
  }

  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private static cacheResult(key: string, result: TextAnalysisResult): void {
    if (this.analysisCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.analysisCache.keys().next().value;
      if (firstKey) {
        this.analysisCache.delete(firstKey);
      }
    }
    
    this.analysisCache.set(key, result);
  }

  private static initializeBasicDictionary(): void {
    const basicWords: [string, PartOfSpeech][] = [
      // Pronouns
      ['я', 'pronoun'], ['ты', 'pronoun'], ['он', 'pronoun'], ['она', 'pronoun'], ['оно', 'pronoun'],
      ['мы', 'pronoun'], ['вы', 'pronoun'], ['они', 'pronoun'],
      
      // Common verbs
      ['быть', 'verb'], ['есть', 'verb'], ['иметь', 'verb'], ['делать', 'verb'], ['говорить', 'verb'],
      ['идти', 'verb'], ['видеть', 'verb'], ['знать', 'verb'], ['думать', 'verb'], ['работать', 'verb'],
      
      // Common nouns
      ['дом', 'noun'], ['человек', 'noun'], ['время', 'noun'], ['рука', 'noun'], ['дело', 'noun'],
      ['жизнь', 'noun'], ['день', 'noun'], ['голова', 'noun'], ['вопрос', 'noun'], ['работа', 'noun'],
      
      // Common adjectives
      ['большой', 'adjective'], ['новый', 'adjective'], ['первый', 'adjective'], ['последний', 'adjective'],
      ['хороший', 'adjective'], ['плохой', 'adjective'], ['белый', 'adjective'], ['черный', 'adjective'],
      
      // Adverbs
      ['очень', 'adverb'], ['хорошо', 'adverb'], ['плохо', 'adverb'], ['быстро', 'adverb'], ['медленно', 'adverb']
    ];
    
    basicWords.forEach(([word, pos]) => {
      this.russianWords.set(word, pos);
    });
  }
}
