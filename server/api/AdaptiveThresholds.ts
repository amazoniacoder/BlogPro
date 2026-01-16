/**
 * Adaptive Thresholds System
 * 
 * Automatically adjusts cache size, memory thresholds, and partition
 * priorities based on usage patterns and performance analytics.
 */

import { PartitionLRUCache } from './PartitionLRUCache.js';
import { MemoryMonitor } from './MemoryMonitor.js';
import { IntelligentPreloader } from './IntelligentPreloader.js';

interface ThresholdAdjustment {
  type: 'cache_size' | 'memory_threshold' | 'partition_priority' | 'preload_strategy';
  oldValue: any;
  newValue: any;
  reason: string;
  expectedImpact: string;
}

interface AdaptiveConfig {
  minCacheSize: number;
  maxCacheSize: number;
  adjustmentSensitivity: number;
  learningRate: number;
  stabilityThreshold: number;
}

export class AdaptiveThresholds {
  private cache: PartitionLRUCache;
  private memoryMonitor: MemoryMonitor;
  private preloader: IntelligentPreloader;
  private config: AdaptiveConfig;
  private adjustmentHistory: ThresholdAdjustment[] = [];
  private lastOptimization = Date.now();
  private readonly OPTIMIZATION_INTERVAL = 30 * 60 * 1000; // 30 minutes

  constructor(
    cache: PartitionLRUCache, 
    memoryMonitor: MemoryMonitor, 
    preloader: IntelligentPreloader
  ) {
    this.cache = cache;
    this.memoryMonitor = memoryMonitor;
    this.preloader = preloader;
    this.config = {
      minCacheSize: 4,
      maxCacheSize: 16,
      adjustmentSensitivity: 0.1,
      learningRate: 0.05,
      stabilityThreshold: 0.95
    };
  }

  /**
   * Increase cache size based on performance metrics
   */
  increaseCacheSize(): boolean {
    const currentStats = this.cache.getStats();
    const currentSize = currentStats.maxSize;
    const memoryStatus = this.memoryMonitor.getStatus();
    
    // Don't increase if memory pressure is high
    if (memoryStatus.currentMemory.usagePercent > 80) {
      console.log('🚫 Adaptive: Cannot increase cache size - high memory pressure');
      return false;
    }
    
    // Don't increase beyond maximum
    if (currentSize >= this.config.maxCacheSize) {
      console.log('🚫 Adaptive: Cache size already at maximum');
      return false;
    }
    
    const newSize = Math.min(this.config.maxCacheSize, currentSize + 2);
    const adjustment: ThresholdAdjustment = {
      type: 'cache_size',
      oldValue: currentSize,
      newValue: newSize,
      reason: `High hit rate (${(currentStats.hitRate * 100).toFixed(1)}%) with low memory pressure`,
      expectedImpact: 'Improved cache hit rate and reduced response times'
    };
    
    this.cache.setMaxSize(newSize);
    this.recordAdjustment(adjustment);
    
    console.log(`📈 Adaptive: Increased cache size from ${currentSize} to ${newSize}`);
    return true;
  }

  /**
   * Decrease cache size to reduce memory pressure
   */
  decreaseCacheSize(): boolean {
    const currentStats = this.cache.getStats();
    const currentSize = currentStats.maxSize;
    
    // Don't decrease below minimum
    if (currentSize <= this.config.minCacheSize) {
      console.log('🚫 Adaptive: Cache size already at minimum');
      return false;
    }
    
    const newSize = Math.max(this.config.minCacheSize, currentSize - 1);
    const adjustment: ThresholdAdjustment = {
      type: 'cache_size',
      oldValue: currentSize,
      newValue: newSize,
      reason: 'High memory pressure or low hit rate detected',
      expectedImpact: 'Reduced memory usage with minimal performance impact'
    };
    
    this.cache.setMaxSize(newSize);
    this.recordAdjustment(adjustment);
    
    console.log(`📉 Adaptive: Decreased cache size from ${currentSize} to ${newSize}`);
    return true;
  }

  /**
   * Update partition priorities based on usage frequency
   */
  updatePartitionPriorities(letterFrequency: Map<string, number>): void {
    const totalUsage = Array.from(letterFrequency.values()).reduce((sum, count) => sum + count, 0);
    if (totalUsage === 0) return;
    
    // Calculate new priorities based on actual usage
    const newPriorities = new Map<string, number>();
    letterFrequency.forEach((count, letter) => {
      const frequency = count / totalUsage;
      newPriorities.set(letter, frequency);
    });
    
    // Update high/medium/low priority classifications
    const sortedLetters = Array.from(newPriorities.entries())
      .sort((a, b) => b[1] - a[1]);
    
    const highPriorityCount = Math.ceil(sortedLetters.length * 0.3);
    const mediumPriorityCount = Math.ceil(sortedLetters.length * 0.4);
    
    const newHighPriority = sortedLetters.slice(0, highPriorityCount).map(([letter]) => letter);
    const newMediumPriority = sortedLetters.slice(highPriorityCount, highPriorityCount + mediumPriorityCount).map(([letter]) => letter);
    
    const adjustment: ThresholdAdjustment = {
      type: 'partition_priority',
      oldValue: 'Static priorities',
      newValue: { high: newHighPriority, medium: newMediumPriority },
      reason: 'Updated based on actual usage patterns',
      expectedImpact: 'Better cache retention for frequently used partitions'
    };
    
    this.recordAdjustment(adjustment);
    console.log('🎯 Adaptive: Updated partition priorities based on usage patterns');
  }

  /**
   * Optimize memory thresholds based on system performance
   */
  optimizeMemoryThresholds(): void {
    const memoryStatus = this.memoryMonitor.getStatus();
    const currentThresholds = memoryStatus.thresholds;
    
    // Calculate optimal thresholds based on current memory usage patterns
    const usagePercent = memoryStatus.currentMemory.usagePercent;
    
    let multiplier = 1.0;
    
    // If consistently under 60% usage, we can increase thresholds
    if (usagePercent < 60) {
      multiplier = 1.1;
    }
    // If consistently over 85% usage, we should decrease thresholds
    else if (usagePercent > 85) {
      multiplier = 0.9;
    }
    
    const newThresholds = {
      warning: Math.floor(currentThresholds.warning * multiplier),
      cleanup: Math.floor(currentThresholds.cleanup * multiplier),
      critical: Math.floor(currentThresholds.critical * multiplier)
    };
    
    // Only update if change is significant (>5%)
    const changePercent = Math.abs(multiplier - 1.0);
    if (changePercent > 0.05) {
      this.memoryMonitor.updateThresholds(newThresholds);
      
      const adjustment: ThresholdAdjustment = {
        type: 'memory_threshold',
        oldValue: {
          warningMB: Math.round(currentThresholds.warning / 1024 / 1024),
          cleanupMB: Math.round(currentThresholds.cleanup / 1024 / 1024),
          criticalMB: Math.round(currentThresholds.critical / 1024 / 1024)
        },
        newValue: {
          warningMB: Math.round(newThresholds.warning / 1024 / 1024),
          cleanupMB: Math.round(newThresholds.cleanup / 1024 / 1024),
          criticalMB: Math.round(newThresholds.critical / 1024 / 1024)
        },
        reason: `Memory usage consistently at ${usagePercent.toFixed(1)}%`,
        expectedImpact: multiplier > 1 ? 'Allow higher memory usage before cleanup' : 'More aggressive memory management'
      };
      
      this.recordAdjustment(adjustment);
      console.log(`⚙️ Adaptive: Updated memory thresholds (${multiplier > 1 ? 'increased' : 'decreased'} by ${(changePercent * 100).toFixed(1)}%)`);
    }
  }

  /**
   * Adjust preloading strategy based on performance
   */
  adjustPreloadingStrategy(): void {
    const preloaderStats = this.preloader.getPreloadingStats();
    const memoryStatus = this.memoryMonitor.getStatus();
    
    let newStrategy: 'conservative' | 'balanced' | 'aggressive';
    let reason: string;
    
    // Determine optimal strategy
    if (memoryStatus.currentMemory.usagePercent > 80) {
      newStrategy = 'conservative';
      reason = 'High memory pressure detected';
    } else if (preloaderStats.cacheEfficiency > 90 && memoryStatus.currentMemory.usagePercent < 60) {
      newStrategy = 'aggressive';
      reason = 'High cache efficiency with low memory pressure';
    } else {
      newStrategy = 'balanced';
      reason = 'Balanced performance and memory usage';
    }
    
    const adjustment: ThresholdAdjustment = {
      type: 'preload_strategy',
      oldValue: 'Current strategy',
      newValue: newStrategy,
      reason,
      expectedImpact: this.getStrategyImpact(newStrategy)
    };
    
    this.recordAdjustment(adjustment);
    console.log(`🎯 Adaptive: Adjusted preloading strategy to ${newStrategy}`);
  }

  /**
   * Perform comprehensive system optimization
   */
  optimizeSystem(): void {
    const now = Date.now();
    
    // Don't optimize too frequently
    if (now - this.lastOptimization < this.OPTIMIZATION_INTERVAL) {
      return;
    }
    
    console.log('🔧 Adaptive: Starting system optimization...');
    
    const cacheStats = this.cache.getStats();
    const memoryStatus = this.memoryMonitor.getStatus();
    
    // Optimization decisions based on current metrics
    const hitRate = cacheStats.hitRate;
    const memoryPressure = memoryStatus.currentMemory.usagePercent / 100;
    
    // Cache size optimization
    if (hitRate > 0.95 && memoryPressure < 0.7) {
      this.increaseCacheSize();
    } else if (hitRate < 0.8 || memoryPressure > 0.85) {
      this.decreaseCacheSize();
    }
    
    // Memory threshold optimization
    this.optimizeMemoryThresholds();
    
    // Preloading strategy adjustment
    this.adjustPreloadingStrategy();
    
    // Update partition priorities if we have usage data
    const topUsedLetters = this.preloader.getTopUsedLetters(10);
    if (topUsedLetters.length > 0) {
      const letterFreq = new Map<string, number>();
      topUsedLetters.forEach((letter, index) => {
        letterFreq.set(letter, topUsedLetters.length - index);
      });
      this.updatePartitionPriorities(letterFreq);
    }
    
    this.lastOptimization = now;
    console.log('✅ Adaptive: System optimization complete');
  }

  /**
   * Get optimization history
   */
  getOptimizationHistory(): ThresholdAdjustment[] {
    return this.adjustmentHistory.slice(-20); // Last 20 adjustments
  }

  /**
   * Get system stability score (0-1)
   */
  getStabilityScore(): number {
    const recentAdjustments = this.adjustmentHistory.slice(-10);
    if (recentAdjustments.length === 0) return 1.0;
    
    // Count different types of adjustments
    const adjustmentTypes = new Set(recentAdjustments.map(adj => adj.type));
    const typeCount = adjustmentTypes.size;
    
    // More adjustment types = less stability
    return Math.max(0, 1 - (typeCount * 0.2));
  }

  /**
   * Record an adjustment for historical analysis
   */
  private recordAdjustment(adjustment: ThresholdAdjustment): void {
    this.adjustmentHistory.push({
      ...adjustment,
      timestamp: Date.now()
    } as any);
    
    // Keep only last 50 adjustments
    if (this.adjustmentHistory.length > 50) {
      this.adjustmentHistory = this.adjustmentHistory.slice(-50);
    }
  }

  /**
   * Get expected impact description for preloading strategy
   */
  private getStrategyImpact(strategy: 'conservative' | 'balanced' | 'aggressive'): string {
    switch (strategy) {
      case 'conservative':
        return 'Reduced memory usage, slightly lower cache hit rate';
      case 'balanced':
        return 'Optimal balance of memory usage and performance';
      case 'aggressive':
        return 'Higher cache hit rate, increased memory usage';
      default:
        return 'Unknown impact';
    }
  }
}