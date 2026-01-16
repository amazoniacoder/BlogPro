/**
 * Predictive Preloader
 * 
 * Intelligently preloads word validations based on usage patterns and context.
 */

import { UsageAnalytics } from '../analytics/UsageAnalytics';
import { WordResultCache } from './WordResultCache';

export class PredictivePreloader {
  private analytics = new UsageAnalytics();
  private preloadCache = new Map<string, boolean>();
  private isPreloading = false;
  
  constructor(
    private wordCache: WordResultCache,
    private validateWordsBatch: (words: string[]) => Promise<boolean[]>
  ) {}
  
  /**
   * Track word usage for analytics
   */
  trackWordUsage(word: string, context?: string[]): void {
    this.analytics.trackWordUsage(word, context);
  }
  
  /**
   * Preload frequently used words
   */
  async preloadFrequentWords(): Promise<void> {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    
    try {
      const topWords = this.analytics.getTopWords(200);
      const uncachedWords = topWords.filter(word => 
        !this.wordCache.has(word) && !this.preloadCache.has(word)
      );
      
      if (uncachedWords.length > 0) {
        console.log(`🔮 PredictivePreloader: Preloading ${uncachedWords.length} frequent words`);
        
        const results = await this.validateWordsBatch(uncachedWords);
        
        uncachedWords.forEach((word, index) => {
          this.preloadCache.set(word, results[index]);
          this.wordCache.set(word, results[index]);
        });
      }
    } catch (error) {
      console.warn('Predictive preloading failed:', error);
    } finally {
      this.isPreloading = false;
    }
  }
  
  /**
   * Preload contextual words based on current text
   */
  async preloadContextualWords(currentText: string): Promise<void> {
    if (this.isPreloading) return;
    
    const words = this.extractWords(currentText);
    if (words.length === 0) return;
    
    const lastWord = words[words.length - 1];
    const predictions = this.analytics.predictNextWords(lastWord, 10);
    
    const uncachedPredictions = predictions.filter(word => 
      !this.wordCache.has(word) && !this.preloadCache.has(word)
    );
    
    if (uncachedPredictions.length > 0) {
      console.log(`🔮 PredictivePreloader: Preloading ${uncachedPredictions.length} contextual words for '${lastWord}'`);
      
      // Preload in background without blocking
      this.validateWordsBatch(uncachedPredictions)
        .then(results => {
          uncachedPredictions.forEach((word, index) => {
            this.preloadCache.set(word, results[index]);
            this.wordCache.set(word, results[index]);
          });
        })
        .catch(error => {
          console.warn('Contextual preloading failed:', error);
        });
    }
  }
  
  /**
   * Preload words based on prefix patterns
   */
  async preloadPrefixPatterns(): Promise<void> {
    if (this.isPreloading) return;
    
    const topPrefixes = this.analytics.getTopPrefixes(5);
    const wordsToPreload: string[] = [];
    
    // Generate common words for top prefixes
    topPrefixes.forEach(prefix => {
      const commonWords = this.generateCommonWordsForPrefix(prefix);
      commonWords.forEach(word => {
        if (!this.wordCache.has(word) && !this.preloadCache.has(word)) {
          wordsToPreload.push(word);
        }
      });
    });
    
    if (wordsToPreload.length > 0) {
      console.log(`🔮 PredictivePreloader: Preloading ${wordsToPreload.length} prefix-based words`);
      
      try {
        const results = await this.validateWordsBatch(wordsToPreload);
        
        wordsToPreload.forEach((word, index) => {
          this.preloadCache.set(word, results[index]);
          this.wordCache.set(word, results[index]);
        });
      } catch (error) {
        console.warn('Prefix preloading failed:', error);
      }
    }
  }
  
  /**
   * Generate common words for a given prefix
   */
  private generateCommonWordsForPrefix(prefix: string): string[] {
    const commonWords: Record<string, string[]> = {
      'пр': ['привет', 'программа', 'проблема', 'принцип', 'процесс'],
      'ко': ['компьютер', 'команда', 'код', 'конец', 'корень'],
      'си': ['система', 'сила', 'синий', 'символ', 'сигнал'],
      'на': ['начало', 'название', 'направление', 'настройка', 'надо'],
      'по': ['пользователь', 'поиск', 'помощь', 'поле', 'порядок'],
      'ра': ['работа', 'развитие', 'размер', 'раздел', 'разное'],
      'да': ['данные', 'дата', 'дальше', 'давать', 'дача'],
      'ме': ['метод', 'место', 'между', 'мера', 'медленно'],
      'ин': ['информация', 'интернет', 'интерфейс', 'инструмент', 'индекс'],
      'об': ['объект', 'область', 'образ', 'общий', 'обычно']
    };
    
    return commonWords[prefix] || [];
  }
  
  /**
   * Extract words from text
   */
  private extractWords(text: string): string[] {
    return text.toLowerCase()
      .match(/[а-яё]+/g) || [];
  }
  
  /**
   * Get preloader statistics
   */
  getStats(): {
    analytics: any;
    preloadCache: { size: number; words: string[] };
    isPreloading: boolean;
  } {
    return {
      analytics: this.analytics.getUsageStats(),
      preloadCache: {
        size: this.preloadCache.size,
        words: Array.from(this.preloadCache.keys()).slice(0, 10) // Show first 10
      },
      isPreloading: this.isPreloading
    };
  }
  
  /**
   * Clear preload cache
   */
  clear(): void {
    this.preloadCache.clear();
    this.analytics.clear();
  }
}
