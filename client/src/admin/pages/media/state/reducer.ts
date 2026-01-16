// client/src/admin/pages/media/state/reducer.ts
import { MediaState, MediaAction, MediaItem } from "./types";

export const initialState: MediaState = {
  items: [],
  filteredItems: [],
  loading: false,
  error: null,
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  sortField: "createdAt",
  sortDirection: "desc",
  filters: {
    search: "",
    type: "",
    category: "images" as const,
  },
  selectedItems: [],
  uploadModalOpen: false,
  viewModalOpen: false,
  deleteModalOpen: false,
  currentItem: null,
  itemToDelete: null,
  uploading: false,
  uploadProgress: 0,
};

// Helper function to filter and sort media items
const filterAndSortItems = (
  items: MediaItem[],
  filters: MediaState["filters"],
  sortField: string,
  sortDirection: "asc" | "desc"
): MediaItem[] => {
  // Filter logic
  let result = items.filter((item) => {
    const searchMatch =
      !filters.search ||
      item.originalName.toLowerCase().includes(filters.search.toLowerCase());

    const typeMatch =
      !filters.type ||
      (item.mimeType && item.mimeType.startsWith(filters.type));

    const categoryMatch =
      (filters.category === 'editor' && item.source === 'editor') ||
      (filters.category !== 'editor' && item.category === filters.category && item.source !== 'editor');

    return searchMatch && typeMatch && categoryMatch;
  });

  // Sort logic
  result.sort((a, b) => {
    const aValue = a[sortField as keyof MediaItem];
    const bValue = b[sortField as keyof MediaItem];

    // Handle undefined/null values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === "asc" ? 1 : -1;
    if (bValue == null) return sortDirection === "asc" ? -1 : 1;

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return result;
};

export const mediaReducer = (
  state: MediaState,
  action: MediaAction
): MediaState => {
  switch (action.type) {
    case "FETCH_MEDIA_START":
      return { ...state, loading: true, error: null };

    case "FETCH_MEDIA_SUCCESS": {
      const filteredItems = filterAndSortItems(
        action.payload,
        state.filters,
        state.sortField,
        state.sortDirection
      );

      return {
        ...state,
        items: action.payload,
        filteredItems,
        totalItems: filteredItems.length,
        loading: false,
      };
    }

    case "FETCH_MEDIA_FAILURE":
      return { ...state, loading: false, error: action.error };

    case "SET_PAGE":
      return { ...state, currentPage: action.page };

    case "SET_ITEMS_PER_PAGE":
      return { ...state, itemsPerPage: action.count, currentPage: 1 };

    case "SET_SORT": {
      const filteredItems = filterAndSortItems(
        state.items,
        state.filters,
        action.field,
        action.direction
      );

      return {
        ...state,
        sortField: action.field,
        sortDirection: action.direction,
        filteredItems,
      };
    }

    case "SET_FILTER": {
      const newFilters = {
        ...state.filters,
        [action.field]: action.value,
      };

      const filteredItems = filterAndSortItems(
        state.items,
        newFilters,
        state.sortField,
        state.sortDirection
      );

      return {
        ...state,
        filters: newFilters,
        filteredItems,
        totalItems: filteredItems.length,
        currentPage: 1,
      };
    }

    case "TOGGLE_ITEM_SELECTION": {
      const isSelected = state.selectedItems.includes(action.itemId);
      const selectedItems = isSelected
        ? state.selectedItems.filter((id) => id !== action.itemId)
        : [...state.selectedItems, action.itemId];

      return { ...state, selectedItems };
    }

    case "SELECT_ALL_ITEMS": {
      const selectedItems = action.selected
        ? state.filteredItems.map((item) => item.id)
        : [];

      return { ...state, selectedItems };
    }

    case "SHOW_UPLOAD_MODAL":
      return { ...state, uploadModalOpen: true };

    case "HIDE_UPLOAD_MODAL":
      return { ...state, uploadModalOpen: false, uploading: false, uploadProgress: 0 };

    case "SHOW_VIEW_MODAL":
      return { ...state, viewModalOpen: true, currentItem: action.item };

    case "HIDE_VIEW_MODAL":
      return { ...state, viewModalOpen: false, currentItem: null };

    case "SHOW_DELETE_MODAL":
      return { ...state, deleteModalOpen: true, itemToDelete: action.itemId };

    case "HIDE_DELETE_MODAL":
      return { ...state, deleteModalOpen: false, itemToDelete: null };

    case "DELETE_MEDIA_START":
      return { ...state, loading: true };

    case "DELETE_MEDIA_SUCCESS": {
      // Remove the deleted item from all item lists
      const updatedItems = state.items.filter(
        (item) => item.id !== action.itemId
      );
      
      const updatedFilteredItems = state.filteredItems.filter(
        (item) => item.id !== action.itemId
      );
      
      const updatedSelectedItems = state.selectedItems.filter(
        (id) => id !== action.itemId
      );
      
      // Calculate total items after filtering
      const totalItems = updatedFilteredItems.length;
      
      // Adjust current page if needed (if the page becomes empty)
      const maxPage = Math.max(1, Math.ceil(totalItems / state.itemsPerPage));
      const adjustedCurrentPage = Math.min(state.currentPage, maxPage);
      
      return {
        ...state,
        loading: false,
        items: updatedItems,
        filteredItems: updatedFilteredItems,
        selectedItems: updatedSelectedItems,
        totalItems,
        currentPage: adjustedCurrentPage,
      };
    }

    case "DELETE_MEDIA_FAILURE":
      return { ...state, loading: false, error: action.error };

    case "UPDATE_MEDIA_START":
      return { ...state, loading: true };

    case "UPDATE_MEDIA_SUCCESS": {
      // Update the item in both items and filteredItems arrays
      const updatedItems = state.items.map((item) =>
        item.id === action.item.id ? action.item : item
      );

      const filteredItems = filterAndSortItems(
        updatedItems,
        state.filters,
        state.sortField,
        state.sortDirection
      );

      return {
        ...state,
        loading: false,
        items: updatedItems,
        filteredItems,
        currentItem: action.item,
      };
    }

    case "UPDATE_MEDIA_FAILURE":
      return { ...state, loading: false, error: action.error };

    case "UPLOAD_START":
      return { ...state, uploading: true, uploadProgress: 0 };

    case "UPLOAD_PROGRESS":
      return { ...state, uploadProgress: action.progress };

    case "UPLOAD_SUCCESS": {
      // Add the new items to the items array
      const updatedItems = [...state.items, ...action.items];

      const filteredItems = filterAndSortItems(
        updatedItems,
        state.filters,
        state.sortField,
        state.sortDirection
      );

      return {
        ...state,
        uploading: false,
        uploadProgress: 100,
        items: updatedItems,
        filteredItems,
        totalItems: filteredItems.length,
      };
    }

    case "UPLOAD_FAILURE":
      return {
        ...state,
        uploading: false,
        uploadProgress: 0,
        error: action.error,
      };
      
    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
};
