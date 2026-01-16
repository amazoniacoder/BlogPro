import { useState, useEffect, useCallback, useMemo } from 'react';
interface AnalyticsOverview {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  topReferrers: Array<{ referrer: string; visits: number }>;
  deviceStats: Record<string, number>;
  countryStats: Record<string, number>;
  chartData: any[];
}

export const useAnalyticsData = (days: number) => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const fetchData = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      if (!isRetry) {
        setError(null);
        setRetryCount(0);
      }
      
      // Check if offline
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }
      
      const token = localStorage.getItem('authToken');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`/api/analytics/overview?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      
      // Auto-retry logic for network errors
      if (retryCount < 3 && (errorMessage.includes('fetch') || errorMessage.includes('network'))) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData(true);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [days, retryCount]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (error?.includes('No internet connection')) {
        fetchData();
      }
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, fetchData]);

  useEffect(() => {
    fetchData();
  }, [days, fetchData]);

  // Separate effect for WebSocket to prevent multiple subscriptions
  useEffect(() => {
    let cleanup: (() => void) | null = null;
    
    const setupWebSocket = async () => {
      try {
        const { default: websocketService } = await import('@/services/websocket-service');
        
        const handleAnalyticsUpdate = (analyticsData: AnalyticsOverview) => {
          console.log('📊 Analytics updated via WebSocket:', analyticsData);
          setData(prevData => {
            if (!prevData) return analyticsData;
            
            // Merge instead of replace to prevent data loss
            return {
              ...prevData,
              ...analyticsData,
              // Preserve chart data if not provided in update
              chartData: analyticsData.chartData || prevData.chartData,
              // Update timestamp
              lastUpdated: Date.now()
            };
          });
          setError(null); // Clear any existing errors
        };
        
        const handleConnectionOpen = () => {
          console.log('🔗 WebSocket connected for analytics');
          setError(null);
        };
        
        const handleConnectionClose = () => {
          console.log('❌ WebSocket disconnected for analytics');
        };
        
        // Connect WebSocket if not already connected
        if (!websocketService.isConnected()) {
          websocketService.connect();
        }
        
        websocketService.subscribe('analytics_updated', handleAnalyticsUpdate);
        websocketService.subscribe('_open', handleConnectionOpen);
        websocketService.subscribe('_close', handleConnectionClose);
        
        cleanup = () => {
          websocketService.unsubscribe('analytics_updated', handleAnalyticsUpdate);
          websocketService.unsubscribe('_open', handleConnectionOpen);
          websocketService.unsubscribe('_close', handleConnectionClose);
        };
      } catch (error) {
        console.error('Failed to setup WebSocket for analytics:', error);
      }
    };
    
    setupWebSocket();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const memoizedResult = useMemo(() => ({
    data,
    loading,
    error,
    isOffline,
    retryCount,
    refetch: () => fetchData(false)
  }), [data, loading, error, isOffline, retryCount, fetchData]);

  return memoizedResult;
};
