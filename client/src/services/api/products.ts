import { Product, CreateProductData, UpdateProductData } from '../../../../shared/types/product';

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  active?: boolean;
}

class ProductsService {
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async getAll(params: GetProductsParams = {}): Promise<ProductsResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.category) searchParams.set('category', params.category);
      if (params.search) searchParams.set('search', params.search);
      if (params.active !== undefined) searchParams.set('active', params.active.toString());
      
      return await this.makeRequest<ProductsResponse>(`/api/products?${searchParams.toString()}`);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  async getBySlug(slug: string): Promise<Product> {
    try {
      return await this.makeRequest<Product>(`/api/products/slug/${slug}`);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  async create(data: CreateProductData): Promise<Product> {
    try {
      return await this.makeRequest<Product>('/api/products', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    try {
      return await this.makeRequest<Product>(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.makeRequest<{ message: string }>(`/api/products/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
}

export const productsService = new ProductsService();
