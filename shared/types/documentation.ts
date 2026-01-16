// shared/types/documentation.ts

export interface DocumentationCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order_index: number;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  children?: DocumentationCategory[];
}

export interface Documentation {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  category_id?: number;
  parent_id?: number;
  order_index: number;
  is_published: boolean;
  meta_title?: string;
  meta_description?: string;
  menu_item_id?: number;
  auto_menu: boolean;
  menu_title?: string;
  menu_parent_id?: number;
  created_at: string;
  updated_at: string;
  category?: DocumentationCategory;
  category_name?: string;
  category_slug?: string;
  children?: Documentation[];
}

export interface CreateDocumentationRequest {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  category_id?: number;
  parent_id?: number;
  order_index?: number;
  is_published?: boolean;
  meta_title?: string;
  meta_description?: string;
  auto_menu?: boolean;
  menu_title?: string;
  menu_parent_id?: number;
}

export interface UpdateDocumentationRequest extends Partial<CreateDocumentationRequest> {
  id: number;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order_index?: number;
  parent_id?: number;
}

// New Documentation System Types
export interface DocumentationSection {
  id: number;
  title: string;
  slug: string;
  description?: string;
  parentId?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentationContent {
  id: number;
  sectionId?: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  authorId?: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentationMenu {
  id: number;
  title: string;
  url?: string;
  parentId?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentationSearchIndex {
  id: number;
  contentId?: number;
  title: string;
  content: string;
  searchVector?: string;
  updatedAt: Date;
}

export interface DocumentationFile {
  id: number;
  contentId?: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

export interface DocumentationConversion {
  id: number;
  sourceFormat: string;
  targetFormat: string;
  sourceContent: string;
  convertedContent: string;
  status: string;
  createdAt: Date;
}

export interface DocumentationContentVersion {
  id: number;
  contentId?: number;
  version: number;
  title: string;
  content: string;
  changeLog?: string;
  authorId?: string;
  createdAt: Date;
}

export interface DocumentationContentLock {
  id: number;
  contentId?: number;
  userId?: string;
  lockedAt: Date;
  expiresAt: Date;
}

// Request/Response Types
export interface CreateDocumentationSectionRequest {
  title: string;
  slug: string;
  description?: string;
  parentId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateDocumentationSectionRequest extends Partial<CreateDocumentationSectionRequest> {
  id: number;
}

export interface CreateDocumentationContentRequest {
  sectionId?: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  isPublished?: boolean;
  publishedAt?: Date;
  authorId?: string;
}

export interface UpdateDocumentationContentRequest extends Partial<CreateDocumentationContentRequest> {
  id: number;
}

export interface CreateDocumentationMenuRequest {
  title: string;
  url?: string;
  parentId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateDocumentationMenuRequest extends Partial<CreateDocumentationMenuRequest> {
  id: number;
}

export interface DocumentationSearchRequest {
  query: string;
  sectionId?: number;
  limit?: number;
  offset?: number;
}

export interface DocumentationSearchResult {
  id: number;
  title: string;
  excerpt?: string;
  url: string;
  relevanceScore: number;
}