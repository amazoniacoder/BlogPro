import { httpClient } from '@/services/cache/http-client';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    image?: string;
  };
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export const cartApi = {
  async getCart(): Promise<Cart> {
    const response = await httpClient.get('/api/cart');
    return response.data || response;
  },

  async addItem(productId: string, quantity: number): Promise<Cart> {
    const response = await httpClient.post('/api/cart/add', { productId, quantity });
    return response.data || response;
  },

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    const response = await httpClient.put(`/api/cart/update/${itemId}`, { quantity });
    return response.data || response;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const response = await httpClient.delete(`/api/cart/remove/${itemId}`);
    return response.data || response;
  },

  async clearCart(): Promise<void> {
    await httpClient.delete('/api/cart/clear');
  }
};
