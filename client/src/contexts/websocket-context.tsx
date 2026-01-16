import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import websocketService from '../services/websocket-service';
import WebSocketHealthMonitor from '../services/websocket-health';

interface WebSocketContextType {
  connected: boolean;
  lastMessage: any;
}

const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  lastMessage: null
});

/**
 * WebSocket Provider Component
 * Manages WebSocket connection and provides connection status to children
 */
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [location] = useLocation();
  
  useEffect(() => {
    // Check if WebSocket should be enabled for this route
    const shouldEnable = websocketService.shouldEnableForCurrentRoute();
    
    if (shouldEnable) {
      // Connect to WebSocket server
      websocketService.connect();
      

      
      // Start health monitoring
      const healthMonitor = new WebSocketHealthMonitor(websocketService);
      healthMonitor.start();
      
      // Set initial connection status
      setConnected(websocketService.isConnected());
      
      // Subscribe to connection status events
      const handleOpen = () => setConnected(true);
      const handleClose = () => setConnected(false);
      const handleMessage = (message: any) => setLastMessage(message);
      
      websocketService.subscribe('_open', handleOpen);
      websocketService.subscribe('_close', handleClose);
      websocketService.subscribe('_connected', handleOpen);
      websocketService.subscribe('MEDIA_UPDATE', handleMessage);
      websocketService.subscribe('CACHE_INVALIDATED', handleMessage);
      
      // Clean up on unmount or route change
      return () => {
        websocketService.unsubscribe('_open', handleOpen);
        websocketService.unsubscribe('_close', handleClose);
        websocketService.unsubscribe('_connected', handleOpen);
        websocketService.unsubscribe('MEDIA_UPDATE', handleMessage);
        websocketService.unsubscribe('CACHE_INVALIDATED', handleMessage);
        // Health monitor will be cleaned up automatically
        
        // Disconnect if navigating away from enabled routes
        if (!websocketService.shouldEnableForCurrentRoute()) {
          websocketService.disconnect();
        }
      };
    } else {
      // Disconnect if on a non-enabled route
      websocketService.disconnect();
      setConnected(false);
    }
  }, [location]);
  
  return (
    <WebSocketContext.Provider value={{ connected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * Hook to access WebSocket context
 */
export const useWebSocket = () => useContext(WebSocketContext);
