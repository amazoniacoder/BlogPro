/**
 * BlogPro Admin Editor Component
 * Reusable editor layout for admin forms
 */

import React from 'react';

export interface AdminEditorField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'custom';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  render?: () => React.ReactNode;
  value?: any;
  onChange?: (value: any) => void;
}

export interface AdminEditorProps {
  title: string;
  breadcrumbs?: { label: string; onClick?: () => void }[];
  fields: AdminEditorField[];
  mediaPreview?: {
    imageUrl?: string;
    onRemove: () => void;
    onChange: () => void;
    onSelect: () => void;
  };
  contentEditor?: React.ReactNode;
  actions: {
    label: string;
    variant: 'primary' | 'secondary';
    onClick: () => void;
  }[];
  onCancel: () => void;
  className?: string;
}

export const AdminEditor: React.FC<AdminEditorProps> = ({
  title,
  breadcrumbs = [],
  fields,
  mediaPreview,
  contentEditor,
  actions,
  onCancel,
  className = ''
}) => {
  const renderField = (field: AdminEditorField) => {
    if (field.render) {
      return field.render();
    }

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.key}
            name={field.key}
            value={field.value || ''}
            onChange={(e) => field.onChange?.(e.target.value)}
            className="admin-form__textarea"
            placeholder={field.placeholder}
            rows={3}
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            id={field.key}
            name={field.key}
            value={field.value || ''}
            onChange={(e) => field.onChange?.(e.target.value)}
            className="admin-form__select"
            required={field.required}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            id={field.key}
            name={field.key}
            value={field.value || ''}
            onChange={(e) => field.onChange?.(e.target.value)}
            className="admin-form__input"
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  const editorClasses = ['admin-editor', className].filter(Boolean).join(' ');

  return (
    <div className={editorClasses}>
      {/* Header */}
      <div className="admin-editor__header">
        <div className="admin-editor__header-content">
          <h2 className="admin-editor__title">{title}</h2>
          {breadcrumbs.length > 0 && (
            <div className="admin-breadcrumbs">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {crumb.onClick ? (
                    <button
                      onClick={crumb.onClick}
                      className="admin-breadcrumbs__link"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="admin-breadcrumbs__current">{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <span className="admin-breadcrumbs__separator">/</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="admin-card">
        <div className="admin-card__body">
          {/* Three-column form layout */}
          <div className="admin-editor__form-grid">
            {/* Column 1: Title and Description */}
            <div className="admin-editor__column admin-editor__column--main">
              <div className="admin-editor__field">
                {fields.find(f => f.key === 'title') && (
                  <>
                    <label className="admin-editor__label">
                      {fields.find(f => f.key === 'title')?.label}
                      {fields.find(f => f.key === 'title')?.required && <span className="admin-editor__required">*</span>}
                    </label>
                    {renderField(fields.find(f => f.key === 'title')!)}
                  </>
                )}
              </div>
              <div className="admin-editor__field">
                {fields.find(f => f.key === 'description') && (
                  <>
                    <label className="admin-editor__label">
                      {fields.find(f => f.key === 'description')?.label}
                      {fields.find(f => f.key === 'description')?.required && <span className="admin-editor__required">*</span>}
                    </label>
                    {renderField(fields.find(f => f.key === 'description')!)}
                  </>
                )}
              </div>
            </div>
            
            {/* Column 2: Status/Slug and Category/Tags */}
            <div className="admin-editor__column admin-editor__column--secondary">
              <div className="admin-editor__field-row">
                <div className="admin-editor__field">
                  {fields.find(f => f.key === 'status') && (
                    <>
                      <label className="admin-editor__label">
                        {fields.find(f => f.key === 'status')?.label}
                      </label>
                      {renderField(fields.find(f => f.key === 'status')!)}
                    </>
                  )}
                </div>
                <div className="admin-editor__field">
                  {fields.find(f => f.key === 'slug') && (
                    <>
                      <label className="admin-editor__label">
                        {fields.find(f => f.key === 'slug')?.label}
                      </label>
                      {renderField(fields.find(f => f.key === 'slug')!)}
                    </>
                  )}
                </div>
              </div>
              <div className="admin-editor__field-row">
                <div className="admin-editor__field">
                  {fields.find(f => f.key === 'categoryId') && (
                    <>
                      <label className="admin-editor__label">
                        {fields.find(f => f.key === 'categoryId')?.label}
                        {fields.find(f => f.key === 'categoryId')?.required && <span className="admin-editor__required">*</span>}
                      </label>
                      {renderField(fields.find(f => f.key === 'categoryId')!)}
                    </>
                  )}
                </div>
                <div className="admin-editor__field">
                  {fields.find(f => f.key === 'tags') && (
                    <>
                      <label className="admin-editor__label">
                        {fields.find(f => f.key === 'tags')?.label}
                      </label>
                      {renderField(fields.find(f => f.key === 'tags')!)}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Column 3: Image */}
            <div className="admin-editor__column admin-editor__column--media">
              {mediaPreview && (
                <div className="admin-editor__field">
                  <label className="admin-editor__label">Featured Image</label>
                  {mediaPreview.imageUrl ? (
                    <div className="admin-editor__media-preview">
                      <img src={mediaPreview.imageUrl} alt="Featured" className="admin-editor__media-image" />
                      <div className="admin-editor__media-actions">
                        <button type="button" className="admin-button admin-button--sm" onClick={mediaPreview.onRemove}>×</button>
                        <button type="button" className="admin-button admin-button--sm" onClick={mediaPreview.onChange}>↻</button>
                      </div>
                    </div>
                  ) : (
                    <div className="admin-editor__media-empty" onClick={mediaPreview.onSelect}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          {contentEditor && (
            <div className="admin-editor__content-section">
              {contentEditor}
            </div>
          )}

          {/* Actions */}
          <div className="admin-editor__actions">
            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                className={`admin-button admin-button--${action.variant}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;
