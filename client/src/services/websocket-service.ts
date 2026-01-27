import { websocketHealthMonitor } from './websocket-health-monitor';

/**
 * WebSocket service for real-time updates
 */
class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private enabledRoutes = [
    '/blog',
    '/blog/',
    '/admin/blog',
    '/admin/blog/edit',
    '/admin/categories',
    '/admin/users',
    '/admin/users/edit',
    '/admin/site-editor',
    '/admin/analytics',
    '/admin/documentation',
    '/admin/documentation/categories',
    '/admin/comments',
    '/profile',
    '/products',
    '/cart',
    '/checkout',
    '/'
  ];


  
  /**
   * Check if current route should have WebSocket enabled
   */
  shouldEnableForCurrentRoute(): boolean {
    const path = window.location.pathname;
    return this.enabledRoutes.some(route => path.startsWith(route)) || 
           path.includes('/admin/blog') || 
           path.includes('/admin/categories') || 
           path.includes('/admin/users') || 
           path.includes('/admin/site-editor') || 
           path.includes('/admin/analytics') || 
           path.includes('/admin/documentation') ||
           !!path.match(/^\/blog\/\d+$/); // Enable for blog detail pages like /blog/123
  }
  
  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }
    
    this.connectionState = 'connecting';
    
    // Wait for server to be ready
    this.waitForServer().then(() => {
      this.establishConnection();
    }).catch(() => {
      console.error('Server not ready, retrying connection...');
      this.connectionState = 'disconnected';
      this.attemptReconnect();
    });
  }

  private async waitForServer(): Promise<void> {
    const maxAttempts = 10;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          console.log('✅ Server is ready, establishing WebSocket connection');
          return;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Server not ready after maximum attempts');
  }

  private establishConnection(): void {
    const wsUrl = import.meta.env.VITE_WS_URL || 'wss://blogpro.tech';
    const fullWsUrl = wsUrl.endsWith('/ws') ? wsUrl : `${wsUrl}/ws`;
    console.log(`🔌 Connecting to WebSocket at: ${fullWsUrl}`);
    console.log(`🔌 Environment VITE_WS_URL:`, import.meta.env.VITE_WS_URL);
    
    websocketHealthMonitor.recordConnectionAttempt();
    
    try {
      this.socket = new WebSocket(fullWsUrl);
      
      this.socket.onopen = () => {
        console.log('✅ WebSocket connected successfully to:', fullWsUrl);
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        websocketHealthMonitor.recordSuccessfulConnection();
        this.startHeartbeat();
        this.notifyListeners('_open', { status: 'connected' });
      };
      
      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message.type, message);
          // Log analytics, user, product, and comment updates
          if (message.type === 'user_updated' || message.type === 'analytics_updated' || message.type === 'visitor_count_updated' ||
              message.type === 'product_created' || message.type === 'product_updated' || message.type === 'product_deleted' ||
              message.type === 'category_created' || message.type === 'category_updated' || message.type === 'category_deleted' ||
              message.type === 'comment_created' || message.type === 'comment_updated' || message.type === 'comment_deleted' || message.type === 'comment_approved' ||
              message.type === 'blog_updated' || message.type === 'blog_deleted' || message.type === 'blog_created') {
            console.log('📨 WebSocket:', message.type, message.data);
          }
          this.notifyListeners(message.type, message.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        console.log(`❌ WebSocket disconnected: ${event.code}`);
        this.connectionState = 'disconnected';
        this.stopHeartbeat();
        this.notifyListeners('_close', { code: event.code, reason: event.reason });
        this.attemptReconnect();
      };
      
      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.connectionState = 'disconnected';
        this.stopHeartbeat();
        websocketHealthMonitor.recordConnectionError(error.toString());
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.connectionState = 'disconnected';
      this.attemptReconnect();
    }
  }
  
  /**
   * Send a message to the WebSocket server
   * @param type Message type
   * @param data Message data
   */
  sendMessage(type: string, data: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message, WebSocket is not connected');
      return false;
    }
    
    try {
      const message = JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString()
      });
      
      this.socket.send(message);
      console.log(`Sent WebSocket message: ${type}`);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }
  
  /**
   * Attempt to reconnect to WebSocket server
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.connectionState = 'disconnected';
  }
  
  /**
   * Subscribe to WebSocket events
   * @param eventType Event type to subscribe to
   * @param callback Callback function to execute when event occurs
   */
  subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)?.add(callback);
  }
  
  /**
   * Unsubscribe from WebSocket events
   * @param eventType Event type to unsubscribe from
   * @param callback Callback function to remove
   */
  unsubscribe(eventType: string, callback: (data: any) => void) {
    this.listeners.get(eventType)?.delete(callback);
  }
  
  /**
   * Notify all listeners of an event
   * @param eventType Event type
   * @param data Event data
   */
  private notifyListeners(eventType: string, data: any) {
    const listeners = this.listeners.get(eventType);
    
    // Only log for non-ping events and when there are actual listeners
    if (eventType !== 'ping' && listeners && listeners.size > 0) {
      console.log(`Notifying listeners for event: ${eventType}`, data);
    }
    
    if (!listeners || listeners.size === 0) {
      return;
    }
    
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in WebSocket listener callback:', error);
      }
    });
  }
  
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.connectionState === 'connected' && this.socket?.readyState === WebSocket.OPEN;
  }
  
  /**
   * Get connection health status
   */
  getHealthStatus() {
    return websocketHealthMonitor.getHealthStatus();
  }

  /**
   * Clear all listeners - called on client startup to prevent accumulation
   */
  clearAllListeners() {
    console.log('🧹 Clearing all WebSocket listeners');
    this.listeners.clear();
  }
}

export const websocketService = new WebSocketService();

// Clear listeners on startup to prevent accumulation
websocketService.clearAllListeners();

export default websocketService;
