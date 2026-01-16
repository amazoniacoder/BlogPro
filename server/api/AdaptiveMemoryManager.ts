/**
 * Adaptive Memory Manager
 * 
 * Self-optimizing system that combines analytics and adaptive thresholds
 * to automatically optimize spell check performance and memory usage.
 */

import { PartitionLRUCache } from './PartitionLRUCache.js';
import { MemoryMonitor } from './MemoryMonitor.js';
import { IntelligentPreloader } from './IntelligentPreloader.js';
import { MemoryAnalytics } from './MemoryAnalytics.js';
import { AdaptiveThresholds } from './AdaptiveThresholds.js';

interface SystemHealth {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  metrics: {
    cacheEfficiency: number;
    memoryHealth: number;
    responseTime: number;
    stability: number;
  };
  recommendations: string[];
  nextOptimization: number;
}

interface OptimizationResult {
  success: boolean;
  adjustmentsMade: number;
  performanceImprovement: number;
  memoryReduction: number;
  errors: string[];
}

export class AdaptiveMemoryManager {
  private analytics: MemoryAnalytics;
  private thresholds: AdaptiveThresholds;
  private cache: PartitionLRUCache;
  private memoryMonitor: MemoryMonitor;
  private preloader: IntelligentPreloader;
  
  private isOptimizing = false;
  private lastOptimizationResult: OptimizationResult | null = null;
  private optimizationCount = 0;
  
  constructor(
    cache: PartitionLRUCache,
    memoryMonitor: MemoryMonitor,
    preloader: IntelligentPreloader
  ) {
    this.cache = cache;
    this.memoryMonitor = memoryMonitor;
    this.preloader = preloader;
    this.analytics = new MemoryAnalytics(cache, preloader);
    this.thresholds = new AdaptiveThresholds(cache, memoryMonitor, preloader);
    
    // Start automatic optimization
    this.startAutomaticOptimization();
  }

  /**
   * Perform comprehensive system optimization
   */
  async optimizeBasedOnUsage(): Promise<OptimizationResult> {
    if (this.isOptimizing) {
      return {
        success: false,
        adjustmentsMade: 0,
        performanceImprovement: 0,
        memoryReduction: 0,
        errors: ['Optimization already in progress']
      };
    }

    this.isOptimizing = true;
    console.log('🚀 Adaptive Manager: Starting comprehensive optimization...');
    
    try {
      const beforeStats = this.getSystemMetrics();
      const adjustmentsMade = await this.performOptimizations();
      const afterStats = this.getSystemMetrics();
      
      const result: OptimizationResult = {
        success: true,
        adjustmentsMade,
        performanceImprovement: this.calculatePerformanceImprovement(beforeStats, afterStats),
        memoryReduction: this.calculateMemoryReduction(beforeStats, afterStats),
        errors: []
      };
      
      this.lastOptimizationResult = result;
      this.optimizationCount++;
      
      console.log('✅ Adaptive Manager: Optimization complete:', {
        adjustments: result.adjustmentsMade,
        performanceGain: `${result.performanceImprovement.toFixed(1)}%`,
        memoryReduction: `${result.memoryReduction.toFixed(1)}%`
      });
      
      return result;
    } catch (error) {
      console.error('❌ Adaptive Manager: Optimization failed:', error);
      return {
        success: false,
        adjustmentsMade: 0,
        performanceImprovement: 0,
        memoryReduction: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    } finally {
      this.isOptimizing = false;
    }
  }

  /**
   * Get comprehensive system health assessment
   */
  getSystemHealth(): SystemHealth {
    const cacheStats = this.cache.getStats();
    const memoryStatus = this.memoryMonitor.getStatus();
    const preloaderStats = this.preloader.getPreloadingStats();
    const stabilityScore = this.thresholds.getStabilityScore();
    
    // Calculate individual health metrics (0-100)
    const cacheEfficiency = Math.min(100, cacheStats.hitRate * 100);
    const memoryHealth = Math.max(0, 100 - (memoryStatus.currentMemory.usagePercent));
    const responseTime = Math.max(0, 100 - (preloaderStats.averagePreloadTime / 10)); // 1000ms = 0 points
    const stability = stabilityScore * 100;
    
    // Calculate overall health
    const overallScore = (cacheEfficiency + memoryHealth + responseTime + stability) / 4;
    
    let overall: SystemHealth['overall'];
    if (overallScore >= 90) overall = 'excellent';
    else if (overallScore >= 75) overall = 'good';
    else if (overallScore >= 60) overall = 'fair';
    else if (overallScore >= 40) overall = 'poor';
    else overall = 'critical';
    
    // Generate recommendations
    const recommendations = this.generateHealthRecommendations(
      cacheEfficiency, memoryHealth, responseTime, stability
    );
    
    return {
      overall,
      metrics: {
        cacheEfficiency,
        memoryHealth,
        responseTime,
        stability
      },
      recommendations,
      nextOptimization: this.getNextOptimizationTime()
    };
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats(): {
    totalOptimizations: number;
    lastResult: OptimizationResult | null;
    averageImprovement: number;
    systemUptime: number;
  } {
    return {
      totalOptimizations: this.optimizationCount,
      lastResult: this.lastOptimizationResult,
      averageImprovement: this.calculateAverageImprovement(),
      systemUptime: process.uptime()
    };
  }

  /**
   * Force immediate optimization
   */
  async forceOptimization(): Promise<OptimizationResult> {
    console.log('🔧 Adaptive Manager: Force optimization requested');
    return await this.optimizeBasedOnUsage();
  }

  /**
   * Update system with new usage data
   */
  updateUsageData(textLength: number, language: string, words: string[]): void {
    this.analytics.updateUserProfile(textLength, language, words);
  }

  /**
   * Start automatic optimization process
   */
  private startAutomaticOptimization(): void {
    // Run optimization every 2 hours
    setInterval(async () => {
      const health = this.getSystemHealth();
      
      // Only optimize if system health is not excellent
      if (health.overall !== 'excellent') {
        console.log(`🔄 Adaptive Manager: Auto-optimization triggered (health: ${health.overall})`);
        await this.optimizeBasedOnUsage();
      }
    }, 2 * 60 * 60 * 1000);
    
    // Emergency optimization if system health becomes critical
    setInterval(() => {
      const health = this.getSystemHealth();
      if (health.overall === 'critical' && !this.isOptimizing) {
        console.log('🚨 Adaptive Manager: Emergency optimization triggered');
        this.optimizeBasedOnUsage().catch(error => {
          console.error('Emergency optimization failed:', error);
        });
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  /**
   * Perform all optimization steps
   */
  private async performOptimizations(): Promise<number> {
    let adjustmentCount = 0;
    
    // 1. Generate optimization plan
    const plan = this.analytics.generateOptimizationPlan();
    console.log('📋 Optimization plan:', plan);
    
    // 2. Apply cache size adjustments
    const currentCacheSize = this.cache.getStats().maxSize;
    if (plan.cacheSize !== currentCacheSize) {
      this.cache.setMaxSize(plan.cacheSize);
      adjustmentCount++;
      console.log(`📏 Adjusted cache size: ${currentCacheSize} → ${plan.cacheSize}`);
    }
    
    // 3. Update memory thresholds
    const currentThresholds = this.memoryMonitor.getStatus().thresholds;
    const newWarningMB = Math.round(plan.memoryThresholds.warning / 1024 / 1024);
    const newCleanupMB = Math.round(plan.memoryThresholds.cleanup / 1024 / 1024);
    const currentWarningMB = Math.round(currentThresholds.warning / 1024 / 1024);
    const currentCleanupMB = Math.round(currentThresholds.cleanup / 1024 / 1024);
    
    if (newWarningMB !== currentWarningMB || newCleanupMB !== currentCleanupMB) {
      this.memoryMonitor.updateThresholds(plan.memoryThresholds);
      adjustmentCount++;
      console.log(`🎚️ Updated memory thresholds: ${newWarningMB}MB/${newCleanupMB}MB`);
    }
    
    // 4. Optimize partition priorities
    if (plan.partitionPriorities.size > 0) {
      this.thresholds.updatePartitionPriorities(plan.partitionPriorities);
      adjustmentCount++;
      console.log('🎯 Updated partition priorities');
    }
    
    // 5. Adjust preloading strategy
    this.thresholds.adjustPreloadingStrategy();
    adjustmentCount++;
    
    // 6. Perform memory cleanup if needed
    const memoryPressure = this.analytics.predictMemoryPressure();
    if (memoryPressure.riskLevel === 'high' || memoryPressure.riskLevel === 'critical') {
      this.memoryMonitor.forceCheck();
      adjustmentCount++;
      console.log('🧹 Performed memory cleanup');
    }
    
    return adjustmentCount;
  }

  /**
   * Get current system metrics for comparison
   */
  private getSystemMetrics(): {
    hitRate: number;
    memoryUsage: number;
    responseTime: number;
    cacheSize: number;
  } {
    const cacheStats = this.cache.getStats();
    const memoryStatus = this.memoryMonitor.getStatus();
    const preloaderStats = this.preloader.getPreloadingStats();
    
    return {
      hitRate: cacheStats.hitRate,
      memoryUsage: memoryStatus.currentMemory.heapUsed,
      responseTime: preloaderStats.averagePreloadTime,
      cacheSize: cacheStats.size
    };
  }

  /**
   * Calculate performance improvement percentage
   */
  private calculatePerformanceImprovement(before: any, after: any): number {
    const hitRateImprovement = ((after.hitRate - before.hitRate) / Math.max(before.hitRate, 0.01)) * 100;
    const responseTimeImprovement = ((before.responseTime - after.responseTime) / Math.max(before.responseTime, 1)) * 100;
    
    return (hitRateImprovement + responseTimeImprovement) / 2;
  }

  /**
   * Calculate memory reduction percentage
   */
  private calculateMemoryReduction(before: any, after: any): number {
    return ((before.memoryUsage - after.memoryUsage) / Math.max(before.memoryUsage, 1)) * 100;
  }

  /**
   * Generate health-based recommendations
   */
  private generateHealthRecommendations(
    cacheEfficiency: number,
    memoryHealth: number,
    responseTime: number,
    stability: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (cacheEfficiency < 70) {
      recommendations.push('Consider increasing cache size or improving preloading strategy');
    }
    
    if (memoryHealth < 50) {
      recommendations.push('High memory usage detected - consider reducing cache size');
    }
    
    if (responseTime < 60) {
      recommendations.push('Slow response times - optimize partition loading');
    }
    
    if (stability < 80) {
      recommendations.push('System instability detected - reduce optimization frequency');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System is performing optimally');
    }
    
    return recommendations;
  }

  /**
   * Get next scheduled optimization time
   */
  private getNextOptimizationTime(): number {
    return Date.now() + (2 * 60 * 60 * 1000); // 2 hours from now
  }

  /**
   * Calculate average improvement across all optimizations
   */
  private calculateAverageImprovement(): number {
    // This would track historical improvements in a real implementation
    return this.lastOptimizationResult?.performanceImprovement || 0;
  }
}