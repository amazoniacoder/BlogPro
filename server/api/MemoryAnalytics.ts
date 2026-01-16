/**
 * Memory Analytics Engine
 * 
 * Advanced analytics system that analyzes usage patterns,
 * memory pressure, and performance metrics to optimize
 * the spell check system automatically.
 */

import { PartitionLRUCache } from './PartitionLRUCache.js';
import { IntelligentPreloader } from './IntelligentPreloader.js';

interface UsageStats {
  hitRate: number;
  memoryPressure: number;
  letterFrequency: Map<string, number>;
  partitionEfficiency: Map<string, number>;
  timeBasedPatterns: TimePattern[];
  userBehaviorProfile: UserProfile;
}

interface TimePattern {
  hour: number;
  letterUsage: Map<string, number>;
  memoryUsage: number;
  requestCount: number;
}

interface UserProfile {
  preferredLanguage: string;
  writingStyle: 'technical' | 'casual' | 'academic' | 'mixed';
  averageTextLength: number;
  commonWords: string[];
  sessionDuration: number;
}

interface MemoryPressureAnalysis {
  currentPressure: number;
  predictedPressure: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
}

interface OptimizationPlan {
  cacheSize: number;
  memoryThresholds: {
    warning: number;
    cleanup: number;
    critical: number;
  };
  partitionPriorities: Map<string, number>;
  preloadingStrategy: 'conservative' | 'balanced' | 'aggressive';
}

export class MemoryAnalytics {
  private cache: PartitionLRUCache;
  private preloader: IntelligentPreloader;
  private usageHistory: TimePattern[] = [];
  private userProfile: UserProfile;
  private readonly MAX_HISTORY_SIZE = 168; // 1 week of hourly data

  constructor(cache: PartitionLRUCache, preloader: IntelligentPreloader) {
    this.cache = cache;
    this.preloader = preloader;
    this.userProfile = this.initializeUserProfile();
    
    // Start periodic analysis
    this.startPeriodicAnalysis();
  }

  /**
   * Get comprehensive usage statistics
   */
  getUsageStats(): UsageStats {
    const cacheStats = this.cache.getStats();
    
    return {
      hitRate: cacheStats.hitRate,
      memoryPressure: this.calculateMemoryPressure(),
      letterFrequency: this.calculateLetterFrequency(),
      partitionEfficiency: this.calculatePartitionEfficiency(),
      timeBasedPatterns: this.getTimeBasedPatterns(),
      userBehaviorProfile: this.userProfile
    };
  }

  /**
   * Analyze memory pressure and predict future needs
   */
  predictMemoryPressure(): MemoryPressureAnalysis {
    const currentMemory = process.memoryUsage().heapUsed;
    const memoryTrend = this.calculateMemoryTrend();
    const currentPressure = currentMemory / (400 * 1024 * 1024); // vs 400MB limit
    
    // Predict memory usage in next 30 minutes based on trends
    const predictedPressure = Math.min(1.0, currentPressure + (memoryTrend * 0.5));
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    const recommendedActions: string[] = [];
    
    if (predictedPressure > 0.9) {
      riskLevel = 'critical';
      recommendedActions.push('Immediate cache reduction required');
      recommendedActions.push('Force garbage collection');
      recommendedActions.push('Reduce cache size to 4 partitions');
    } else if (predictedPressure > 0.7) {
      riskLevel = 'high';
      recommendedActions.push('Reduce cache size by 25%');
      recommendedActions.push('Clear low-priority partitions');
    } else if (predictedPressure > 0.5) {
      riskLevel = 'medium';
      recommendedActions.push('Monitor memory usage closely');
      recommendedActions.push('Consider preemptive cleanup');
    } else {
      riskLevel = 'low';
      recommendedActions.push('Memory usage is optimal');
    }

    return {
      currentPressure,
      predictedPressure,
      riskLevel,
      recommendedActions
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationPlan(): OptimizationPlan {
    const stats = this.getUsageStats();
    const memoryAnalysis = this.predictMemoryPressure();
    
    // Determine optimal cache size
    let optimalCacheSize = 8; // default
    if (stats.hitRate > 0.95 && memoryAnalysis.currentPressure < 0.6) {
      optimalCacheSize = Math.min(12, Math.ceil(8 * 1.5)); // Increase by 50%
    } else if (stats.hitRate < 0.8 || memoryAnalysis.currentPressure > 0.8) {
      optimalCacheSize = Math.max(4, Math.floor(8 * 0.75)); // Decrease by 25%
    }

    // Adjust memory thresholds based on usage patterns
    const baseWarning = 300 * 1024 * 1024;
    const baseCleanup = 400 * 1024 * 1024;
    const baseCritical = 500 * 1024 * 1024;
    
    const thresholdMultiplier = this.calculateThresholdMultiplier(stats);
    
    // Update partition priorities based on usage frequency
    const partitionPriorities = this.calculateOptimalPriorities(stats.letterFrequency);
    
    // Determine preloading strategy
    let preloadingStrategy: 'conservative' | 'balanced' | 'aggressive';
    if (memoryAnalysis.currentPressure > 0.7) {
      preloadingStrategy = 'conservative';
    } else if (stats.hitRate > 0.9) {
      preloadingStrategy = 'aggressive';
    } else {
      preloadingStrategy = 'balanced';
    }

    return {
      cacheSize: optimalCacheSize,
      memoryThresholds: {
        warning: Math.floor(baseWarning * thresholdMultiplier),
        cleanup: Math.floor(baseCleanup * thresholdMultiplier),
        critical: Math.floor(baseCritical * thresholdMultiplier)
      },
      partitionPriorities,
      preloadingStrategy
    };
  }

  /**
   * Update user behavior profile based on recent activity
   */
  updateUserProfile(textLength: number, language: string, words: string[]): void {
    // Update average text length (rolling average)
    this.userProfile.averageTextLength = 
      (this.userProfile.averageTextLength * 0.9) + (textLength * 0.1);
    
    // Update preferred language
    if (language === 'ru' || language === 'en') {
      this.userProfile.preferredLanguage = language;
    }
    
    // Update common words (keep top 100)
    words.forEach(word => {
      if (!this.userProfile.commonWords.includes(word)) {
        this.userProfile.commonWords.push(word);
        if (this.userProfile.commonWords.length > 100) {
          this.userProfile.commonWords.shift();
        }
      }
    });
    
    // Analyze writing style based on word patterns
    this.userProfile.writingStyle = this.analyzeWritingStyle(words);
  }

  /**
   * Start periodic analysis and optimization
   */
  private startPeriodicAnalysis(): void {
    // Run analysis every 10 minutes
    setInterval(() => {
      this.recordCurrentUsage();
      this.cleanupOldHistory();
    }, 10 * 60 * 1000);
    
    // Run optimization every hour
    setInterval(() => {
      const plan = this.generateOptimizationPlan();
      console.log('📊 Analytics: Generated optimization plan:', {
        cacheSize: plan.cacheSize,
        strategy: plan.preloadingStrategy,
        memoryThresholds: {
          warningMB: Math.round(plan.memoryThresholds.warning / 1024 / 1024),
          cleanupMB: Math.round(plan.memoryThresholds.cleanup / 1024 / 1024)
        }
      });
    }, 60 * 60 * 1000);
  }

  /**
   * Calculate current memory pressure (0-1)
   */
  private calculateMemoryPressure(): number {
    const memUsage = process.memoryUsage();
    return memUsage.heapUsed / (400 * 1024 * 1024); // vs 400MB limit
  }

  /**
   * Calculate letter frequency from recent usage
   */
  private calculateLetterFrequency(): Map<string, number> {
    const frequency = new Map<string, number>();
    const preloaderStats = this.preloader.getPreloadingStats();
    
    preloaderStats.usageStats.forEach(stat => {
      frequency.set(stat.letter, stat.accessCount);
    });
    
    return frequency;
  }

  /**
   * Calculate efficiency of each partition
   */
  private calculatePartitionEfficiency(): Map<string, number> {
    const efficiency = new Map<string, number>();
    const cachedPartitions = this.cache.getCachedPartitions();
    
    cachedPartitions.forEach(letter => {
      // Efficiency = hit rate for this partition
      const partitionHits = this.getPartitionHits(letter);
      const partitionRequests = this.getPartitionRequests(letter);
      const partitionEfficiency = partitionRequests > 0 ? partitionHits / partitionRequests : 0;
      efficiency.set(letter, partitionEfficiency);
    });
    
    return efficiency;
  }

  /**
   * Get time-based usage patterns
   */
  private getTimeBasedPatterns(): TimePattern[] {
    return this.usageHistory.slice(-24); // Last 24 hours
  }

  /**
   * Calculate memory usage trend
   */
  private calculateMemoryTrend(): number {
    if (this.usageHistory.length < 2) return 0;
    
    const recent = this.usageHistory.slice(-6); // Last 6 data points
    if (recent.length < 2) return 0;
    
    const firstMemory = recent[0].memoryUsage;
    const lastMemory = recent[recent.length - 1].memoryUsage;
    
    return (lastMemory - firstMemory) / recent.length; // MB per hour trend
  }

  /**
   * Calculate optimal threshold multiplier
   */
  private calculateThresholdMultiplier(stats: UsageStats): number {
    let multiplier = 1.0;
    
    // Increase thresholds if hit rate is very high (system is efficient)
    if (stats.hitRate > 0.95) {
      multiplier *= 1.2;
    }
    
    // Decrease thresholds if memory pressure is high
    if (stats.memoryPressure > 0.8) {
      multiplier *= 0.8;
    }
    
    return Math.max(0.5, Math.min(1.5, multiplier));
  }

  /**
   * Calculate optimal partition priorities
   */
  private calculateOptimalPriorities(letterFreq: Map<string, number>): Map<string, number> {
    const priorities = new Map<string, number>();
    const totalUsage = Array.from(letterFreq.values()).reduce((sum, count) => sum + count, 0);
    
    letterFreq.forEach((count, letter) => {
      const frequency = totalUsage > 0 ? count / totalUsage : 0;
      priorities.set(letter, frequency);
    });
    
    return priorities;
  }

  /**
   * Record current usage for historical analysis
   */
  private recordCurrentUsage(): void {
    const now = new Date();
    const hour = now.getHours();
    const memUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const cacheStats = this.cache.getStats();
    
    const pattern: TimePattern = {
      hour,
      letterUsage: this.calculateLetterFrequency(),
      memoryUsage: memUsage,
      requestCount: cacheStats.totalRequests
    };
    
    this.usageHistory.push(pattern);
  }

  /**
   * Clean up old historical data
   */
  private cleanupOldHistory(): void {
    if (this.usageHistory.length > this.MAX_HISTORY_SIZE) {
      this.usageHistory = this.usageHistory.slice(-this.MAX_HISTORY_SIZE);
    }
  }

  /**
   * Initialize user profile with defaults
   */
  private initializeUserProfile(): UserProfile {
    return {
      preferredLanguage: 'ru',
      writingStyle: 'mixed',
      averageTextLength: 50,
      commonWords: [],
      sessionDuration: 0
    };
  }

  /**
   * Analyze writing style based on word patterns
   */
  private analyzeWritingStyle(words: string[]): 'technical' | 'casual' | 'academic' | 'mixed' {
    const technicalWords = ['алгоритм', 'программа', 'система', 'данные', 'код'];
    const academicWords = ['исследование', 'анализ', 'теория', 'концепция', 'методология'];
    const casualWords = ['привет', 'спасибо', 'хорошо', 'отлично', 'круто'];
    
    let technicalCount = 0;
    let academicCount = 0;
    let casualCount = 0;
    
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      if (technicalWords.includes(lowerWord)) technicalCount++;
      if (academicWords.includes(lowerWord)) academicCount++;
      if (casualWords.includes(lowerWord)) casualCount++;
    });
    
    const total = technicalCount + academicCount + casualCount;
    if (total === 0) return 'mixed';
    
    if (technicalCount / total > 0.4) return 'technical';
    if (academicCount / total > 0.4) return 'academic';
    if (casualCount / total > 0.4) return 'casual';
    
    return 'mixed';
  }

  /**
   * Get partition-specific hit count (placeholder)
   */
  private getPartitionHits(_letter: string): number {
    // This would be tracked by the cache in a real implementation
    return Math.floor(Math.random() * 100);
  }

  /**
   * Get partition-specific request count (placeholder)
   */
  private getPartitionRequests(_letter: string): number {
    // This would be tracked by the cache in a real implementation
    return Math.floor(Math.random() * 150);
  }
}