export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: ProductCategory;
  children?: ProductCategory[];
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductCategoryData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateProductCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}