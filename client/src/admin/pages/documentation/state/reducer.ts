// client/src/admin/pages/documentation/state/reducer.ts
// Types
interface Documentation {
  id: number;
  title: string;
  content?: string;
  categoryId?: number;
  status?: 'draft' | 'published';
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DocumentationCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface DocumentationState {
  documents: Documentation[];
  categories: DocumentationCategory[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  selectedCategory: string;
}

export type DocumentationAction =
  | { type: 'DOCUMENTATION/FETCH_START' }
  | { type: 'DOCUMENTATION/FETCH_SUCCESS'; payload: Documentation[]; categories: DocumentationCategory[] }
  | { type: 'DOCUMENTATION/FETCH_FAILURE'; error: string }
  | { type: 'DOCUMENTATION/CREATE_SUCCESS'; document: Documentation }
  | { type: 'DOCUMENTATION/UPDATE_SUCCESS'; document: Documentation }
  | { type: 'DOCUMENTATION/DELETE_START'; id: number }
  | { type: 'DOCUMENTATION/DELETE_SUCCESS'; id: number }
  | { type: 'DOCUMENTATION/DELETE_FAILURE'; error: string }
  | { type: 'DOCUMENTATION/SET_CATEGORY'; category: string }
  | { type: 'DOCUMENTATION/CLEAR_ERROR' };

export const initialState: DocumentationState = {
  documents: [],
  categories: [],
  loading: false,
  error: null,
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  totalPages: 1,
  selectedCategory: 'all'
};

export const documentationReducer = (
  state: DocumentationState,
  action: DocumentationAction
): DocumentationState => {
  switch (action.type) {
    case 'DOCUMENTATION/FETCH_START':
      return { ...state, loading: true, error: null };

    case 'DOCUMENTATION/FETCH_SUCCESS':
      return {
        ...state,
        documents: action.payload || [],
        categories: action.categories || [],
        totalItems: (action.payload || []).length,
        totalPages: Math.ceil((action.payload || []).length / state.itemsPerPage),
        loading: false,
        error: null
      };

    case 'DOCUMENTATION/FETCH_FAILURE':
      return { ...state, loading: false, error: action.error };

    case 'DOCUMENTATION/CREATE_SUCCESS': {
      const updatedDocuments = [action.document, ...state.documents];
      return {
        ...state,
        documents: updatedDocuments,
        totalItems: updatedDocuments.length,
        totalPages: Math.ceil(updatedDocuments.length / state.itemsPerPage),
        loading: false
      };
    }

    case 'DOCUMENTATION/UPDATE_SUCCESS': {
      const updatedDocuments = (state.documents || [])
        .filter(doc => doc != null)
        .map(doc => doc.id === action.document.id ? action.document : doc);
      return {
        ...state,
        documents: updatedDocuments,
        loading: false
      };
    }

    case 'DOCUMENTATION/DELETE_START':
      return { ...state, loading: true };

    case 'DOCUMENTATION/DELETE_SUCCESS': {
      const updatedDocuments = (state.documents || [])
        .filter(doc => doc != null && doc.id !== action.id);
      return {
        ...state,
        documents: updatedDocuments,
        totalItems: updatedDocuments.length,
        totalPages: Math.ceil(updatedDocuments.length / state.itemsPerPage),
        loading: false
      };
    }

    case 'DOCUMENTATION/DELETE_FAILURE':
      return { ...state, loading: false, error: action.error };

    case 'DOCUMENTATION/SET_CATEGORY':
      return { ...state, selectedCategory: action.category };

    case 'DOCUMENTATION/CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
};
