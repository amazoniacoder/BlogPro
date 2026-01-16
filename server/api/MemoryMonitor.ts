/**
 * Memory Monitor
 * 
 * Monitors server memory usage and triggers automatic cleanup
 * when memory thresholds are exceeded.
 */

import { PartitionLRUCache } from './PartitionLRUCache.js';

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  usagePercent: number;
  timestamp: number;
}

interface MemoryThresholds {
  warning: number;    // 300MB - log warning
  cleanup: number;    // 400MB - trigger cleanup
  critical: number;   // 500MB - aggressive cleanup
}

export class MemoryMonitor {
  private checkInterval: number;
  private thresholds: MemoryThresholds;
  private isMonitoring = false;
  private intervalId?: NodeJS.Timeout;
  private cache: PartitionLRUCache;
  
  constructor(cache: PartitionLRUCache) {
    this.cache = cache;
    this.checkInterval = 2 * 60 * 1000; // 2 minutes
    this.thresholds = {
      warning: 300 * 1024 * 1024,  // 300MB
      cleanup: 400 * 1024 * 1024,  // 400MB
      critical: 500 * 1024 * 1024  // 500MB
    };
  }
  
  /**
   * Start memory monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('⚠️ Memory monitor already running');
      return;
    }
    
    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.checkMemoryUsage();
    }, this.checkInterval);
    
    console.log(`🔍 Memory monitor started (checking every ${this.checkInterval / 1000}s)`);
    
    // Initial check
    this.checkMemoryUsage();
  }
  
  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    
    this.isMonitoring = false;
    console.log('🛑 Memory monitor stopped');
  }
  
  /**
   * Check current memory usage and trigger cleanup if needed
   */
  private checkMemoryUsage(): void {
    const memUsage = process.memoryUsage();
    const stats = this.formatMemoryStats(memUsage);
    
    // Log current status
    console.log(`📊 Memory: ${Math.round(stats.heapUsed / 1024 / 1024)}MB used, ${Math.round(stats.usagePercent)}% of heap`);
    
    // Check thresholds and take action
    if (stats.heapUsed > this.thresholds.critical) {
      console.warn(`🚨 CRITICAL memory usage: ${Math.round(stats.heapUsed / 1024 / 1024)}MB`);
      this.performAggressiveCleanup();
    } else if (stats.heapUsed > this.thresholds.cleanup) {
      console.warn(`⚠️ High memory usage: ${Math.round(stats.heapUsed / 1024 / 1024)}MB - triggering cleanup`);
      this.performCleanup();
    } else if (stats.heapUsed > this.thresholds.warning) {
      console.warn(`⚠️ Memory warning: ${Math.round(stats.heapUsed / 1024 / 1024)}MB`);
    }
  }
  
  /**
   * Perform standard cleanup
   */
  private performCleanup(): void {
    console.log('🧹 Starting memory cleanup...');
    
    const beforeStats = this.cache.getStats();
    const beforeMemory = process.memoryUsage().heapUsed;
    
    // 1. Preserve current errors
    this.preserveCurrentErrors();
    
    // 2. Reduce cache size temporarily
    const currentMaxSize = beforeStats.maxSize;
    const newMaxSize = Math.max(4, Math.floor(currentMaxSize * 0.75)); // Reduce by 25%
    
    if (newMaxSize < currentMaxSize) {
      this.cache.setMaxSize(newMaxSize);
      console.log(`📉 Reduced cache size from ${currentMaxSize} to ${newMaxSize}`);
    }
    
    // 3. Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('🗑️ Forced garbage collection');
    }
    
    // 4. Log cleanup results
    const afterMemory = process.memoryUsage().heapUsed;
    const memoryFreed = beforeMemory - afterMemory;
    const afterStats = this.cache.getStats();
    
    console.log(`✅ Cleanup complete: freed ${Math.round(memoryFreed / 1024 / 1024)}MB, cache: ${afterStats.size}/${afterStats.maxSize}`);
  }
  
  /**
   * Perform aggressive cleanup for critical memory situations
   */
  private performAggressiveCleanup(): void {
    console.log('🚨 Starting AGGRESSIVE memory cleanup...');
    
    const beforeMemory = process.memoryUsage().heapUsed;
    
    // 1. Preserve errors
    this.preserveCurrentErrors();
    
    // 2. Drastically reduce cache size
    this.cache.setMaxSize(3); // Keep only 3 most important partitions
    
    // 3. Clear low-priority partitions manually
    const cachedPartitions = this.cache.getCachedPartitions();
    const lowPriorityLetters = ['ё', 'ж', 'ц', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю'];
    
    cachedPartitions.forEach(letter => {
      if (lowPriorityLetters.includes(letter)) {
        this.cache.delete(letter);
      }
    });
    
    // 4. Force multiple garbage collections
    if (global.gc) {
      for (let i = 0; i < 3; i++) {
        global.gc();
      }
      console.log('🗑️ Forced multiple garbage collections');
    }
    
    const afterMemory = process.memoryUsage().heapUsed;
    const memoryFreed = beforeMemory - afterMemory;
    
    console.log(`✅ Aggressive cleanup complete: freed ${Math.round(memoryFreed / 1024 / 1024)}MB`);
  }
  
  /**
   * Preserve current spell check errors before cleanup
   */
  private preserveCurrentErrors(): void {
    // This would integrate with the spell check service to preserve errors
    // For now, we'll just log that errors are being preserved
    console.log('💾 Preserving current spell check errors');
    
    // In a full implementation, this would:
    // 1. Extract current errors from active spell check sessions
    // 2. Store them in persistent storage
    // 3. Ensure they remain available for UI highlighting
  }
  
  /**
   * Format memory usage into statistics object
   */
  private formatMemoryStats(memUsage: NodeJS.MemoryUsage): MemoryStats {
    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      usagePercent: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get current memory statistics
   */
  getMemoryStats(): MemoryStats {
    return this.formatMemoryStats(process.memoryUsage());
  }
  
  /**
   * Update memory thresholds
   */
  updateThresholds(thresholds: Partial<MemoryThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    console.log('⚙️ Memory thresholds updated:', this.thresholds);
  }
  
  /**
   * Get monitoring status
   */
  getStatus(): {
    isMonitoring: boolean;
    checkInterval: number;
    thresholds: MemoryThresholds;
    currentMemory: MemoryStats;
  } {
    return {
      isMonitoring: this.isMonitoring,
      checkInterval: this.checkInterval,
      thresholds: this.thresholds,
      currentMemory: this.getMemoryStats()
    };
  }
  
  /**
   * Force immediate memory check and cleanup if needed
   */
  forceCheck(): void {
    console.log('🔍 Forcing immediate memory check...');
    this.checkMemoryUsage();
  }
}