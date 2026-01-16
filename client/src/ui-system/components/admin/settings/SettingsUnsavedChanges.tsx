import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingsUnsavedChangesProps {
  hasUnsavedChanges: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
}

const SettingsUnsavedChanges: React.FC<SettingsUnsavedChangesProps> = ({
  hasUnsavedChanges,
  onSave,
  onDiscard
}) => {
  const { t } = useTranslation(['admin', 'common']);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = t('admin:unsavedChangesWarning', { 
        defaultValue: 'You have unsaved changes. Are you sure you want to leave?' 
      });
    }
  }, [hasUnsavedChanges, t]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload]);

  if (!hasUnsavedChanges) return null;

  return (
    <div className="settings-unsaved-changes">
      <div className="settings-unsaved-changes__content">
        <div className="settings-unsaved-changes__message">
          <span className="settings-unsaved-changes__icon">⚠️</span>
          <span className="settings-unsaved-changes__text">
            {t('admin:unsavedChanges', { defaultValue: 'You have unsaved changes' })}
          </span>
        </div>
        <div className="settings-unsaved-changes__actions">
          {onDiscard && (
            <button 
              className="admin-button admin-button--secondary admin-button--small"
              onClick={onDiscard}
            >
              {t('admin:discard', { defaultValue: 'Discard' })}
            </button>
          )}
          {onSave && (
            <button 
              className="admin-button admin-button--primary admin-button--small"
              onClick={onSave}
            >
              {t('admin:save', { defaultValue: 'Save' })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsUnsavedChanges;
