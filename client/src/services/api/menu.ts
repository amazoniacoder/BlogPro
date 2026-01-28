// client/src/services/api/menu.ts
import { httpClient } from '../cache/http-client';
import type { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest, ReorderMenuRequest } from '../../types/menu';

export const menuApi = {
  // Public API - get menu tree (only active items)
  async getMenuTree(): Promise<MenuItem[]> {
    const response = await httpClient.get('/api/menu/tree', { bypassCache: true });
    return response;
  },

  // Admin API - get full menu tree (including inactive items)
  async getFullMenuTree(): Promise<MenuItem[]> {
    const response = await httpClient.get('/api/menu/admin/tree', { bypassCache: true });
    return response;
  },

  // Admin API - get all menu items (flat list)
  async getAllMenuItems(): Promise<MenuItem[]> {
    const response = await httpClient.get('/api/menu', { bypassCache: true });
    return response;
  },

  // Admin API - get menu item by ID
  async getMenuItemById(id: number): Promise<MenuItem> {
    const response = await httpClient.get(`/api/menu/${id}`, { bypassCache: true });
    return response;
  },

  // Admin API - create menu item
  async createMenuItem(data: CreateMenuItemRequest): Promise<MenuItem> {
    const response = await httpClient.post('/api/menu', data);
    return response;
  },

  // Admin API - update menu item
  async updateMenuItem(id: number, data: UpdateMenuItemRequest): Promise<MenuItem> {
    const response = await httpClient.put(`/api/menu/${id}`, data);
    return response;
  },

  // Admin API - delete menu item
  async deleteMenuItem(id: number): Promise<void> {
    await httpClient.delete(`/api/menu/${id}`);
  },

  // Admin API - reorder menu items
  async reorderMenuItems(items: ReorderMenuRequest['items']): Promise<void> {
    await httpClient.post('/api/menu/reorder', { items });
  }
};
