import websocketService from '@/services/websocket-service';

interface WebSocketContextType {
  socket: typeof websocketService;
  connected: boolean;
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export function useWebSocket(): WebSocketContextType {
  return {
    socket: websocketService,
    connected: websocketService.isConnected()
  };
}