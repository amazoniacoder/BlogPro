/**
 * Performance Collector Service
 * Collects and manages performance metrics with real-time monitoring
 */

import { 
  PerformanceMetrics, 
  MemoryUsage, 
  OperationMetric, 
  PerformanceThresholds,
  PerformanceAlert 
} from '../../types/PerformanceTypes';
import { APMService } from './APMService';

export class PerformanceCollector {
  private static instance: PerformanceCollector;
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private alerts: PerformanceAlert[] = [];
  private listeners = new Set<(metrics: PerformanceMetrics) => void>();

  private constructor() {
    this.metrics = {
      renderTime: [],
      memoryUsage: [],
      operationLatency: new Map(),
      errorRate: 0,
      timestamp: Date.now()
    };

    this.thresholds = {
      renderTime: 16, // 60fps target
      memoryUsage: 100, // 100MB
      operationLatency: 200, // 200ms
      errorRate: 5 // 5%
    };
  }

  static getInstance(): PerformanceCollector {
    if (!this.instance) {
      this.instance = new PerformanceCollector();
    }
    return this.instance;
  }

  collectRenderMetrics(startTime: number): void {
    const renderTime = performance.now() - startTime;
    this.metrics.renderTime.push(renderTime);
    
    // Keep only last 100 measurements
    if (this.metrics.renderTime.length > 100) {
      this.metrics.renderTime.shift();
    }

    // Send to APM
    const apmService = APMService.getInstance();
    apmService?.trackRenderTime(renderTime);

    if (renderTime > this.thresholds.renderTime) {
      this.addAlert('render', `Slow render detected: ${renderTime.toFixed(2)}ms`, renderTime);
    }

    this.notifyListeners();
  }

  collectMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usage: MemoryUsage = {
        used: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
        total: memory.totalJSHeapSize / 1024 / 1024,
        timestamp: Date.now()
      };

      this.metrics.memoryUsage.push(usage);
      
      // Keep only last 50 measurements
      if (this.metrics.memoryUsage.length > 50) {
        this.metrics.memoryUsage.shift();
      }

      // Send to APM
      const apmService = APMService.getInstance();
      apmService?.trackMemoryUsage(usage.used);

      if (usage.used > this.thresholds.memoryUsage) {
        this.addAlert('memory', `High memory usage: ${usage.used.toFixed(2)}MB`, usage.used);
      }
    }
  }

  collectOperationMetric(operation: OperationMetric): void {
    const { name, duration, success } = operation;
    
    if (!this.metrics.operationLatency.has(name)) {
      this.metrics.operationLatency.set(name, []);
    }
    
    const latencies = this.metrics.operationLatency.get(name)!;
    latencies.push(duration);
    
    // Keep only last 50 measurements per operation
    if (latencies.length > 50) {
      latencies.shift();
    }

    // Send to APM
    const apmService = APMService.getInstance();
    apmService?.trackOperation(name, duration, { success: success.toString() });

    if (duration > this.thresholds.operationLatency) {
      this.addAlert('latency', `Slow operation ${name}: ${duration.toFixed(2)}ms`, duration);
    }

    // Update error rate
    if (!success) {
      this.updateErrorRate();
    }

    this.notifyListeners();
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  subscribe(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private addAlert(
    type: PerformanceAlert['type'], 
    message: string, 
    value: number
  ): void {
    const getThreshold = (alertType: PerformanceAlert['type']): number => {
      switch (alertType) {
        case 'render': return this.thresholds.renderTime;
        case 'memory': return this.thresholds.memoryUsage;
        case 'latency': return this.thresholds.operationLatency;
        case 'error': return this.thresholds.errorRate;
        default: return 0;
      }
    };

    const alert: PerformanceAlert = {
      type,
      message,
      value,
      threshold: getThreshold(type),
      timestamp: Date.now()
    };

    this.alerts.push(alert);
    
    // Keep only last 20 alerts
    if (this.alerts.length > 20) {
      this.alerts.shift();
    }
  }

  private updateErrorRate(): void {
    // Simple error rate calculation - could be enhanced
    const totalOperations = Array.from(this.metrics.operationLatency.values())
      .reduce((sum, latencies) => sum + latencies.length, 0);
    
    if (totalOperations > 0) {
      const newErrorRate = (this.alerts.filter(a => a.type === 'error').length / totalOperations) * 100;
      this.metrics = { ...this.metrics, errorRate: newErrorRate };
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getMetrics()));
  }

  destroy(): void {
    this.listeners.clear();
    this.alerts = [];
  }
}
