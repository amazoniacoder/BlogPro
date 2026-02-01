import { WebSocket } from 'ws';

/**
 * Broadcast a message to all connected WebSocket clients
 * @param wsInstance WebSocket server instance
 * @param type Event type
 * @param data Event data
 */
export function broadcastUpdate(wsInstance: any, type: string, data: any): void {
  console.log('Broadcasting update:', type, data);
  
  // Try to get global WebSocket server if not provided
  if (!wsInstance) {
    console.log('No WebSocket instance provided, trying global wss');
    wsInstance = (global as any).wss;
  }
  
  if (!wsInstance || !wsInstance.clients) {
    console.error('No WebSocket server instance or clients available');
    return;
  }
  
  const message = JSON.stringify({
    type,
    data,
    timestamp: new Date().toISOString()
  });
  
  let clientCount = 0;
  
  wsInstance.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        clientCount++;
      } catch (error) {
        console.error('Error sending message to client:', error);
      }
    }
  });
  
  console.log(`Broadcasted ${type} event to ${clientCount} clients`);
}

/**
 * Broadcast media update events to all connected clients
 * @param action The action performed ('uploaded' | 'deleted' | 'updated')
 * @param mediaItem The media item data
 */
export function broadcastMediaUpdate(action: 'uploaded' | 'deleted' | 'updated', mediaItem: any): void {
  const wsInstance = (global as any).wss;
  
  broadcastUpdate(wsInstance, 'MEDIA_UPDATE', {
    action,
    item: mediaItem,
    category: mediaItem.category,
    source: mediaItem.source
  });
}

/**
 * Broadcast cache invalidation events
 * @param cacheKeys Array of cache keys that were invalidated
 */
export function broadcastCacheInvalidation(cacheKeys: string[]): void {
  const wsInstance = (global as any).wss;
  
  broadcastUpdate(wsInstance, 'CACHE_INVALIDATED', {
    keys: cacheKeys
  });
}

/**
 * Broadcast cart update events to all connected clients
 * @param action The action performed ('added' | 'updated' | 'removed' | 'cleared')
 * @param cartData The cart data
 */
export function broadcastCartUpdate(action: 'added' | 'updated' | 'removed' | 'cleared', cartData: any): void {
  const wsInstance = (global as any).wss;
  
  broadcastUpdate(wsInstance, 'CART_UPDATE', {
    action,
    cart: cartData,
    timestamp: new Date().toISOString()
  });
}

/**
 * Broadcast footer update events to all connected clients
 * @param action The action performed ('config_updated' | 'preview_updated' | 'block_updated')
 * @param footerData The footer data
 */
export function broadcastFooterUpdate(action: 'config_updated' | 'preview_updated' | 'block_updated', footerData: any): void {
  const wsInstance = (global as any).wss;
  
  broadcastUpdate(wsInstance, `footer:${action}`, {
    action,
    data: footerData,
    timestamp: new Date().toISOString()
  });
}

/**
 * Broadcast to all connected WebSocket clients (alias for broadcastUpdate)
 * @param type Event type
 * @param data Event data
 */
export function broadcastToAll(type: string, data: any): void {
  const wsInstance = (global as any).wss;
  broadcastUpdate(wsInstance, type, data);
}

/**
 * Create a WebSocket handler for a specific route
 * @param app Express application with WebSocket support
 * @param path WebSocket path
 */
export function createWebSocketHandler(app: any, path: string = '/'): void {
  console.log(`Setting up WebSocket handler on path: ${path}`);
  
  if (!app.ws) {
    console.error('app.ws is not defined! Express-ws may not be properly initialized.');
    return;
  }
  
  app.ws(path, (ws: WebSocket) => {
    console.log(`WebSocket connection established on ${path}`);
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: '_connected',
      data: { status: 'connected' },
      timestamp: new Date().toISOString()
    }));
    
    // Set up ping/pong to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle ping messages
        if (data.type === 'ping') {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
          }
          return;
        }
        
        // Handle other messages
        console.log('Received WebSocket message:', data.type);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('pong', () => {
      // Connection is alive
    });
    
    ws.on('close', () => {
      console.log(`WebSocket connection closed on ${path}`);
      clearInterval(pingInterval);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(pingInterval);
    });
  });
}