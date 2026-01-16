import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  navigation?: PerformanceNavigationTiming;
  paint?: PerformancePaintTiming[];
  memory?: any;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint') as PerformancePaintTiming[];
      const memory = (performance as any).memory;

      setMetrics({
        navigation,
        paint,
        memory,
      });

      // Log performance metrics
      if (navigation) {
        console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
        console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
      }

      if (paint.length > 0) {
        paint.forEach(entry => {
          console.log(`${entry.name}:`, entry.startTime, 'ms');
        });
      }
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, []);

  return metrics;
};
