/**
 * Intelligent Preloader
 * 
 * Predictively loads dictionary partitions based on text analysis
 * and usage patterns to improve cache hit rates.
 */

import { TextAnalyzer } from './TextAnalyzer.js';
import { PartitionLRUCache } from './PartitionLRUCache.js';

interface UsageStats {
  letter: string;
  accessCount: number;
  lastAccessed: number;
  hitRate: number;
}

interface PreloadingStats {
  totalPreloads: number;
  successfulPreloads: number;
  preloadHitRate: number;
  averagePreloadTime: number;
}

export class IntelligentPreloader {
  private textAnalyzer: TextAnalyzer;
  private cache: PartitionLRUCache;
  private usageStats = new Map<string, UsageStats>();
  private preloadingStats: PreloadingStats = {
    totalPreloads: 0,
    successfulPreloads: 0,
    preloadHitRate: 0,
    averagePreloadTime: 0
  };
  private loadPartitionFn: (letter: string) => Promise<Set<string>>;
  
  constructor(cache: PartitionLRUCache, loadPartitionFn: (letter: string) => Promise<Set<string>>) {
    this.textAnalyzer = new TextAnalyzer();
    this.cache = cache;
    this.loadPartitionFn = loadPartitionFn;
  }
  
  /**
   * Analyze text and preload predicted partitions
   */
  async analyzeAndPreload(text: string): Promise<void> {
    if (!text || text.length < 10) return; // Skip very short texts
    
    const analysis = this.textAnalyzer.analyzeText(text);
    console.log(`🔮 Preloader: Analyzing text (${text.length} chars), predicted partitions:`, analysis.predictedPartitions);
    
    // Update usage statistics
    this.updateUsageStats(analysis.topLetters);
    
    // Preload predicted partitions in background
    const preloadPromises = analysis.predictedPartitions.map(letter => 
      this.preloadPartition(letter)
    );
    
    // Don't wait for preloading to complete
    Promise.all(preloadPromises).then(() => {
      console.log(`✅ Preloader: Completed preloading ${analysis.predictedPartitions.length} partitions`);
    }).catch(error => {
      console.warn('⚠️ Preloader: Some partitions failed to preload:', error);
    });
  }
  
  /**
   * Preload a specific partition if not already cached
   */
  private async preloadPartition(letter: string): Promise<void> {
    // Skip if already cached
    if (this.cache.has(letter)) {
      console.log(`📦 Preloader: Partition '${letter}' already cached`);
      return;
    }
    
    const startTime = Date.now();
    this.preloadingStats.totalPreloads++;
    
    try {
      console.log(`🔄 Preloader: Loading partition '${letter}'...`);
      const partition = await this.loadPartitionFn(letter);
      
      // Add to cache with preload flag
      this.cache.set(letter, partition);
      
      const loadTime = Date.now() - startTime;
      this.preloadingStats.successfulPreloads++;
      this.updatePreloadStats(loadTime);
      
      console.log(`✅ Preloader: Loaded partition '${letter}' (${partition.size} words) in ${loadTime}ms`);
    } catch (error) {
      console.warn(`❌ Preloader: Failed to load partition '${letter}':`, error);
    }
  }
  
  /**
   * Update usage statistics for letters
   */
  private updateUsageStats(letters: string[]): void {
    const now = Date.now();
    
    letters.forEach(letter => {
      const existing = this.usageStats.get(letter) || {
        letter,
        accessCount: 0,
        lastAccessed: 0,
        hitRate: 0
      };
      
      existing.accessCount++;
      existing.lastAccessed = now;
      
      this.usageStats.set(letter, existing);
    });
  }
  
  /**
   * Update preloading performance statistics
   */
  private updatePreloadStats(loadTime: number): void {
    const stats = this.preloadingStats;
    stats.preloadHitRate = stats.totalPreloads > 0 ? 
      (stats.successfulPreloads / stats.totalPreloads) * 100 : 0;
    
    // Update average load time
    stats.averagePreloadTime = (stats.averagePreloadTime + loadTime) / 2;
  }
  
  /**
   * Get most frequently used letters for priority adjustment
   */
  getTopUsedLetters(count: number = 10): string[] {
    return Array.from(this.usageStats.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, count)
      .map(stat => stat.letter);
  }
  
  /**
   * Predict partitions needed for upcoming text
   */
  predictPartitionsForText(text: string): string[] {
    const analysis = this.textAnalyzer.analyzeText(text);
    const historicalData = this.getTopUsedLetters(5);
    
    // Combine predictions with historical usage
    const predictions = new Set([
      ...analysis.predictedPartitions,
      ...historicalData.slice(0, 3)
    ]);
    
    return Array.from(predictions);
  }
  
  /**
   * Get preloading performance statistics
   */
  getPreloadingStats(): PreloadingStats & {
    usageStats: UsageStats[];
    cacheEfficiency: number;
  } {
    const cacheStats = this.cache.getStats();
    
    return {
      ...this.preloadingStats,
      usageStats: Array.from(this.usageStats.values()),
      cacheEfficiency: cacheStats.hitRate * 100
    };
  }
  
  /**
   * Optimize cache based on usage patterns
   */
  optimizeCache(): void {
    const topLetters = this.getTopUsedLetters(8);
    const cachedPartitions = this.cache.getCachedPartitions();
    
    console.log(`🎯 Preloader: Optimizing cache based on usage patterns`);
    console.log(`   Top used letters:`, topLetters);
    console.log(`   Currently cached:`, cachedPartitions);
    
    // Preload frequently used but not cached partitions
    topLetters.forEach(letter => {
      if (!cachedPartitions.includes(letter)) {
        this.preloadPartition(letter).catch(error => {
          console.warn(`Failed to optimize-preload partition '${letter}':`, error);
        });
      }
    });
  }
  
  /**
   * Clear old usage statistics
   */
  clearOldStats(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const cutoff = now - maxAge;
    
    for (const [letter, stats] of this.usageStats.entries()) {
      if (stats.lastAccessed < cutoff) {
        this.usageStats.delete(letter);
      }
    }
    
    console.log(`🧹 Preloader: Cleared old usage statistics, ${this.usageStats.size} entries remaining`);
  }
}