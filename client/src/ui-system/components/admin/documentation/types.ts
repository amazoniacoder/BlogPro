/**
 * BlogPro Documentation Types
 * Comprehensive type definitions for documentation management
 */

import type { Documentation, DocumentationCategory } from '../../../../../../shared/types/documentation';

// Re-export shared types for convenience
export type { Documentation, DocumentationCategory };

// Component-specific types
export interface DocumentationCardProps {
  documentation: Documentation;
  categories: DocumentationCategory[];
  onEdit: (doc: Documentation) => void;
  onDelete: (id: number) => void;
}

export interface DocumentationFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id?: number;
  is_published: boolean;
  meta_title: string;
  meta_description: string;
}

export interface DocumentationFormProps {
  onSave: (data: DocumentationFormData) => Promise<void>;
  onCancel: () => void;
  categories: DocumentationCategory[];
  editingDoc?: Documentation | null;
}

export interface DocumentationListProps {
  documentation: Documentation[];
  categories: DocumentationCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onEdit: (doc: Documentation) => void;
  onDelete: (id: number) => void;
}

export interface DocumentationFiltersProps {
  categories: DocumentationCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

// Hook types
export interface UseDocumentationDataReturn {
  documentation: Documentation[];
  categories: DocumentationCategory[];
  loading: boolean;
  error: string | null;
  createDocument: (data: DocumentationFormData) => Promise<void>;
  updateDocument: (id: number, data: DocumentationFormData) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
}

// State types
export interface DocumentationState {
  showForm: boolean;
  editingDoc: Documentation | null;
  selectedCategory: string;
}

// Category management types
export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  order_index: number;
  parent_id?: number;
}

export interface CategoryFormProps {
  onSave: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  editingCategory?: DocumentationCategory | null;
}

export interface CategoryListProps {
  categories: DocumentationCategory[];
  onEdit: (category: DocumentationCategory) => void;
  onDelete: (id: number) => void;
}

// Action types for potential future state management
export type DocumentationAction =
  | { type: 'SHOW_FORM'; payload?: Documentation }
  | { type: 'HIDE_FORM' }
  | { type: 'SET_EDITING_DOC'; payload: Documentation | null }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string };
