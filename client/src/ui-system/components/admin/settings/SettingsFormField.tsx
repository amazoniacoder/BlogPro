import React, { useState, useId } from 'react';
import { Icon, type IconName } from '@/ui-system/icons/components';

interface SettingsFormFieldProps {
  label: string;
  children: React.ReactNode;
  help?: string;
  error?: string;
  warning?: string;
  success?: string;
  icon?: IconName;
  required?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SettingsFormField: React.FC<SettingsFormFieldProps> = ({
  label,
  children,
  help,
  error,
  warning,
  success,
  icon,
  required = false,
  loading = false,
  disabled = false,
  className = '',
  onFocus,
  onBlur
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const fieldId = useId();
  const helpId = useId();
  const errorId = useId();
  
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  
  const getStatusIcon = () => {
    if (loading) return 'clock';
    if (error) return 'alert-circle';
    if (warning) return 'warning';
    if (success) return 'check';
    return null;
  };
  
  const statusIcon = getStatusIcon();
  const fieldClasses = [
    'settings-form-field',
    className,
    error && 'settings-form-field--error',
    warning && 'settings-form-field--warning',
    success && 'settings-form-field--success',
    loading && 'settings-form-field--loading',
    disabled && 'settings-form-field--disabled',
    isFocused && 'settings-form-field--focused',
    required && 'settings-form-field--required'
  ].filter(Boolean).join(' ');

  return (
    <div className={fieldClasses}>
      <label 
        htmlFor={fieldId}
        className="settings-form-field__label"
      >
        {icon && <Icon name={icon} size={16} className="settings-form-field__icon" />}
        <span className="settings-form-field__label-text">{label}</span>
        {required && <span className="settings-form-field__required" aria-label="required">*</span>}
        {loading && (
          <Icon name="clock" size={14} className="settings-form-field__loading-icon" />
        )}
      </label>
      
      <div 
        className="settings-form-field__input"
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': [help && helpId, error && errorId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': error ? 'true' : undefined,
          disabled: disabled || loading
        })}
        {statusIcon && (
          <Icon 
            name={statusIcon} 
            size={16} 
            className={`settings-form-field__status-icon settings-form-field__status-icon--${
              error ? 'error' : warning ? 'warning' : success ? 'success' : 'loading'
            }`}
          />
        )}
      </div>
      
      {help && !error && !warning && (
        <p id={helpId} className="settings-form-field__help">{help}</p>
      )}
      
      {warning && !error && (
        <p className="settings-form-field__warning">{warning}</p>
      )}
      
      {error && (
        <p id={errorId} className="settings-form-field__error" role="alert">{error}</p>
      )}
      
      {success && !error && !warning && (
        <p className="settings-form-field__success">{success}</p>
      )}
    </div>
  );
};

export default SettingsFormField;
