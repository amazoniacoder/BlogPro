/**
 * Real-time Updates Hook
 * WebSocket integration for live documentation updates
 */

import { useEffect, useRef, useState } from 'react';

interface DocumentationUpdate {
  type: 'content_updated' | 'content_created' | 'content_deleted' | 'section_updated';
  data: {
    id: string;
    title?: string;
    section_id?: string;
    updated_by?: string;
    timestamp: string;
  };
}

interface UseRealTimeUpdatesProps {
  onContentUpdate?: (update: DocumentationUpdate) => void;
  onSectionUpdate?: (update: DocumentationUpdate) => void;
  enabled?: boolean;
}

export const useRealTimeUpdates = ({
  onContentUpdate,
  onSectionUpdate,
  enabled = true
}: UseRealTimeUpdatesProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<DocumentationUpdate | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = () => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('📡 Documentation WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Subscribe to documentation updates
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          channel: 'documentation_updates'
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'ping') {
            // Respond to ping to keep connection alive
            wsRef.current?.send(JSON.stringify({ type: 'pong' }));
            return;
          }

          if (message.channel === 'documentation_updates') {
            const update: DocumentationUpdate = message.data;
            setLastUpdate(update);

            // Route updates to appropriate handlers
            if (update.type.includes('content') && onContentUpdate) {
              onContentUpdate(update);
            } else if (update.type.includes('section') && onSectionUpdate) {
              onSectionUpdate(update);
            }

            console.log('📄 Documentation update received:', update);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('📡 Documentation WebSocket disconnected:', event.code);
        setIsConnected(false);
        
        // Attempt to reconnect with exponential backoff
        if (enabled && reconnectAttempts.current < 5) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          reconnectAttempts.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`🔄 Attempting to reconnect (attempt ${reconnectAttempts.current})`);
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('📡 Documentation WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    lastUpdate,
    connect,
    disconnect
  };
};
