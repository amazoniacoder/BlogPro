import { useEffect, useCallback, useRef } from 'react';
import { APMService } from '../services/monitoring/APMService';

export interface UseAPMMonitoringReturn {
  readonly trackOperation: (name: string, duration: number, tags?: Record<string, string>) => void;
  readonly trackError: (error: Error, context: string) => void;
  readonly trackUserInteraction: (action: string, element: string) => void;
  readonly trackFeatureUsage: (feature: string, metadata?: Record<string, string>) => void;
}

export const useAPMMonitoring = (): UseAPMMonitoringReturn => {
  const apmServiceRef = useRef<APMService | null>(null);

  useEffect(() => {
    apmServiceRef.current = APMService.getInstance();
  }, []);

  const trackOperation = useCallback((
    name: string, 
    duration: number, 
    tags?: Record<string, string>
  ): void => {
    apmServiceRef.current?.trackOperation(name, duration, tags);
  }, []);

  const trackError = useCallback((error: Error, context: string): void => {
    apmServiceRef.current?.trackError(error, context);
  }, []);

  const trackUserInteraction = useCallback((action: string, element: string): void => {
    apmServiceRef.current?.trackUserInteraction(action, element);
  }, []);

  const trackFeatureUsage = useCallback((
    feature: string, 
    metadata?: Record<string, string>
  ): void => {
    apmServiceRef.current?.trackFeatureUsage(feature, metadata);
  }, []);

  return {
    trackOperation,
    trackError,
    trackUserInteraction,
    trackFeatureUsage
  };
};
