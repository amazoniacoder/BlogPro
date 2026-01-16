/**
 * Performance optimization service
 * Provides debouncing, throttling, and performance monitoring
 */

import { Disposable, LifecycleManager } from '../../lifecycle/LifecycleManager';

export interface PerformanceMetrics {
  readonly operationName: string;
  readonly duration: number;
  readonly timestamp: number;
}

export class PerformanceService implements Disposable {
  private static metrics: PerformanceMetrics[] = [];
  private static readonly MAX_METRICS = 100;
  
  constructor() {
    // Register with lifecycle manager
    const lifecycleManager = LifecycleManager.getInstance();
    lifecycleManager.register(this);
  }

  /**
   * Debounce function calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle function calls
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Measure and record performance of an operation
   */
  static measurePerformance<T>(
    operationName: string,
    operation: () => T
  ): T {
    const startTime = performance.now();
    
    try {
      const result = operation();
      
      // Handle async operations
      if (result instanceof Promise) {
        return result.finally(() => {
          this.recordMetric(operationName, performance.now() - startTime);
        }) as T;
      }
      
      // Handle sync operations
      this.recordMetric(operationName, performance.now() - startTime);
      return result;
    } catch (error) {
      this.recordMetric(`${operationName}_ERROR`, performance.now() - startTime);
      throw error;
    }
  }

  /**
   * Measure async operation performance
   */
  static async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      this.recordMetric(operationName, performance.now() - startTime);
      return result;
    } catch (error) {
      this.recordMetric(`${operationName}_ERROR`, performance.now() - startTime);
      throw error;
    }
  }

  /**
   * Create debounced format update function
   */
  static createDebouncedFormatUpdate(
    updateFunction: () => void,
    delay: number = 100
  ): () => void {
    return this.debounce(() => {
      this.measurePerformance('format_update', updateFunction);
    }, delay);
  }

  /**
   * Create throttled input handler
   */
  static createThrottledInputHandler(
    inputHandler: (event: Event) => void,
    limit: number = 16 // ~60fps
  ): (event: Event) => void {
    return this.throttle((event: Event) => {
      this.measurePerformance('input_handling', () => inputHandler(event));
    }, limit);
  }

  /**
   * Optimize DOM operations with batching
   */
  static batchDOMOperations(operations: (() => void)[]): void {
    this.measurePerformance('batch_dom_operations', () => {
      // Use requestAnimationFrame for optimal timing
      requestAnimationFrame(() => {
        operations.forEach(operation => operation());
      });
    });
  }

  /**
   * Record performance metric
   */
  private static async recordMetric(operationName: string, duration: number): Promise<void> {
    const metric: PerformanceMetrics = {
      operationName,
      duration,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Maintain max metrics limit
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Analytics disabled to prevent errors
    // TODO: Re-enable when analytics API is properly configured

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 16) {
      console.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get performance metrics
   */
  static getMetrics(): readonly PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get average performance for operation
   */
  static getAveragePerformance(operationName: string): number {
    const operationMetrics = this.metrics.filter(m => m.operationName === operationName);
    
    if (operationMetrics.length === 0) return 0;
    
    const total = operationMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / operationMetrics.length;
  }

  /**
   * Clear performance metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Check if performance is within acceptable limits
   */
  static isPerformanceAcceptable(operationName: string, maxDuration: number = 16): boolean {
    const avgDuration = this.getAveragePerformance(operationName);
    return avgDuration <= maxDuration;
  }

  /**
   * Create performance-optimized event handler
   */
  static createOptimizedHandler<T extends Event>(
    handler: (event: T) => void,
    options: {
      debounce?: number;
      throttle?: number;
      measurePerformance?: boolean;
      operationName?: string;
    } = {}
  ): (event: T) => void {
    let optimizedHandler = handler;

    // Add performance measurement
    if (options.measurePerformance && options.operationName) {
      const originalHandler = optimizedHandler;
      optimizedHandler = (event: T) => {
        this.measurePerformance(options.operationName!, () => originalHandler(event));
      };
    }

    // Add debouncing
    if (options.debounce) {
      optimizedHandler = this.debounce(optimizedHandler, options.debounce);
    }

    // Add throttling
    if (options.throttle) {
      optimizedHandler = this.throttle(optimizedHandler, options.throttle);
    }

    return optimizedHandler;
  }

  /**
   * Memory usage monitoring
   */
  static getMemoryUsage(): any | null {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  /**
   * Check for memory leaks
   */
  static checkMemoryLeaks(): boolean {
    const memory = this.getMemoryUsage();
    if (!memory) return false;

    // Simple heuristic: if used heap is > 80% of limit, potential leak
    return memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8;
  }
  
  /**
   * Dispose method for lifecycle management
   */
  dispose(): void {
    // Unregister from lifecycle manager
    const lifecycleManager = LifecycleManager.getInstance();
    lifecycleManager.unregister(this);
    
    // Clear metrics
    PerformanceService.clearMetrics();
  }
  
  /**
   * Destroy method for backward compatibility
   */
  destroy(): void {
    this.dispose();
  }
}
