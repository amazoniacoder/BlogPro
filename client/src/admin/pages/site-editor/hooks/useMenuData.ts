// client/src/admin/pages/site-editor/hooks/useMenuData.ts
import { useReducer, useEffect, useCallback } from 'react';
import { menuApi } from '../../../../services/api/menu';
import { useWebSocket } from '../../../../contexts/websocket-context';
import websocketService from '../../../../services/websocket-service';
import { siteEditorReducer, initialState } from '../state/reducer';

export const useMenuData = () => {
  const [state, dispatch] = useReducer(siteEditorReducer, initialState);
  const { connected } = useWebSocket();

  const fetchMenuItems = useCallback(async () => {
    dispatch({ type: 'MENU/FETCH_START' });
    try {
      const items = await menuApi.getFullMenuTree(); // Используем полное дерево для админки
      dispatch({ type: 'MENU/FETCH_SUCCESS', payload: items || [] });
    } catch (err: any) {
      dispatch({ type: 'MENU/FETCH_FAILURE', error: 'Ошибка загрузки меню' });
    }
  }, []);

  const createMenuItem = async (data: any) => {
    try {
      const newItem = await menuApi.createMenuItem(data);
      dispatch({ type: 'MENU/CREATE_SUCCESS', payload: newItem });
    } catch (err) {
      dispatch({ type: 'MENU/OPERATION_FAILURE', error: 'Ошибка создания пункта меню' });
      throw err;
    }
  };

  const updateMenuItem = async (id: number, data: any) => {
    try {
      const updatedItem = await menuApi.updateMenuItem(id, data);
      dispatch({ type: 'MENU/UPDATE_SUCCESS', payload: updatedItem });
    } catch (err) {
      dispatch({ type: 'MENU/OPERATION_FAILURE', error: 'Ошибка обновления пункта меню' });
      throw err;
    }
  };

  const deleteMenuItem = async (id: number) => {
    try {
      await menuApi.deleteMenuItem(id);
      dispatch({ type: 'MENU/DELETE_SUCCESS', itemId: id });
    } catch (err) {
      dispatch({ type: 'MENU/OPERATION_FAILURE', error: 'Ошибка удаления пункта меню' });
      throw err;
    }
  };

  const toggleMenuItemActive = async (id: number, isActive: boolean) => {
    try {
      const updatedItem = await menuApi.updateMenuItem(id, { is_active: isActive });
      dispatch({ type: 'MENU/UPDATE_SUCCESS', payload: updatedItem });
      
      // Broadcast menu update event for frontend
      window.dispatchEvent(new CustomEvent('menu_updated', { 
        detail: { menuItem: updatedItem, type: 'toggle_active' } 
      }));
    } catch (err) {
      dispatch({ type: 'MENU/OPERATION_FAILURE', error: 'Ошибка изменения статуса пункта меню' });
      throw err;
    }
  };

  const reorderMenuItems = async (items: { id: number; order_index: number; parent_id?: number }[]) => {
    try {
      await menuApi.reorderMenuItems(items);
      await fetchMenuItems();
    } catch (err) {
      dispatch({ type: 'MENU/OPERATION_FAILURE', error: 'Ошибка изменения порядка меню' });
      throw err;
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (!connected) return;
    
    // Existing menu events
    websocketService.subscribe('menuUpdated', fetchMenuItems);
    websocketService.subscribe('menuCreated', fetchMenuItems);
    websocketService.subscribe('menuDeleted', fetchMenuItems);
    
    // Documentation-specific events for menu synchronization
    websocketService.subscribe('documentation_deleted', fetchMenuItems);
    websocketService.subscribe('menu_updated', fetchMenuItems);
    websocketService.subscribe('category_menu_updated', fetchMenuItems);
    
    return () => {
      websocketService.unsubscribe('menuUpdated', fetchMenuItems);
      websocketService.unsubscribe('menuCreated', fetchMenuItems);
      websocketService.unsubscribe('menuDeleted', fetchMenuItems);
      websocketService.unsubscribe('documentation_deleted', fetchMenuItems);
      websocketService.unsubscribe('menu_updated', fetchMenuItems);
      websocketService.unsubscribe('category_menu_updated', fetchMenuItems);
    };
  }, [connected, fetchMenuItems]);

  return {
    ...state,
    dispatch,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemActive,
    reorderMenuItems,
    refetch: fetchMenuItems
  };
};
