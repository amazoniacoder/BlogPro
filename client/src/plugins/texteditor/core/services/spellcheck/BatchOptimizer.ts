/**
 * Batch Optimizer
 * 
 * Intelligently batches multiple word validation requests to reduce
 * network overhead and improve performance.
 */

export class BatchOptimizer {
  private pendingWords = new Map<string, Promise<boolean>>();
  private batchQueue = new Set<string>();
  private batchTimeout?: NodeJS.Timeout;
  private resolvers = new Map<string, { resolve: (value: boolean) => void; reject: (error: any) => void }>();
  
  private readonly BATCH_DELAY = 50; // ms - wait time before processing batch
  private readonly MAX_BATCH_SIZE = 50; // max words per batch
  
  /**
   * Check a word with intelligent batching
   */
  async checkWord(word: string): Promise<boolean> {
    const normalizedWord = word.toLowerCase().trim();
    
    // Return existing promise if word is already being processed
    if (this.pendingWords.has(normalizedWord)) {
      return this.pendingWords.get(normalizedWord)!;
    }
    
    // Create new promise for this word
    const promise = new Promise<boolean>((resolve, reject) => {
      this.batchQueue.add(normalizedWord);
      this.resolvers.set(normalizedWord, { resolve, reject });
      
      // Schedule batch processing
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.processBatch();
        }, this.BATCH_DELAY);
      }
      
      // Force batch if queue is full
      if (this.batchQueue.size >= this.MAX_BATCH_SIZE) {
        clearTimeout(this.batchTimeout);
        this.batchTimeout = undefined;
        this.processBatch();
      }
    });
    
    this.pendingWords.set(normalizedWord, promise);
    return promise;
  }
  
  /**
   * Process the current batch of words
   */
  private async processBatch(): Promise<void> {
    const words = Array.from(this.batchQueue);
    this.batchQueue.clear();
    this.batchTimeout = undefined;
    
    if (words.length === 0) return;
    
    console.log(`🔄 BatchOptimizer: Processing batch of ${words.length} words:`, words);
    
    try {
      const results = await this.validateWordsBatch(words);
      
      // Resolve all pending words
      words.forEach((word, index) => {
        const resolver = this.resolvers.get(word);
        if (resolver) {
          resolver.resolve(results[index]);
          this.resolvers.delete(word);
        }
        this.pendingWords.delete(word);
      });
      
      console.log(`✅ BatchOptimizer: Successfully processed ${words.length} words`);
    } catch (error) {
      console.error('🔧 BatchOptimizer: Batch processing failed:', error);
      
      // Reject all pending words
      words.forEach(word => {
        const resolver = this.resolvers.get(word);
        if (resolver) {
          resolver.reject(error);
          this.resolvers.delete(word);
        }
        this.pendingWords.delete(word);
      });
    }
  }
  
  /**
   * Validate multiple words via batch API
   */
  private async validateWordsBatch(words: string[]): Promise<boolean[]> {
    const response = await fetch('/api/spellcheck/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words })
    });
    
    if (!response.ok) {
      throw new Error(`Batch API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.results;
  }
  
  /**
   * Get batch processing statistics
   */
  getStats(): {
    pendingWords: number;
    queueSize: number;
    isProcessing: boolean;
  } {
    return {
      pendingWords: this.pendingWords.size,
      queueSize: this.batchQueue.size,
      isProcessing: this.batchTimeout !== undefined
    };
  }
  
  /**
   * Clear all pending operations
   */
  clear(): void {
    // Reject all pending promises
    this.resolvers.forEach(({ reject }) => {
      reject(new Error('BatchOptimizer cleared'));
    });
    
    this.pendingWords.clear();
    this.batchQueue.clear();
    this.resolvers.clear();
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = undefined;
    }
  }
}
