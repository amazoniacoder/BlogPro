/**
 * Performance Types
 * Type definitions for performance monitoring and metrics collection
 */

export interface PerformanceMetrics {
  readonly renderTime: number[];
  readonly memoryUsage: MemoryUsage[];
  readonly operationLatency: Map<string, number[]>;
  readonly errorRate: number;
  readonly timestamp: number;
}

export interface MemoryUsage {
  readonly used: number;
  readonly total: number;
  readonly timestamp: number;
}

export interface OperationMetric {
  readonly name: string;
  readonly duration: number;
  readonly timestamp: number;
  readonly success: boolean;
}

export interface PerformanceThresholds {
  readonly renderTime: number; // ms
  readonly memoryUsage: number; // MB
  readonly operationLatency: number; // ms
  readonly errorRate: number; // percentage
}

export interface PerformanceAlert {
  readonly type: 'render' | 'memory' | 'latency' | 'error';
  readonly message: string;
  readonly value: number;
  readonly threshold: number;
  readonly timestamp: number;
}

export interface PerformanceReport {
  readonly metrics: PerformanceMetrics;
  readonly alerts: PerformanceAlert[];
  readonly summary: {
    readonly avgRenderTime: number;
    readonly peakMemoryUsage: number;
    readonly slowestOperation: string;
    readonly errorCount: number;
  };
}
