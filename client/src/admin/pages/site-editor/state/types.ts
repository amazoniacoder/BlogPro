// client/src/admin/pages/site-editor/state/types.ts
import type { MenuItem } from '../../../../types/menu';

export interface SiteEditorState {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  editor: {
    isOpen: boolean;
    loading: boolean;
    currentItem: MenuItem | null;
    formData: {
      title: string;
      url: string;
      parent_id?: number;
      order_index: number;
      is_active: boolean;
    };
  };
}

export type SiteEditorAction =
  | { type: 'MENU/FETCH_START' }
  | { type: 'MENU/FETCH_SUCCESS'; payload: MenuItem[] }
  | { type: 'MENU/FETCH_FAILURE'; error: string }
  | { type: 'MENU/CREATE_SUCCESS'; payload: MenuItem }
  | { type: 'MENU/UPDATE_SUCCESS'; payload: MenuItem }
  | { type: 'MENU/DELETE_SUCCESS'; itemId: number }
  | { type: 'MENU/OPERATION_FAILURE'; error: string }
  | { type: 'MENU/CLEAR_ERROR' }
  | { type: 'EDITOR/OPEN'; item?: MenuItem }
  | { type: 'EDITOR/CLOSE' }
  | { type: 'EDITOR/SET_LOADING'; loading: boolean }
  | { type: 'EDITOR/UPDATE_FIELD'; field: keyof SiteEditorState['editor']['formData']; value: any };
