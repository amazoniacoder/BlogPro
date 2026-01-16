import { ProductCategory } from './product-category';

export interface Product {
  id: string;
  title: string;
  description: string;
  content: string; // Rich text from editor
  image: string; // Media Library path
  slug: string;
  categoryId: string;
  category?: ProductCategory;
  price?: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  // E-commerce inventory fields
  stockQuantity: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  sku?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  title: string;
  description: string;
  content: string;
  image: string;
  slug: string;
  categoryId: string;
  price?: number;
  features?: string[];
  isActive?: boolean;
  sortOrder?: number;
  stockQuantity?: number;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  sku?: string;
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  content?: string;
  image?: string;
  slug?: string;
  categoryId?: string;
  price?: number;
  features?: string[];
  isActive?: boolean;
  sortOrder?: number;
  stockQuantity?: number;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  sku?: string;
}