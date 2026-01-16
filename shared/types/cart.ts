// E-commerce Cart Types
import { Product } from './product';

export interface CartItem {
  id: string;
  userId?: string;
  sessionId?: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  estimatedTotal: number;
}