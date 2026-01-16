/**
 * Performance Monitor Service
 * Tracks operation performance and memory usage
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  memoryUsage?: number;
}

interface PerformanceStats {
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  totalOperations: number;
  memoryTrend: number[];
}

export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetric[]> = new Map();
  private static maxMetrics = 100; // Keep last 100 metrics per operation

  static trackOperation<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    const result = fn();
    
    const duration = performance.now() - start;
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    this.recordMetric({
      name,
      duration,
      timestamp: Date.now(),
      memoryUsage: endMemory - startMemory
    });
    
    return result;
  }

  static async trackAsyncOperation<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    const result = await fn();
    
    const duration = performance.now() - start;
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    this.recordMetric({
      name,
      duration,
      timestamp: Date.now(),
      memoryUsage: endMemory - startMemory
    });
    
    return result;
  }

  private static recordMetric(metric: PerformanceMetric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }
    
    const operationMetrics = this.metrics.get(metric.name)!;
    operationMetrics.push(metric);
    
    // Keep only last N metrics
    if (operationMetrics.length > this.maxMetrics) {
      operationMetrics.shift();
    }
  }

  static getStats(operationName: string): PerformanceStats | null {
    const metrics = this.metrics.get(operationName);
    if (!metrics || metrics.length === 0) return null;

    const durations = metrics.map(m => m.duration);
    const memoryUsages = metrics.map(m => m.memoryUsage || 0);

    return {
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      totalOperations: metrics.length,
      memoryTrend: memoryUsages.slice(-10) // Last 10 memory measurements
    };
  }

  static getAllStats(): Record<string, PerformanceStats> {
    const stats: Record<string, PerformanceStats> = {};
    for (const [name] of this.metrics) {
      const operationStats = this.getStats(name);
      if (operationStats) {
        stats[name] = operationStats;
      }
    }
    return stats;
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }

  static destroy(): void {
    this.clearMetrics();
  }
}
