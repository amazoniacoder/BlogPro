import React from 'react';

interface AdminEditorFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  help?: string;
}

export const AdminEditorField: React.FC<AdminEditorFieldProps> = ({
  label,
  children,
  required = false,
  error,
  help
}) => {
  return (
    <div className="admin-editor-field">
      <label className="admin-editor-field__label">
        {label}
        {required && <span className="admin-editor-field__required">*</span>}
      </label>
      
      <div className="admin-editor-field__input">
        {children}
      </div>
      
      {help && (
        <div className="admin-editor-field__help">
          {help}
        </div>
      )}
      
      {error && (
        <div className="admin-editor-field__error">
          {error}
        </div>
      )}
    </div>
  );
};