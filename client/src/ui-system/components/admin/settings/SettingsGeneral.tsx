import React, { useReducer, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/ui-system/components/feedback';
import { useSettings } from '@/store/settings-context';
import { settingsReducer, initialState } from '@/admin/pages/settings/state/reducer';
import { loadSettings, saveSettings } from '@/admin/pages/settings/state/actions';
import SettingsFormSection from './SettingsFormSection';
import SettingsFormField from './SettingsFormField';
import SettingsUnsavedChanges from './SettingsUnsavedChanges';

interface SettingsGeneralProps {
  onSave: (settings: any) => void;
}

const SettingsGeneral: React.FC<SettingsGeneralProps> = ({ onSave }) => {
  const { t } = useTranslation(['admin', 'common']);
  const { updateSettings } = useSettings();
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const { showSuccess, showError } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const settings = {
    siteTitle: state.data.siteTitle || '',
    siteDescription: state.data.siteDescription || '',
    contactEmail: state.data.contactEmail || '',
    youtubeUrl: state.data.youtubeUrl || '',
    vkUrl: state.data.vkUrl || '',
    telegramUrl: state.data.telegramUrl || '',
  };

  useEffect(() => {
    loadSettings(dispatch);
  }, []);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'siteTitle':
        if (!value.trim()) return t('admin:siteTitleRequired', { defaultValue: 'Site title is required' });
        if (value.length < 3) return t('admin:siteTitleTooShort', { defaultValue: 'Site title must be at least 3 characters' });
        break;
      case 'contactEmail':
        if (!value.trim()) return t('admin:contactEmailRequired', { defaultValue: 'Contact email is required' });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('admin:invalidEmail', { defaultValue: 'Invalid email format' });
        break;
      case 'youtubeUrl':
      case 'vkUrl':
      case 'telegramUrl':
        if (value && !/^https?:\/\/.+/.test(value)) return t('admin:invalidUrl', { defaultValue: 'Invalid URL format' });
        break;
    }
    return undefined;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FIELD', payload: { key: name, value } });
    setHasUnsavedChanges(true);
    
    // Real-time validation
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const errors: Record<string, string> = {};
    Object.entries(settings).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) errors[key] = error;
    });
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSaving(true);
    try {
      await saveSettings(dispatch, settings, showSuccess, showError);
      updateSettings(settings);
      onSave(settings);
      setHasUnsavedChanges(false);
      setValidationErrors({});
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDiscard = () => {
    loadSettings(dispatch);
    setHasUnsavedChanges(false);
    setValidationErrors({});
  };

  if (state.loading) {
    return (
      <div className="settings-content__panel">
        <p>{t('common:loading', { defaultValue: 'Loading...' })}</p>
      </div>
    );
  }

  return (
    <div className="settings-content__panel">
      <form onSubmit={handleSubmit}>
        <SettingsFormSection
          title={t('admin:basicInformation', { defaultValue: 'Basic Information' })}
          description={t('admin:basicInformationDesc', { defaultValue: 'Configure your site\'s basic information and branding.' })}
          icon="gear"
        >
          <SettingsFormField
            label={t('admin:siteTitle', { defaultValue: 'Site Title' })}
            help={t('admin:siteTitleHelp', { defaultValue: 'The name of your website that appears in the browser title and search results.' })}
            error={validationErrors.siteTitle}
            loading={isSaving}
            required
          >
            <input
              type="text"
              name="siteTitle"
              className="admin-form__input"
              value={settings.siteTitle}
              onChange={handleChange}
              required
            />
          </SettingsFormField>

          <SettingsFormField
            label={t('admin:siteDescription', { defaultValue: 'Site Description' })}
            help={t('admin:siteDescriptionHelp', { defaultValue: 'A brief description of your website for search engines and social media.' })}
          >
            <textarea
              name="siteDescription"
              className="admin-form__textarea"
              value={settings.siteDescription}
              onChange={handleChange}
              rows={3}
            />
          </SettingsFormField>

          <SettingsFormField
            label={t('admin:contactEmail', { defaultValue: 'Contact Email' })}
            help={t('admin:contactEmailHelp', { defaultValue: 'Primary email address for site communications.' })}
            error={validationErrors.contactEmail}
            icon="users"
            loading={isSaving}
            required
          >
            <input
              type="email"
              name="contactEmail"
              className="admin-form__input"
              value={settings.contactEmail}
              onChange={handleChange}
              required
            />
          </SettingsFormField>
        </SettingsFormSection>

        <SettingsFormSection
          title={t('admin:socialMediaLinks', { defaultValue: 'Social Media Links' })}
          description={t('admin:socialMediaDesc', { defaultValue: 'Connect your social media profiles to your website.' })}
          icon="share"
        >
          <SettingsFormField
            label={t('admin:youtubeUrl', { defaultValue: 'YouTube URL' })}
            help={t('admin:youtubeUrlHelp', { defaultValue: 'Link to your YouTube channel.' })}
            error={validationErrors.youtubeUrl}
            loading={isSaving}
          >
            <input
              type="url"
              name="youtubeUrl"
              className="admin-form__input"
              placeholder="https://youtube.com/@yourchannel"
              value={settings.youtubeUrl}
              onChange={handleChange}
            />
          </SettingsFormField>

          <SettingsFormField
            label={t('admin:vkUrl', { defaultValue: 'VK URL' })}
            help={t('admin:vkUrlHelp', { defaultValue: 'Link to your VK profile or group.' })}
          >
            <input
              type="url"
              name="vkUrl"
              className="admin-form__input"
              placeholder="https://vk.com/yourprofile"
              value={settings.vkUrl}
              onChange={handleChange}
            />
          </SettingsFormField>

          <SettingsFormField
            label={t('admin:telegramUrl', { defaultValue: 'Telegram URL' })}
            help={t('admin:telegramUrlHelp', { defaultValue: 'Link to your Telegram channel or bot.' })}
          >
            <input
              type="url"
              name="telegramUrl"
              className="admin-form__input"
              placeholder="https://t.me/yourchannel"
              value={settings.telegramUrl}
              onChange={handleChange}
            />
          </SettingsFormField>
        </SettingsFormSection>

        <div className="admin-form__actions">
          <button 
            type="button" 
            className="admin-button admin-button--secondary"
            onClick={handleDiscard}
            disabled={!hasUnsavedChanges || isSaving}
          >
            {t('admin:discard', { defaultValue: 'Discard Changes' })}
          </button>
          <button 
            type="submit" 
            className="admin-button admin-button--primary"
            disabled={isSaving || Object.keys(validationErrors).some(key => validationErrors[key])}
          >
            {isSaving ? t('admin:saving', { defaultValue: 'Saving...' }) : t('admin:saveSettings', { defaultValue: 'Save Settings' })}
          </button>
        </div>
      </form>
      
      <SettingsUnsavedChanges
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
        onDiscard={handleDiscard}
      />
    </div>
  );
};

export default SettingsGeneral;
