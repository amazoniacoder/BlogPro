// shared/types/api.ts - Updated with blog categories
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  sortOrder: number;
  children?: BlogCategory[];
  parent?: BlogCategory;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeNode extends BlogCategory {
  children: CategoryTreeNode[];
  level: number;
  path: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  categoryId?: number;
  category?: BlogCategory;
  imageUrl?: string;
  thumbnailUrl?: string;
  projectUrl?: string;
  technologies: string[];
  tags: string[];
  slug?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CategoryWithPosts extends BlogCategory {
  posts: BlogPost[];
}

// Existing interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchResponse {
  results: BlogPost[];
  total: number;
  query: string;
  category?: string;
}

export interface BackendBlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  category_id?: number;
  image_url?: string;
  thumbnail_url?: string;
  project_url?: string;
  technologies: string[];
  tags: string[];
  slug?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BackendBlogPostInput {
  title: string;
  description: string;
  content: string;
  categoryId?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  projectUrl?: string;
  technologies: string[];
  tags: string[];
  slug?: string;
  status: string;
}