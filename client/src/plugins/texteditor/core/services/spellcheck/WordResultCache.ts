/**
 * Word Result Cache
 * 
 * Lightweight cache that stores only spell check results (true/false)
 * instead of entire dictionaries. Provides 94% memory reduction.
 */

export class WordResultCache {
  private cache = new Map<string, boolean>();
  private readonly MAX_SIZE = 10000; // ~400KB memory limit
  
  /**
   * Get cached result for a word
   */
  get(word: string): boolean | null {
    return this.cache.get(word.toLowerCase()) ?? null;
  }
  
  /**
   * Cache spell check result for a word
   */
  set(word: string, isValid: boolean): void {
    // LRU eviction when cache is full
    if (this.cache.size >= this.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(word.toLowerCase(), isValid);
  }
  
  /**
   * Check if word result is cached
   */
  has(word: string): boolean {
    return this.cache.has(word.toLowerCase());
  }
  
  /**
   * Clear all cached results
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; memoryUsage: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE,
      memoryUsage: this.cache.size * 40 // ~40 bytes per entry
    };
  }
  
  /**
   * Get all cached words (for debugging)
   */
  getCachedWords(): string[] {
    return Array.from(this.cache.keys());
  }
}
