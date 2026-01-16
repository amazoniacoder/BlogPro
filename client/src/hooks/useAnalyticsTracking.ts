import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface TrackingData {
  sessionId: string;
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  screenResolution?: string;
}

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let deviceType = 'desktop';
  
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    deviceType = 'mobile';
  }
  
  return {
    deviceType,
    screenResolution: `${screen.width}x${screen.height}`,
    userAgent: ua
  };
};

export const useAnalyticsTracking = () => {
  const [location] = useLocation();
  const sessionIdRef = useRef<string>();
  const lastTrackedPath = useRef<string>();

  // Initialize session ID
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = sessionStorage.getItem('analytics_session_id') || generateSessionId();
      sessionStorage.setItem('analytics_session_id', sessionIdRef.current);
    }
  }, []);

  // Track page views
  useEffect(() => {
    const trackPageView = async () => {
      if (!sessionIdRef.current || lastTrackedPath.current === location) {
        return;
      }

      // Exclude admin panel from analytics tracking
      if (location.startsWith('/admin')) {
        return;
      }

      lastTrackedPath.current = location;
      const deviceInfo = getDeviceInfo();

      const trackingData: TrackingData = {
        sessionId: sessionIdRef.current,
        pagePath: location,
        pageTitle: document.title,
        referrer: document.referrer || undefined,
        screenResolution: deviceInfo.screenResolution
      };

      console.log('📊 Tracking page view:', trackingData.pagePath);
      
      try {
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...trackingData,
            userAgent: deviceInfo.userAgent,
            deviceType: deviceInfo.deviceType
          })
        });
        
        if (response.ok) {
          console.log('✅ Analytics tracking successful');
        } else {
          console.error('❌ Analytics tracking failed:', response.status);
        }
      } catch (error) {
        console.error('Analytics tracking failed:', error);
      }
    };

    // Small delay to ensure page title is updated
    const timer = setTimeout(trackPageView, 100);
    return () => clearTimeout(timer);
  }, [location]);

  return {
    sessionId: sessionIdRef.current,
    trackEvent: async (eventData: any) => {
      // Future: track custom events
      console.log('Custom event tracking:', eventData);
    }
  };
};
