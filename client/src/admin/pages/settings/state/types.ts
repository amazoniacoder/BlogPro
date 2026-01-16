export interface SettingsState {
  data: Record<string, any>;
  loading: boolean;
  error: string | null;
}

export type SettingsAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Record<string, any> }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_FIELD'; payload: { key: string; value: any } }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; payload: string };
