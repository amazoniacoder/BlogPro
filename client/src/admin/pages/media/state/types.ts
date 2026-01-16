// client/src/admin/pages/media/state/types.ts
export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
  alt?: string;
  title?: string;
  category: 'images' | 'documents' | 'videos' | 'audio';
  source: 'general' | 'editor';
  folderPath: string;
}

export interface MediaState {
  items: MediaItem[];
  filteredItems: MediaItem[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  sortField: string;
  sortDirection: "asc" | "desc";
  filters: {
    search: string;
    type: string;
    category: 'images' | 'documents' | 'videos' | 'audio' | 'editor';
  };
  selectedItems: string[];
  deleteModalOpen: boolean;
  itemToDelete: string | null;
  uploadModalOpen: boolean;
  uploading: boolean;
  uploadProgress: number;
  viewModalOpen: boolean;
  currentItem: MediaItem | null;
}

export type MediaAction =
  | { type: "FETCH_MEDIA_START" }
  | { type: "FETCH_MEDIA_SUCCESS"; payload: MediaItem[] }
  | { type: "FETCH_MEDIA_FAILURE"; error: string }
  | { type: "SET_PAGE"; page: number }
  | { type: "SET_ITEMS_PER_PAGE"; count: number }
  | { type: "SET_SORT"; field: string; direction: "asc" | "desc" }
  | { type: "SET_FILTER"; field: keyof MediaState["filters"]; value: string }
  | { type: "TOGGLE_ITEM_SELECTION"; itemId: string }
  | { type: "SELECT_ALL_ITEMS"; selected: boolean }
  | { type: "SHOW_DELETE_MODAL"; itemId: string }
  | { type: "HIDE_DELETE_MODAL" }
  | { type: "SHOW_UPLOAD_MODAL" }
  | { type: "HIDE_UPLOAD_MODAL" }
  | { type: "SHOW_VIEW_MODAL"; item: MediaItem }
  | { type: "HIDE_VIEW_MODAL" }
  | { type: "UPLOAD_START" }
  | { type: "UPLOAD_PROGRESS"; progress: number }
  | { type: "UPLOAD_SUCCESS"; items: MediaItem[] }
  | { type: "UPLOAD_FAILURE"; error: string }
  | { type: "DELETE_MEDIA_START"; itemId: string }
  | { type: "DELETE_MEDIA_SUCCESS"; itemId: string }
  | { type: "DELETE_MEDIA_FAILURE"; error: string }
  | { type: "UPDATE_MEDIA_START"; itemId: string }
  | { type: "UPDATE_MEDIA_SUCCESS"; item: MediaItem }
  | { type: "UPDATE_MEDIA_FAILURE"; error: string }
  | { type: "CLEAR_ERROR" };
