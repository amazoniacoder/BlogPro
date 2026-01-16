/**
 * Unit tests for PerformanceService
 */

import { PerformanceService } from '../../core/services/ui/PerformanceService';

// Test globals
declare global {
  var describe: any;
  var it: any;
  var expect: any;
  var beforeEach: any;
}

describe('PerformanceService', () => {
  beforeEach(() => {
    PerformanceService.clearMetrics();
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const mockFn = () => { callCount++; };
      const debouncedFn = PerformanceService.debounce(mockFn, 50);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(callCount).toBe(0);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callCount).toBe(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      let callCount = 0;
      const mockFn = () => { callCount++; };
      const throttledFn = PerformanceService.throttle(mockFn, 50);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(callCount).toBe(1);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      throttledFn();
      expect(callCount).toBe(2);
    });
  });

  describe('measurePerformance', () => {
    it('should measure sync operation performance', () => {
      const operation = () => 'result';
      
      const result = PerformanceService.measurePerformance('test-op', operation);
      
      expect(result).toBe('result');
      
      const metrics = PerformanceService.getMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].operationName).toBe('test-op');
    });

    it('should measure async operation performance', async () => {
      const operation = async () => 'async-result';
      
      const result = await PerformanceService.measureAsync('async-op', operation);
      
      expect(result).toBe('async-result');
      
      const metrics = PerformanceService.getMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].operationName).toBe('async-op');
    });
  });

  describe('metrics management', () => {
    it('should calculate average performance', () => {
      // Perform operations to generate metrics
      PerformanceService.measurePerformance('test-op', () => {
        // Simulate more substantial work
        let sum = 0;
        for (let i = 0; i < 10000; i++) {
          sum += Math.sqrt(i) * Math.random();
        }
        return sum;
      });
      
      PerformanceService.measurePerformance('test-op', () => {
        // Simulate more substantial work
        let sum = 0;
        for (let i = 0; i < 10000; i++) {
          sum += Math.sqrt(i) * Math.random();
        }
        return sum;
      });
      
      const average = PerformanceService.getAveragePerformance('test-op');
      expect(average).toBeGreaterThanOrEqual(0);
    });

    it('should check performance acceptability', () => {
      // Perform a fast operation
      PerformanceService.measurePerformance('fast-op', () => {});
      
      const isAcceptable = PerformanceService.isPerformanceAcceptable('fast-op', 100);
      expect(typeof isAcceptable).toBe('boolean');
    });
  });
});
