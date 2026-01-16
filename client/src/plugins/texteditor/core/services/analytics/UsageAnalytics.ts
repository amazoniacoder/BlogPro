/**
 * Usage Analytics System
 * 
 * Tracks word usage patterns, frequency, and context for predictive optimization.
 */

export interface WordPattern {
  word: string;
  frequency: number;
  lastUsed: number;
  contexts: string[]; // Words that appear before/after this word
}

export interface UsageStats {
  totalWords: number;
  uniqueWords: number;
  topWords: string[];
  topPrefixes: string[];
  sessionDuration: number;
}

export class UsageAnalytics {
  private wordFrequency = new Map<string, number>();
  private prefixFrequency = new Map<string, number>();
  private wordContexts = new Map<string, Set<string>>();
  private sessionPatterns: string[] = [];
  private sessionStart = Date.now();
  
  private readonly MAX_SESSION_PATTERNS = 1000;
  private readonly MAX_CONTEXTS_PER_WORD = 20;
  
  /**
   * Track word usage and build context patterns
   */
  trackWordUsage(word: string, context?: string[]): void {
    const normalizedWord = word.toLowerCase().trim();
    
    // Update word frequency
    const count = this.wordFrequency.get(normalizedWord) || 0;
    this.wordFrequency.set(normalizedWord, count + 1);
    
    // Update prefix frequency
    const prefix = normalizedWord.substring(0, 2);
    const prefixCount = this.prefixFrequency.get(prefix) || 0;
    this.prefixFrequency.set(prefix, prefixCount + 1);
    
    // Track context patterns
    if (context && context.length > 0) {
      if (!this.wordContexts.has(normalizedWord)) {
        this.wordContexts.set(normalizedWord, new Set());
      }
      
      const contexts = this.wordContexts.get(normalizedWord)!;
      context.forEach(contextWord => {
        if (contexts.size < this.MAX_CONTEXTS_PER_WORD) {
          contexts.add(contextWord.toLowerCase().trim());
        }
      });
    }
    
    // Update session patterns
    this.sessionPatterns.push(normalizedWord);
    if (this.sessionPatterns.length > this.MAX_SESSION_PATTERNS) {
      this.sessionPatterns = this.sessionPatterns.slice(-500);
    }
  }
  
  /**
   * Get most frequently used words
   */
  getTopWords(limit: number = 100): string[] {
    return Array.from(this.wordFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([word]) => word);
  }
  
  /**
   * Get most frequently used prefixes
   */
  getTopPrefixes(limit: number = 20): string[] {
    return Array.from(this.prefixFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([prefix]) => prefix);
  }
  
  /**
   * Predict next words based on current context
   */
  predictNextWords(currentWord: string, limit: number = 10): string[] {
    const normalizedWord = currentWord.toLowerCase().trim();
    const predictions: Map<string, number> = new Map();
    
    // Simple n-gram prediction based on session patterns
    const patterns = this.sessionPatterns;
    
    for (let i = 0; i < patterns.length - 1; i++) {
      if (patterns[i] === normalizedWord) {
        const nextWord = patterns[i + 1];
        const count = predictions.get(nextWord) || 0;
        predictions.set(nextWord, count + 1);
      }
    }
    
    // Add context-based predictions
    const contexts = this.wordContexts.get(normalizedWord);
    if (contexts) {
      contexts.forEach(contextWord => {
        const count = predictions.get(contextWord) || 0;
        predictions.set(contextWord, count + 0.5); // Lower weight for context
      });
    }
    
    return Array.from(predictions.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([word]) => word);
  }
  
  /**
   * Get usage statistics
   */
  getUsageStats(): UsageStats {
    return {
      totalWords: Array.from(this.wordFrequency.values()).reduce((sum, count) => sum + count, 0),
      uniqueWords: this.wordFrequency.size,
      topWords: this.getTopWords(10),
      topPrefixes: this.getTopPrefixes(10),
      sessionDuration: Date.now() - this.sessionStart
    };
  }
  
  /**
   * Clear analytics data
   */
  clear(): void {
    this.wordFrequency.clear();
    this.prefixFrequency.clear();
    this.wordContexts.clear();
    this.sessionPatterns = [];
    this.sessionStart = Date.now();
  }
}
