import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartApi, type CartItem } from '../services/api/cart';
import websocketService from '../services/websocket-service';



interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    fetchCart();
    
    // Subscribe to WebSocket cart updates
    const handleCartUpdate = (data: any) => {
      if (data.cart && data.cart.items) {
        setItems(data.cart.items);
      }
    };

    websocketService.subscribe('CART_UPDATE', handleCartUpdate);
    
    return () => {
      websocketService.unsubscribe('CART_UPDATE', handleCartUpdate);
    };
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cart = await cartApi.getCart();
      setItems(cart.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      const cart = await cartApi.addItem(productId, quantity);
      setItems(cart.items || []);
    } catch (error: any) {
      if (error.status === 409) {
        // Product already in cart - this is expected behavior
        return;
      }
      console.error('Failed to add item to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      const cart = await cartApi.updateItem(itemId, quantity);
      setItems(cart.items || []);
    } catch (error) {
      console.error('Failed to update cart item:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setLoading(true);
      const cart = await cartApi.removeItem(itemId);
      setItems(cart.items || []);
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartApi.clearCart();
      setItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const isInCart = (productId: string): boolean => {
    return items.some(item => item.productId === productId);
  };

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalAmount,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      loading,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
