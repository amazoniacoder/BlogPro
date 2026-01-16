import { useReducer, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mailingListReducer, MailingList } from './reducer';

const MailingListManager = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [state, dispatch] = useReducer(mailingListReducer, {
    mailingLists: [],
    selectedList: null,
    isEditing: false,
    loading: false,
    error: null,
    templates: []
  });

  const fetchMailingLists = async () => {
    try {
      const response = await fetch('/api/mailings/lists');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_MAILING_LISTS', payload: data });
      }
    } catch (err) {
      console.error('Failed to fetch mailing lists:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/mailings/templates?t=' + Date.now());
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_TEMPLATES', payload: data });
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchMailingLists();
    fetchTemplates();
    // Set global refresh function for cross-component sync
    (window as any).refreshMailingListTemplates = fetchTemplates;
    
    // Listen for WebSocket template deletion events
    const handleTemplateDeleted = (data: any) => {
      console.log('MailingListManager: Template deleted via WebSocket:', data);
      fetchTemplates();
    };
    
    // Add WebSocket listener if available
    if ((window as any).websocketService) {
      (window as any).websocketService.subscribe('template_deleted', handleTemplateDeleted);
    }
    
    return () => {
      delete (window as any).refreshMailingListTemplates;
      // Remove WebSocket listener
      if ((window as any).websocketService) {
        (window as any).websocketService.unsubscribe('template_deleted', handleTemplateDeleted);
      }
    };
  }, []);

  const handleSaveList = async (list: MailingList) => {
    if (!list.name.trim() || !list.description.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Name and description are required' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const url = list.id ? `/api/mailings/lists/${list.id}` : '/api/mailings/lists';
      const method = list.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(list)
      }); 

      if (response.ok) {
        await fetchMailingLists();
        await fetchTemplates();
        // Refresh templates in other components
        if ((window as any).refreshAllTemplates) {
          (window as any).refreshAllTemplates();
        }
        dispatch({ type: 'SET_EDITING', payload: false });
        dispatch({ type: 'SET_SELECTED_LIST', payload: null });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save failed:', response.status, errorData);
        dispatch({ type: 'SET_ERROR', payload: errorData.error || 'Failed to save mailing list' });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save mailing list' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className="mailing-list-manager">
      <div className="mailing-list-manager__header">
        <button 
          className="admin-button admin-button--primary"
          onClick={() => {
            dispatch({ type: 'SET_SELECTED_LIST', payload: { name: '', description: '', status: 'draft', templateId: null } });
            dispatch({ type: 'SET_EDITING', payload: true });
          }}
        >
          {t('admin:createMailingList', { defaultValue: 'Создать список рассылки' })}
        </button>
      </div>

      {state.selectedList && state.isEditing ? (
        <div className="mailing-list-editor">
          {state.error && (
            <div className="admin-form__error" style={{ color: 'red', marginBottom: '1rem' }}>
              {state.error}
            </div>
          )}
          
          <div className="admin-form__field">
            <label className="admin-form__label">{t('admin:listName', { defaultValue: 'Название списка' })}</label>
            <input
              type="text"
              className="admin-form__input"
              value={state.selectedList.name}
              onChange={(e) => dispatch({ type: 'UPDATE_LIST_FIELD', field: 'name', value: e.target.value })}
            />
          </div>

          <div className="admin-form__field">
            <label className="admin-form__label">{t('admin:description', { defaultValue: 'Описание' })}</label>
            <textarea
              className="admin-form__textarea"
              rows={3}
              value={state.selectedList.description}
              onChange={(e) => dispatch({ type: 'UPDATE_LIST_FIELD', field: 'description', value: e.target.value })}
            />
          </div>

          <div className="admin-form__field">
            <label className="admin-form__label">{t('admin:emailTemplate', { defaultValue: 'Шаблон email' })}</label>
            <select
              className="admin-form__select"
              value={state.selectedList.templateId || ''}
              onChange={(e) => dispatch({ type: 'UPDATE_LIST_FIELD', field: 'templateId', value: e.target.value ? parseInt(e.target.value) : null })}
            >
              <option value="">{t('admin:selectTemplate', { defaultValue: 'Выберите шаблон...' })}</option>
              {state.templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form__field">
            <label className="admin-form__label">{t('admin:status')}</label>
            <select
              className="admin-form__select"
              value={state.selectedList.status}
              onChange={(e) => dispatch({ type: 'UPDATE_LIST_FIELD', field: 'status', value: e.target.value })}
            >
              <option value="draft">{t('admin:draft', { defaultValue: 'Черновик' })}</option>
              <option value="active">{t('admin:active')}</option>
              <option value="inactive">{t('admin:inactive')}</option>
            </select>
          </div>

          <div className="admin-form__actions">
            <button 
              className="admin-button admin-button--primary"
              onClick={() => handleSaveList(state.selectedList!)}
              disabled={state.loading}
            >
              {state.loading ? t('admin:saving', { defaultValue: 'Сохранение...' }) : t('admin:saveList', { defaultValue: 'Сохранить список' })}
            </button>
            <button 
              className="admin-button admin-button--secondary"
              onClick={() => {
                dispatch({ type: 'SET_EDITING', payload: false });
                dispatch({ type: 'SET_SELECTED_LIST', payload: null });
              }}
              disabled={state.loading}
            >
              {t('common:cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="mailing-list-grid">
          {state.mailingLists.map(list => (
            <div key={list.id} className="mailing-list-card">
              <h4>{list.name}</h4>
              <p>{list.description}</p>
              <div className="mailing-list-stats">
                <span>{t('admin:status')}: {list.status}</span>
              </div>
              <div className="mailing-list-actions">
                <button onClick={() => {
                  dispatch({ type: 'SET_SELECTED_LIST', payload: list });
                  dispatch({ type: 'SET_EDITING', payload: true });
                }}>{t('common:edit')}</button>
                <button onClick={async () => {
                  try {
                    const response = await fetch('/api/mailings/campaigns/send', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ mailingListId: list.id })
                    });
                    if (response.ok) {
                      alert('Campaign sent successfully!');
                    } else {
                      const error = await response.json();
                      alert(`Failed to send: ${error.message || error.error}`);
                    }
                  } catch (error) {
                    alert('Failed to send campaign');
                  }
                }}>{t('admin:send', { defaultValue: 'Отправить' })}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MailingListManager;
