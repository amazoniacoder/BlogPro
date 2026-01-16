import { ContentEditableEditor } from '@/plugins/texteditor';
import { useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { templateReducer, EmailTemplate } from './reducer';

interface TemplateEditorProps {
  template: EmailTemplate;
  isEditing: boolean;
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}



const TemplateEditor = ({ template, isEditing, onSave, onCancel, loading, error }: TemplateEditorProps) => {
  const { t } = useTranslation(['admin', 'common']);
  const [state, dispatch] = useReducer(templateReducer, { formData: template });
  const lastTemplateId = useRef(template.id);

  // Update form data when template prop changes (only when switching templates)
  if (template.id !== lastTemplateId.current) {
    lastTemplateId.current = template.id;
    dispatch({ type: 'SET_TEMPLATE', payload: template });
  }

  return (
    <div className="template-editor">
      <div className="admin-form__field">
        <label className="admin-form__label">{t('admin:templateName', { defaultValue: 'Название шаблона' })}</label>
        <input
          type="text"
          className="admin-form__input"
          value={state.formData.name}
          onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'name', value: e.target.value })}
          disabled={!isEditing}
        />
      </div>

      <div className="admin-form__field">
        <label className="admin-form__label">{t('admin:emailSubject', { defaultValue: 'Тема email' })}</label>
        <input
          type="text"
          className="admin-form__input"
          value={state.formData.subject}
          onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'subject', value: e.target.value })}
          disabled={!isEditing}
        />
      </div>

      <div className="admin-form__field">
        <label className="admin-form__label">{t('admin:emailContent', { defaultValue: 'Содержание email' })}</label>
        <ContentEditableEditor
          initialContent={state.formData.content || '<p></p>'}
          onChange={(content: string) => {
            dispatch({ type: 'UPDATE_FIELD', field: 'content', value: content });
          }}
          placeholder="Enter email template content..."
          className="template-editor__text-editor"
        />
      </div>

      {error && (
        <div className="admin-form__error" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {isEditing && (
        <div className="admin-form__actions">
          <button 
            className="admin-button admin-button--primary"
            onClick={() => onSave(state.formData)}
            disabled={loading}
          >
            {loading ? t('admin:saving') : t('admin:saveTemplate', { defaultValue: 'Сохранить шаблон' })}
          </button>
          <button 
            className="admin-button admin-button--secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {t('common:cancel')}
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
