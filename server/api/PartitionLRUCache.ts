/**
 * Partition LRU Cache
 * 
 * Implements Least Recently Used cache for dictionary partitions
 * with priority-based eviction and memory management.
 */

interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  totalRequests: number;
  totalHits: number;
}

export class PartitionLRUCache {
  private maxSize: number;
  private cache = new Map<string, Set<string>>();
  private accessOrder = new Map<string, number>();
  private hitCount = 0;
  private totalRequests = 0;
  
  // Priority levels for Russian letters
  private readonly HIGH_PRIORITY = new Set(['а', 'в', 'и', 'к', 'н', 'о', 'п', 'р', 'с', 'т']);
  private readonly MEDIUM_PRIORITY = new Set(['б', 'г', 'д', 'з', 'л', 'м', 'у', 'ч', 'я']);
  
  constructor(maxSize: number = 8) {
    this.maxSize = maxSize;
  }
  
  /**
   * Get partition from cache
   */
  get(letter: string): Set<string> | undefined {
    this.totalRequests++;
    
    if (this.cache.has(letter)) {
      this.hitCount++;
      this.accessOrder.set(letter, Date.now());
      console.log(`📦 Cache HIT for partition '${letter}'`);
      return this.cache.get(letter);
    }
    
    console.log(`❌ Cache MISS for partition '${letter}'`);
    return undefined;
  }
  
  /**
   * Set partition in cache with LRU eviction
   */
  set(letter: string, partition: Set<string>): void {
    // If cache is full, evict least recently used
    if (this.cache.size >= this.maxSize && !this.cache.has(letter)) {
      this.evictLeastRecentlyUsed();
    }
    
    this.cache.set(letter, partition);
    this.accessOrder.set(letter, Date.now());
    
    console.log(`💾 Cached partition '${letter}': ${partition.size} words (${this.cache.size}/${this.maxSize})`);
  }
  
  /**
   * Check if partition exists in cache
   */
  has(letter: string): boolean {
    return this.cache.has(letter);
  }
  
  /**
   * Remove specific partition from cache
   */
  delete(letter: string): boolean {
    const deleted = this.cache.delete(letter);
    this.accessOrder.delete(letter);
    
    if (deleted) {
      console.log(`🗑️ Removed partition '${letter}' from cache`);
    }
    
    return deleted;
  }
  
  /**
   * Clear entire cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.accessOrder.clear();
    console.log(`🧹 Cleared cache: ${size} partitions removed`);
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.totalRequests > 0 ? this.hitCount / this.totalRequests : 0,
      totalRequests: this.totalRequests,
      totalHits: this.hitCount
    };
  }
  
  /**
   * Get list of cached partitions
   */
  getCachedPartitions(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Get total words in cache
   */
  getTotalWords(): number {
    return Array.from(this.cache.values()).reduce((total, partition) => total + partition.size, 0);
  }
  
  /**
   * Evict least recently used partition with priority consideration
   */
  private evictLeastRecentlyUsed(): void {
    let candidateForEviction = '';
    let oldestTime = Date.now();
    
    // First pass: try to evict low-priority partitions
    for (const [letter, time] of this.accessOrder) {
      if (time < oldestTime && this.isLowPriority(letter)) {
        oldestTime = time;
        candidateForEviction = letter;
      }
    }
    
    // Second pass: if no low-priority found, evict any medium-priority
    if (!candidateForEviction) {
      oldestTime = Date.now();
      for (const [letter, time] of this.accessOrder) {
        if (time < oldestTime && this.isMediumPriority(letter)) {
          oldestTime = time;
          candidateForEviction = letter;
        }
      }
    }
    
    // Third pass: if still nothing, evict oldest regardless of priority
    if (!candidateForEviction) {
      oldestTime = Date.now();
      for (const [letter, time] of this.accessOrder) {
        if (time < oldestTime) {
          oldestTime = time;
          candidateForEviction = letter;
        }
      }
    }
    
    if (candidateForEviction) {
      const partition = this.cache.get(candidateForEviction);
      const wordCount = partition?.size || 0;
      
      this.cache.delete(candidateForEviction);
      this.accessOrder.delete(candidateForEviction);
      
      console.log(`🔄 LRU evicted partition '${candidateForEviction}': ${wordCount} words`);
    }
  }
  
  /**
   * Check if letter is medium priority
   */
  private isMediumPriority(letter: string): boolean {
    return this.MEDIUM_PRIORITY.has(letter);
  }
  
  /**
   * Check if letter is low priority
   */
  private isLowPriority(letter: string): boolean {
    return !this.HIGH_PRIORITY.has(letter) && !this.MEDIUM_PRIORITY.has(letter);
  }
  
  /**
   * Update cache size limit
   */
  setMaxSize(newSize: number): void {
    this.maxSize = newSize;
    
    // Evict excess partitions if needed
    while (this.cache.size > this.maxSize) {
      this.evictLeastRecentlyUsed();
    }
    
    console.log(`⚙️ Cache max size updated to ${newSize}`);
  }
  
  /**
   * Get memory usage estimate in MB
   */
  getMemoryUsageMB(): number {
    const totalWords = this.getTotalWords();
    // Rough estimate: ~50 bytes per word on average
    return (totalWords * 50) / (1024 * 1024);
  }
}