// client/src/services/menuWebSocketHandler.ts
import { websocketService } from './websocket-service';

export interface MenuUpdateEvent {
  type: 'menu_updated' | 'menu_bulk_synced' | 'category_menu_updated';
  data: {
    documentationId?: number;
    categoryId?: number;
    action?: 'created' | 'updated' | 'deleted';
    timestamp: string;
  };
}

class MenuWebSocketHandler {
  private listeners: Set<(event: MenuUpdateEvent) => void> = new Set();

  constructor() {
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners() {
    // Listen for menu update events
    websocketService.subscribe('menu_updated', (data) => {
      this.notifyListeners({
        type: 'menu_updated',
        data
      });
    });

    // Listen for bulk sync events
    websocketService.subscribe('menu_bulk_synced', (data) => {
      this.notifyListeners({
        type: 'menu_bulk_synced',
        data
      });
    });

    // Listen for category menu updates
    websocketService.subscribe('category_menu_updated', (data) => {
      this.notifyListeners({
        type: 'category_menu_updated',
        data
      });
    });
  }

  /**
   * Subscribe to menu update events
   */
  subscribe(callback: (event: MenuUpdateEvent) => void) {
    this.listeners.add(callback);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of menu updates
   */
  private notifyListeners(event: MenuUpdateEvent) {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in menu WebSocket listener:', error);
      }
    });
  }

  /**
   * Clear all listeners
   */
  clearListeners() {
    this.listeners.clear();
  }
}

export const menuWebSocketHandler = new MenuWebSocketHandler();
