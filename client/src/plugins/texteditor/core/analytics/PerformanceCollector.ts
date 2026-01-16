/**
 * Performance Collector
 * 
 * Collects real-time performance metrics for the editor.
 */

import { AnalyticsEngine, PerformanceMetric } from './AnalyticsEngine';

export class PerformanceCollector {
  private analytics: AnalyticsEngine;
  private activeOperations = new Map<string, number>();

  constructor() {
    this.analytics = new AnalyticsEngine();
  }

  startOperation(operationId: string, operationType: string): void {
    this.activeOperations.set(operationId, performance.now());
    // Store operation type for later use in endOperation
    this.activeOperations.set(`${operationId}_type`, operationType as any);
  }

  endOperation(operationId: string, operationType: string, metadata: Record<string, any> = {}): void {
    const startTime = this.activeOperations.get(operationId);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    this.activeOperations.delete(operationId);

    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      operation: operationType,
      duration,
      metadata: {
        ...metadata,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      }
    };

    this.analytics.record(metric);
  }

  recordInstantMetric(operationType: string, duration: number, metadata: Record<string, any> = {}): void {
    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      operation: operationType,
      duration,
      metadata
    };

    this.analytics.record(metric);
  }

  getAnalytics(timeRange: string = 'day') {
    return this.analytics.getAnalytics(timeRange);
  }

  async dispose(): Promise<void> {
    await this.analytics.dispose();
  }
}
