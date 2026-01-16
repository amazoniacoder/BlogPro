/**
 * BlogPro Performance Monitor
 * Real-time performance monitoring utilities
 */

import React, { useEffect, useState, useCallback } from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage: number;
  bundleSize: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    memoryUsage: 0,
    bundleSize: 0
  });

  const measureRender = useCallback(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const renderTime = end - start;
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        componentCount: prev.componentCount + 1
      }));
      
      // Log slow renders
      if (renderTime > 16) {
        console.warn(`🐌 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
      
      return renderTime;
    };
  }, [componentName]);

  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
      }));
    }
  }, []);

  useEffect(() => {
    measureMemory();
    const interval = setInterval(measureMemory, 5000);
    return () => clearInterval(interval);
  }, [measureMemory]);

  return { metrics, measureRender };
};

export const PerformanceMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { metrics } = usePerformanceMonitor('Global');

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!isVisible) return <>{children}</>;

  return (
    <>
      {children}
      <div className="performance-monitor p-4">
        <div className="performance-monitor__header">
          <h3>Performance Monitor</h3>
          <button onClick={() => setIsVisible(false)}>×</button>
        </div>
        <div className="performance-monitor__metrics">
          <div>Render Time: {metrics.renderTime.toFixed(2)}ms</div>
          <div>Components: {metrics.componentCount}</div>
          <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
        </div>
      </div>
    </>
  );
};

// Performance optimization HOC
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    const { measureRender } = usePerformanceMonitor(componentName);
    
    useEffect(() => {
      const endMeasure = measureRender();
      return () => {
        endMeasure();
      };
    });

    return <WrappedComponent {...props} />;
  });
};

// Bundle size tracker
export const trackBundleSize = (bundleName: string) => {
  const start = performance.now();
  
  return {
    end: () => {
      const loadTime = performance.now() - start;
      console.log(`📦 Bundle ${bundleName} loaded in ${loadTime.toFixed(2)}ms`);
      
      // Store metrics for analysis
      if (typeof window !== 'undefined') {
        const metrics = JSON.parse(localStorage.getItem('bundle-metrics') || '{}');
        metrics[bundleName] = {
          loadTime,
          timestamp: Date.now()
        };
        localStorage.setItem('bundle-metrics', JSON.stringify(metrics));
      }
      
      return loadTime;
    }
  };
};

// Component render profiler
export const ProfiledComponent: React.FC<{
  name: string;
  children: React.ReactNode;
}> = ({ name, children }) => {
  const onRenderCallback = useCallback(
    (_id: string, phase: 'mount' | 'update' | 'nested-update', actualDuration: number) => {
      if (actualDuration > 16) {
        console.warn(`🐌 ${name} ${phase} took ${actualDuration.toFixed(2)}ms`);
      }
    },
    [name]
  );

  return (
    <React.Profiler id={name} onRender={onRenderCallback}>
      {children}
    </React.Profiler>
  );
};
