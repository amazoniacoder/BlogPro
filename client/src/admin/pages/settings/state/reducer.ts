import { SettingsState, SettingsAction } from './types';

export const initialState: SettingsState = {
  data: {},
  loading: false,
  error: null,
};

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    
    case 'LOAD_SUCCESS':
      return { ...state, loading: false, data: action.payload, error: null };
    
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    case 'UPDATE_FIELD':
      return {
        ...state,
        data: { ...state.data, [action.payload.key]: action.payload.value }
      };
    
    case 'SAVE_START':
      return { ...state, loading: true, error: null };
    
    case 'SAVE_SUCCESS':
      return { ...state, loading: false, error: null };
    
    case 'SAVE_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    default:
      return state;
  }
}
