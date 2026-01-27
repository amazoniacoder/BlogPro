import React from 'react';
import { WebSocketProvider as FullWebSocketProvider } from '@/contexts/websocket-context';
import websocketService from '@/services/websocket-service';

interface WebSocketContextType {
  socket: typeof websocketService;
  connected: boolean;
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  return (
    <FullWebSocketProvider>
      {children}
    </FullWebSocketProvider>
  );
}

export function useWebSocket(): WebSocketContextType {
  return {
    socket: websocketService,
    connected: websocketService.isConnected()
  };
}