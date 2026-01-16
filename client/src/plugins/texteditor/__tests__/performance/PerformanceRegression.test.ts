/**
 * Performance regression tests
 */

import { PerformanceMonitor } from '../../core/services/monitoring/PerformanceMonitor';
import { ServiceFactory } from '../../core/services/ServiceFactory';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
}

describe('Performance Regression Tests', () => {
  let formatService: any;

  beforeEach(() => {
    PerformanceMonitor.clearMetrics();
    document.body.innerHTML = '<div class="editor-content"><p>Test content</p></div>';
    formatService = ServiceFactory.getUnifiedFormatService();
  });

  test('should track applyBold performance', () => {
    // Execute operation multiple times
    for (let i = 0; i < 5; i++) {
      formatService.applyBold();
    }

    const stats = PerformanceMonitor.getStats('applyBold');
    expect(stats).toBeDefined();
    expect(stats!.totalOperations).toBe(5);
    expect(stats!.averageDuration).toBeGreaterThan(0);
  });

  test('should track getFormatState performance', () => {
    // Execute operation multiple times
    for (let i = 0; i < 10; i++) {
      formatService.getFormatState();
    }

    const stats = PerformanceMonitor.getStats('getFormatState');
    expect(stats).toBeDefined();
    expect(stats!.totalOperations).toBe(10);
    expect(stats!.averageDuration).toBeLessThan(16); // Should be under 16ms for 60fps
  });

  test('should handle async operations', async () => {
    const asyncOperation = () => new Promise(resolve => setTimeout(resolve, 10));
    
    await PerformanceMonitor.trackAsyncOperation('asyncTest', asyncOperation);
    
    const stats = PerformanceMonitor.getStats('asyncTest');
    expect(stats).toBeDefined();
    expect(stats!.averageDuration).toBeGreaterThanOrEqual(10);
  });

  test('should limit metrics storage', () => {
    // Execute more operations than the limit
    for (let i = 0; i < 150; i++) {
      PerformanceMonitor.trackOperation('testOp', () => {});
    }

    const stats = PerformanceMonitor.getStats('testOp');
    expect(stats!.totalOperations).toBeLessThanOrEqual(100); // Should be limited to 100
  });

  test('should clear all metrics', () => {
    formatService.applyBold();
    formatService.getFormatState();
    
    expect(Object.keys(PerformanceMonitor.getAllStats())).toHaveLength(2);
    
    PerformanceMonitor.clearMetrics();
    
    expect(Object.keys(PerformanceMonitor.getAllStats())).toHaveLength(0);
  });
});
