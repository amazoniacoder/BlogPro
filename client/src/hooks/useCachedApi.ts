import { useState, useEffect } from 'react';
import { cachedFetch, clientCache } from '../utils/clientCache';

interface UseCachedApiOptions {
  ttl?: number;
  tags?: string[];
  enabled?: boolean;
}

export const useCachedApi = <T>(
  url: string, 
  options: UseCachedApiOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { ttl = 300, tags = [], enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await cachedFetch<T>(url, {}, { ttl, tags });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, ttl, enabled]);

  const invalidate = () => {
    clientCache.invalidate(url);
    setData(null);
    setLoading(true);
  };

  const refetch = async () => {
    clientCache.invalidate(url);
    try {
      setLoading(true);
      setError(null);
      const result = await cachedFetch<T>(url, {}, { ttl, tags });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, invalidate, refetch };
};
