// client/src/admin/pages/site-editor/state/reducer.ts
import { SiteEditorState, SiteEditorAction } from './types';

export const initialState: SiteEditorState = {
  menuItems: [],
  loading: false,
  error: null,
  editor: {
    isOpen: false,
    loading: false,
    currentItem: null,
    formData: {
      title: '',
      url: '',
      parent_id: undefined,
      order_index: 0,
      is_active: true,
    },
  },
};

export const siteEditorReducer = (
  state: SiteEditorState,
  action: SiteEditorAction
): SiteEditorState => {
  switch (action.type) {
    case 'MENU/FETCH_START':
      return { ...state, loading: true, error: null };

    case 'MENU/FETCH_SUCCESS':
      return {
        ...state,
        menuItems: action.payload,
        loading: false,
        error: null,
      };

    case 'MENU/FETCH_FAILURE':
      return { ...state, loading: false, error: action.error };

    case 'MENU/CREATE_SUCCESS':
      return {
        ...state,
        menuItems: [...state.menuItems, action.payload],
        editor: initialState.editor,
      };

    case 'MENU/UPDATE_SUCCESS':
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        editor: initialState.editor,
      };

    case 'MENU/DELETE_SUCCESS':
      return {
        ...state,
        menuItems: state.menuItems.filter(item => item.id !== action.itemId),
      };

    case 'MENU/OPERATION_FAILURE':
      return { ...state, loading: false, error: action.error };

    case 'MENU/CLEAR_ERROR':
      return { ...state, error: null };

    case 'EDITOR/OPEN':
      return {
        ...state,
        editor: {
          ...state.editor,
          isOpen: true,
          currentItem: action.item || null,
          formData: action.item ? {
            title: action.item.title || '',
            url: action.item.url || '',
            parent_id: action.item.parent_id,
            order_index: action.item.order_index || 0,
            is_active: action.item.is_active ?? true,
          } : initialState.editor.formData,
        },
      };

    case 'EDITOR/CLOSE':
      return {
        ...state,
        editor: initialState.editor,
      };

    case 'EDITOR/SET_LOADING':
      return {
        ...state,
        editor: {
          ...state.editor,
          loading: action.loading,
        },
      };

    case 'EDITOR/UPDATE_FIELD':
      return {
        ...state,
        editor: {
          ...state.editor,
          formData: {
            ...state.editor.formData,
            [action.field]: action.value,
          },
        },
      };

    default:
      return state;
  }
};
