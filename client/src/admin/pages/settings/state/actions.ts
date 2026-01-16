export const loadSettings = async (dispatch: any) => {
  dispatch({ type: 'LOAD_START' });
  
  try {
    const response = await fetch('/api/settings', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      dispatch({ type: 'LOAD_SUCCESS', payload: data });
    } else {
      dispatch({ type: 'LOAD_ERROR', payload: 'Failed to load settings' });
    }
  } catch (error) {
    dispatch({ type: 'LOAD_ERROR', payload: 'Failed to load settings' });
  }
};

export const saveSettings = async (dispatch: any, settings: Record<string, any>, showSuccess: any, showError: any) => {
  dispatch({ type: 'SAVE_START' });
  
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(settings)
    });
    
    if (response.ok) {
      dispatch({ type: 'SAVE_SUCCESS' });
      showSuccess('Settings saved successfully!');
    } else {
      dispatch({ type: 'SAVE_ERROR', payload: 'Failed to save settings' });
      showError('Failed to save settings');
    }
  } catch (error) {
    dispatch({ type: 'SAVE_ERROR', payload: 'Failed to save settings' });
    showError('Failed to save settings');
  }
};
