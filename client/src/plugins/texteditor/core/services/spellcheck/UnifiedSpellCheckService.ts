/**
 * Unified Spell Check Service
 * 
 * Consolidates SpellCheckService + ServerSpellCheckService
 * into a single comprehensive spell checking service.
 */

import {
  SpellCheckConfig,
  SpellError,
  SpellCheckResult,
  Language,
  SpellCheckEvents
} from '../../types/spellCheckTypes';
import { IUnifiedSpellCheckService } from '../UnifiedServiceInterfaces';
import { SpellCheckEngine } from './SpellCheckEngine';
import { ZeroDictionarySpellChecker } from './ZeroDictionarySpellChecker';
import { Disposable, LifecycleManager } from '../../lifecycle/LifecycleManager';

export class UnifiedSpellCheckService implements IUnifiedSpellCheckService, Disposable {
  private config: SpellCheckConfig;
  private events: Partial<SpellCheckEvents> = {};
  private cache = new Map<string, SpellCheckResult | boolean>();
  private readonly MAX_CACHE_SIZE = 10000;
  private spellCheckEngine: SpellCheckEngine;
  public sessionStartTime: number;

  private zeroDictionaryChecker: ZeroDictionarySpellChecker;

  constructor() {
    // Always start fresh session time
    this.sessionStartTime = Date.now();
    this.config = {
      enabled: true,
      languages: ['en', 'ru'],
      autoDetect: true,
      customDictionary: true,
      autoCorrect: false,
      checkGrammar: false,
      debounceDelay: 500
    };
    
    // Use singleton ZeroDictionarySpellChecker instance
    this.zeroDictionaryChecker = ZeroDictionarySpellChecker.getInstance();
    this.spellCheckEngine = new SpellCheckEngine(this.zeroDictionaryChecker);
    
    // Register with lifecycle manager
    const lifecycleManager = LifecycleManager.getInstance();
    lifecycleManager.register(this);
  }

  async initialize(config?: Partial<SpellCheckConfig>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (!this.isBrowserSupported()) {
      console.warn('SpellCheck: Browser does not support native spell checking');
      return;
    }

    // Zero-dictionary system requires no initialization
  }

  // Client-side spell checking methods
  
  async checkText(text: string, language?: Language): Promise<SpellCheckResult> {
    console.log(`🔧 UnifiedSpellCheckService: checkText called with '${text}'`);
    const cacheKey = `text-${text}-${language || 'auto'}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as SpellCheckResult;
    }

    const result = await this.spellCheckEngine.checkText(text, language);
    this.cacheResult(cacheKey, result);
    
    return result;
  }

  async getSuggestions(word: string, language: Language): Promise<string[]> {
    return this.spellCheckEngine.getSuggestions(word, language);
  }

  enableSpellCheck(element: HTMLElement, language?: Language): void {
    if (!this.config.enabled) return;

    element.setAttribute('spellcheck', 'true');
    
    if (language) {
      const langCode = language === 'en' ? 'en-US' : 'ru-RU';
      element.setAttribute('lang', langCode);
    }

    this.addErrorHighlighting(element);
  }

  disableSpellCheck(element: HTMLElement): void {
    element.setAttribute('spellcheck', 'false');
    element.removeAttribute('lang');
    this.removeErrorHighlighting(element);
  }

  // Server-side spell checking methods
  
  async isWordCorrect(word: string, _language: Language = 'ru'): Promise<boolean> {
    // Use zero-dictionary approach for better performance
    return this.zeroDictionaryChecker.checkWord(word);
  }

  async batchCheck(words: string[], language: Language = 'ru', _fullText?: string): Promise<boolean[]> {
    const uncachedWords: string[] = [];
    const results: boolean[] = [];
    const wordIndexMap = new Map<string, number[]>();

    words.forEach((word, index) => {
      const cacheKey = `word-${word.toLowerCase()}-${language}`;
      if (this.cache.has(cacheKey)) {
        results[index] = this.cache.get(cacheKey) as boolean;
      } else {
        const normalizedWord = word.toLowerCase();
        if (!wordIndexMap.has(normalizedWord)) {
          wordIndexMap.set(normalizedWord, []);
          uncachedWords.push(word);
        }
        wordIndexMap.get(normalizedWord)!.push(index);
      }
    });

    if (uncachedWords.length > 0) {
      for (const word of uncachedWords) {
        const normalizedWord = word.toLowerCase();
        const cacheKey = `word-${normalizedWord}-${language}`;
        
        const isCorrect = await this.zeroDictionaryChecker.checkWord(word);
        this.cacheResult(cacheKey, isCorrect);
        
        const indices = wordIndexMap.get(normalizedWord) || [];
        indices.forEach(originalIndex => {
          results[originalIndex] = isCorrect;
        });
      }
    }

    return results;
  }

  async getStats(): Promise<any> {
    // Get stats from zero-dictionary system
    const zeroStats = this.zeroDictionaryChecker.getStats();
    

    
    return {
      russian: {
        loaded: zeroStats.cache.size > 0,
        words: zeroStats.cache.size,
        size: zeroStats.cache.memoryUsage,
        partitions: 0, // No partitions in zero-dictionary
        lastAccessed: Date.now(),
        loadedDictionaries: [], // No dictionaries loaded
        // Zero-dictionary stats
        zeroDictionary: {
          enabled: true,
          cacheSize: zeroStats.cache.size,
          memoryUsage: zeroStats.cache.memoryUsage,
          hitRate: zeroStats.performance.hitRate,
          apiRequests: zeroStats.performance.requests,
          cacheHits: zeroStats.performance.cacheHits,
          predictive: zeroStats.predictive
        }
      },
      english: {
        loaded: false,
        words: 0,
        size: 0,
        partitions: 0,
        loadedDictionaries: []
      },
      cache: {
        size: this.cache.size + zeroStats.cache.size,
        maxSize: this.MAX_CACHE_SIZE,
        hitRate: zeroStats.performance.hitRate || 0
      },
      sessionStart: this.sessionStartTime
    };
  }

  // Configuration and cache management
  
  updateConfig(config: Partial<SpellCheckConfig>): void {
    this.config = { ...this.config, ...config };
  }

  clearCache(): void {
    this.cache.clear();
    
    // Clear zero-dictionary cache
    this.zeroDictionaryChecker.clearCache();
  }

  /**
   * Emergency memory cleanup
   */
  emergencyCleanup(): void {
    this.clearCache();
    
    // Clear DOM cache
    const { DOMCache } = require('../../../shared/utils/DOMCache');
    DOMCache.clearAll();
    

  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }

  // Learning and corrections
  
  learnCorrection(): void {
    // Implementation would store in local storage or send to server
  }

  getSuggestionStats(): any {
    return { 
      totalCorrections: 0, 
      englishCorrections: 0, 
      russianCorrections: 0, 
      mostFrequent: [] 
    };
  }

  clearLearnedCorrections(): void {
    // Clear learned corrections from storage
  }

  // Event handling
  
  on<K extends keyof SpellCheckEvents>(event: K, callback: SpellCheckEvents[K]): void {
    this.events[event] = callback;
  }

  off<K extends keyof SpellCheckEvents>(event: K): void {
    delete this.events[event];
  }

  // Lifecycle methods
  
  dispose(): void {
    // Unregister from lifecycle manager
    const lifecycleManager = LifecycleManager.getInstance();
    lifecycleManager.unregister(this);
    
    // Cleanup resources
    this.cache.clear();
    this.events = {};
    
    // Clear zero-dictionary cache
    this.zeroDictionaryChecker.clearCache();
  }
  
  destroy(): void {
    this.dispose();
  }
  
  /**
   * Get the ZeroDictionarySpellChecker instance for direct access
   */
  getZeroDictionaryChecker(): ZeroDictionarySpellChecker {
    return this.zeroDictionaryChecker;
  }

  // Private helper methods
  
  private isBrowserSupported(): boolean {
    const testElement = document.createElement('input');
    return 'spellcheck' in testElement;
  }

  private addErrorHighlighting(element: HTMLElement): void {
    element.classList.add('spell-check-enabled');
    element.addEventListener('input', this.handleInput.bind(this));
    element.addEventListener('contextmenu', this.handleContextMenu.bind(this));
  }

  private removeErrorHighlighting(element: HTMLElement): void {
    element.classList.remove('spell-check-enabled');
    element.removeEventListener('input', this.handleInput.bind(this));
    element.removeEventListener('contextmenu', this.handleContextMenu.bind(this));
  }

  private handleInput(event: Event): void {
    const element = event.target as HTMLElement;
    const text = element.textContent || '';
    
    clearTimeout((element as any).spellCheckTimeout);
    (element as any).spellCheckTimeout = setTimeout(async () => {
      const result = await this.checkText(text);
      this.highlightErrors(element, result.errors);
    }, this.config.debounceDelay);
  }

  private handleContextMenu(): void {
    // Handle context menu for spell check suggestions
  }

  private highlightErrors(element: HTMLElement, errors: SpellError[]): void {
    element.setAttribute('data-spell-errors', JSON.stringify(errors));
    
    const event = new CustomEvent('spellcheck-errors', { 
      detail: { errors },
      bubbles: true 
    });
    element.dispatchEvent(event);
  }

  private cacheResult(key: string, result: SpellCheckResult | boolean): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, result);
  }
}
