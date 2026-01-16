// client/src/hooks/useMenuUpdates.ts
import { useEffect, useCallback } from 'react';
import { menuWebSocketHandler, type MenuUpdateEvent } from '../services/menuWebSocketHandler';

export interface UseMenuUpdatesOptions {
  onMenuUpdate?: (event: MenuUpdateEvent) => void;
  onBulkSync?: () => void;
  onCategoryUpdate?: (categoryId: number) => void;
}

export const useMenuUpdates = (options: UseMenuUpdatesOptions = {}) => {
  const { onMenuUpdate, onBulkSync, onCategoryUpdate } = options;

  const handleMenuEvent = useCallback((event: MenuUpdateEvent) => {
    console.log('📋 Menu update received:', event);

    // Call general menu update handler
    onMenuUpdate?.(event);

    // Handle specific event types
    switch (event.type) {
      case 'menu_bulk_synced':
        onBulkSync?.();
        break;
      
      case 'category_menu_updated':
        if (event.data.categoryId) {
          onCategoryUpdate?.(event.data.categoryId);
        }
        break;
    }
  }, [onMenuUpdate, onBulkSync, onCategoryUpdate]);

  useEffect(() => {
    const unsubscribe = menuWebSocketHandler.subscribe(handleMenuEvent);
    
    return unsubscribe;
  }, [handleMenuEvent]);
};
