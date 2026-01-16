import { useEffect, useCallback, useRef } from 'react';
import { PerformanceCollector } from '../services/monitoring/PerformanceCollector';

export interface UsePerformanceMonitoringReturn {
  readonly trackRender: (startTime: number) => void;
  readonly trackOperation: (name: string, fn: () => void) => void;
  readonly trackAsyncOperation: (name: string, fn: () => Promise<void>) => Promise<void>;
}

export const usePerformanceMonitoring = (): UsePerformanceMonitoringReturn => {
  const collectorRef = useRef<PerformanceCollector>();
  const memoryIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    collectorRef.current = PerformanceCollector.getInstance();
    
    // Start memory monitoring
    memoryIntervalRef.current = setInterval(() => {
      collectorRef.current?.collectMemoryUsage();
    }, 5000); // Every 5 seconds

    return () => {
      if (memoryIntervalRef.current) {
        clearInterval(memoryIntervalRef.current);
      }
    };
  }, []);

  const trackRender = useCallback((startTime: number): void => {
    collectorRef.current?.collectRenderMetrics(startTime);
  }, []);

  const trackOperation = useCallback((name: string, fn: () => void): void => {
    const startTime = performance.now();
    let success = true;
    
    try {
      fn();
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = performance.now() - startTime;
      collectorRef.current?.collectOperationMetric({
        name,
        duration,
        timestamp: Date.now(),
        success
      });
    }
  }, []);

  const trackAsyncOperation = useCallback(async (
    name: string, 
    fn: () => Promise<void>
  ): Promise<void> => {
    const startTime = performance.now();
    let success = true;
    
    try {
      await fn();
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = performance.now() - startTime;
      collectorRef.current?.collectOperationMetric({
        name,
        duration,
        timestamp: Date.now(),
        success
      });
    }
  }, []);

  return {
    trackRender,
    trackOperation,
    trackAsyncOperation
  };
};
