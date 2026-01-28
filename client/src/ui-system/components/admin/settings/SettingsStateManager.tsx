import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useNotifications } from '@/ui-system/components/feedback';

interface SettingsState {
  activeTab: string;
  hasUnsavedChanges: boolean;
  isAutoSaving: boolean;
  lastSaved: Date | null;
  tabData: Record<string, any>;
}

type SettingsAction = 
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_TAB_DATA'; payload: { tab: string; data: any } }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'SET_AUTO_SAVING'; payload: boolean }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET_TAB'; payload: string };

const initialState: SettingsState = {
  activeTab: 'general',
  hasUnsavedChanges: false,
  isAutoSaving: false,
  lastSaved: null,
  tabData: {}
};

const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_TAB_DATA':
      return {
        ...state,
        tabData: { ...state.tabData, [action.payload.tab]: action.payload.data },
        hasUnsavedChanges: true
      };
    case 'SET_UNSAVED_CHANGES':
      return { ...state, hasUnsavedChanges: action.payload };
    case 'SET_AUTO_SAVING':
      return { ...state, isAutoSaving: action.payload };
    case 'MARK_SAVED':
      return { 
        ...state, 
        hasUnsavedChanges: false, 
        isAutoSaving: false,
        lastSaved: new Date() 
      };
    case 'RESET_TAB':
      const { [action.payload]: removed, ...remainingData } = state.tabData;
      return { 
        ...state, 
        tabData: remainingData,
        hasUnsavedChanges: Object.keys(remainingData).length > 0
      };
    default:
      return state;
  }
};

interface SettingsContextType {
  state: SettingsState;
  setActiveTab: (tab: string) => Promise<boolean>;
  updateTabData: (tab: string, data: any) => void;
  saveSettings: () => Promise<void>;
  discardChanges: () => void;
  resetTab: (tab: string) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsStateManagerProps {
  children: React.ReactNode;
  onSave?: (data: Record<string, any>) => Promise<void>;
  autoSaveDelay?: number;
}

export const SettingsStateManager: React.FC<SettingsStateManagerProps> = ({
  children,
  onSave,
  autoSaveDelay = 3000
}) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const { showToastSuccess, showToastError } = useNotifications();

  // Load existing settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/admin', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (response.ok) {
          const settings = await response.json();
          console.log('Loaded settings:', settings);
          
          // Organize settings by tabs
          const tabData: Record<string, any> = {
            contact: {
              contactEmail: settings.contactEmail || '',
              phoneNumber: settings.phoneNumber || '',
              address: settings.address || '',
              businessHours: settings.businessHours || '',
              contactFormEnabled: settings.contactFormEnabled === 'true',
              requireCaptcha: settings.requireCaptcha === 'true',
              autoReply: settings.autoReply === 'true',
              autoReplyMessage: settings.autoReplyMessage || '',
              responseTime: settings.responseTime || '24'
            },
            general: {
              siteTitle: settings.siteTitle || '',
              siteDescription: settings.siteDescription || '',
              siteKeywords: settings.siteKeywords || ''
            }
          };
          
          // Update state with loaded settings
          Object.entries(tabData).forEach(([tab, data]) => {
            dispatch({ type: 'SET_TAB_DATA', payload: { tab, data } });
          });
          
          // Mark as saved since we just loaded from server
          dispatch({ type: 'MARK_SAVED' });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!state.hasUnsavedChanges || state.isAutoSaving) return;

    const timer = setTimeout(async () => {
      if (state.hasUnsavedChanges && onSave) {
        dispatch({ type: 'SET_AUTO_SAVING', payload: true });
        try {
          await onSave(state.tabData);
          dispatch({ type: 'MARK_SAVED' });
        } catch (error) {
          dispatch({ type: 'SET_AUTO_SAVING', payload: false });
        }
      }
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [state.hasUnsavedChanges, state.tabData, onSave, autoSaveDelay, state.isAutoSaving]);

  const setActiveTab = useCallback(async (tab: string): Promise<boolean> => {
    if (state.hasUnsavedChanges) {
      const shouldContinue = window.confirm(
        'You have unsaved changes. Do you want to save them before switching tabs?'
      );
      
      if (shouldContinue && onSave) {
        try {
          await onSave(state.tabData);
          dispatch({ type: 'MARK_SAVED' });
        } catch (error) {
          showToastError('Failed to save changes');
          return false;
        }
      } else if (!shouldContinue) {
        return false;
      }
    }
    
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    return true;
  }, [state.hasUnsavedChanges, state.tabData, onSave, showToastError]);

  const updateTabData = useCallback((tab: string, data: any) => {
    dispatch({ type: 'SET_TAB_DATA', payload: { tab, data } });
  }, []);

  const saveSettings = useCallback(async () => {
    if (!onSave || !state.hasUnsavedChanges) return;

    try {
      await onSave(state.tabData);
      dispatch({ type: 'MARK_SAVED' });
      showToastSuccess('Settings saved successfully');
    } catch (error) {
      showToastError('Failed to save settings');
      throw error;
    }
  }, [onSave, state.tabData, state.hasUnsavedChanges, showToastSuccess, showToastError]);

  const discardChanges = useCallback(() => {
    dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: state.activeTab });
  }, [state.activeTab]);

  const resetTab = useCallback((tab: string) => {
    dispatch({ type: 'RESET_TAB', payload: tab });
  }, []);

  const contextValue: SettingsContextType = {
    state,
    setActiveTab,
    updateTabData,
    saveSettings,
    discardChanges,
    resetTab
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsState = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsState must be used within SettingsStateManager');
  }
  return context;
};
