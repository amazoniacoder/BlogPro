import { useReducer, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TemplateEditor from './TemplateEditor';
import ConfirmModal from './ConfirmModal';
import { managerReducer, EmailTemplate } from './reducer';

const EmailTemplateManager = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [state, dispatch] = useReducer(managerReducer, {
    templates: [],
    selectedTemplate: null,
    isEditing: false,
    loading: false,
    error: null,
    showDeleteModal: false,
    templateToDelete: null
  });

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

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
    // Set global refresh function for cross-component sync
    (window as any).refreshAllTemplates = fetchTemplates;
    return () => {
      delete (window as any).refreshAllTemplates;
    };
  }, []);

  const handleDeleteTemplate = async () => {
    if (!state.templateToDelete) {
      console.log('No template to delete');
      return;
    }

    console.log('Starting delete for template ID:', state.templateToDelete);
    console.log('Template to delete type:', typeof state.templateToDelete);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'HIDE_DELETE_MODAL' });

    try {
      const url = `/api/mailings/templates/${state.templateToDelete}`;
      console.log('DELETE request to:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);
      
      // Log response details for debugging
      const responseText = await response.text();
      console.log('Delete response text:', responseText);
      
      if (response.ok || response.status === 204) {
        console.log('Delete successful, refreshing templates...');
        await fetchTemplates();
        // Refresh templates in mailing list component
        if ((window as any).refreshMailingListTemplates) {
          (window as any).refreshMailingListTemplates();
        }
        
        if (state.selectedTemplate?.id === state.templateToDelete) {
          dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: null });
          dispatch({ type: 'SET_EDITING', payload: false });
        }
      } else if (response.status === 409) {
        // Handle foreign key constraint error
        const errorData = await response.json().catch(() => ({ message: 'Template is being used by mailing lists' }));
        dispatch({ type: 'SET_ERROR', payload: errorData.message || 'Cannot delete template - it is being used by mailing lists' });
      } else {
        console.error('Delete failed:', response.status, responseText);
        try {
          const errorData = JSON.parse(responseText);
          console.error('Error data:', errorData);
          if (response.status === 409) {
            const listNames = errorData.referencingLists?.map((list: any) => list.name).join(', ') || 'unknown';
            dispatch({ type: 'SET_ERROR', payload: `Cannot delete template: It's being used by mailing list(s): ${listNames}. Please remove it from these lists first.` });
          } else {
            dispatch({ type: 'SET_ERROR', payload: errorData.message || errorData.error || `Failed to delete template: ${response.status}` });
          }
        } catch {
          dispatch({ type: 'SET_ERROR', payload: `Failed to delete template: ${response.status} - ${responseText}` });
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete template' });
    } finally {
      console.log('Delete process finished');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleSaveTemplate = async (template: EmailTemplate) => {
    if (!template.name.trim() || !template.subject.trim() || !template.content.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'All fields are required' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const url = template.id ? `/api/mailings/templates/${template.id}` : '/api/mailings/templates';
      const method = template.id ? 'PUT' : 'POST';
      
      console.log('Saving template:', { url, method, template });
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'credentials': 'include'
        },
        credentials: 'include',
        body: JSON.stringify(template)
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const savedTemplate = await response.json();
        console.log('Template saved:', savedTemplate);
        await fetchTemplates();
        dispatch({ type: 'SET_EDITING', payload: false });
        dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: null });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save failed:', response.status, errorData);
        dispatch({ type: 'SET_ERROR', payload: errorData.error || `Failed to save template: ${response.status}` });
      }
    } catch (err) {
      console.error('Save error:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save template' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className="template-manager">
      <div className="template-manager__sidebar">
        <button 
          className="admin-button admin-button--primary"
          onClick={() => {
            const defaultTemplate = {
              name: '',
              subject: '',
              content: ''
            };
            dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: defaultTemplate });
            dispatch({ type: 'SET_EDITING', payload: true });
          }}
        >
          {t('admin:createNewTemplate', { defaultValue: 'Создать новый шаблон' })}
        </button>
        
        <div className="template-list">
          {state.templates.map(template => (
            <div key={template.id} className="template-item">
              <div 
                className="template-item__content"
                onClick={() => {
                  dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: template });
                  dispatch({ type: 'SET_EDITING', payload: true });
                  dispatch({ type: 'SET_ERROR', payload: null });
                }}
              >
                <h4>{template.name}</h4>
                <p>{template.subject}</p>
              </div>
              <button 
                className="template-item__delete"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'SHOW_DELETE_MODAL', payload: template.id! });
                }}
                title={t('admin:deleteTemplate', { defaultValue: 'Удалить шаблон' })}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="template-manager__editor">
        {state.selectedTemplate && (
          <TemplateEditor 
            template={state.selectedTemplate}
            isEditing={state.isEditing}
            onSave={handleSaveTemplate}
            loading={state.loading}
            error={state.error}
            onCancel={() => dispatch({ type: 'SET_EDITING', payload: false })}
          />
        )}
      </div>
      
      <ConfirmModal
        isOpen={state.showDeleteModal}
        title={t('admin:deleteTemplate', { defaultValue: 'Удалить шаблон' })}
        message={t('admin:confirmDeleteTemplate', { defaultValue: 'Вы уверены, что хотите удалить этот шаблон? Это действие нельзя отменить.' })}
        onConfirm={handleDeleteTemplate}
        onCancel={() => dispatch({ type: 'HIDE_DELETE_MODAL' })}
      />
    </div>
  );
};

export default EmailTemplateManager;
