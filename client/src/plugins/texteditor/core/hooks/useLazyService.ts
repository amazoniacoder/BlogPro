import { useState, useEffect } from 'react';

/**
 * Hook for lazy loading services with loading state
 */
export function useLazyService<T>(
  serviceLoader: () => Promise<T>
): { service: T | null; loading: boolean; error: Error | null } {
  const [service, setService] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadService = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const loadedService = await serviceLoader();
        if (mounted) {
          setService(loadedService);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadService();

    return () => {
      mounted = false;
    };
  }, [serviceLoader]);

  return { service, loading, error };
}
