import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsFormSection from './SettingsFormSection';
import SettingsFormField from './SettingsFormField';

interface SettingsSecurityProps {
  onSave: (settings: any) => void;
}

const SettingsSecurity: React.FC<SettingsSecurityProps> = ({ onSave }) => {
  const { t } = useTranslation(['admin', 'common']);
  const [settings, setSettings] = useState({
    sessionTimeout: '24',
    maxLoginAttempts: '5',
    requireTwoFactor: false,
    passwordMinLength: '8',
    enableCaptcha: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <div className="settings-content__panel settings-content__panel--active">
      <form onSubmit={handleSubmit}>
        <SettingsFormSection
          title={t('admin:authenticationSecurity', { defaultValue: 'Authentication & Security' })}
          description={t('admin:authSecurityDesc', { defaultValue: 'Configure login security and user authentication settings.' })}
          icon="user"
        >
          <SettingsFormField
            label={t('admin:sessionTimeout', { defaultValue: 'Session Timeout (hours)' })}
            help={t('admin:sessionTimeoutHelp', { defaultValue: 'How long users stay logged in before requiring re-authentication.' })}
          >
            <select name="sessionTimeout" value={settings.sessionTimeout} onChange={handleChange} className="admin-form__input">
              <option value="1">1 hour</option>
              <option value="8">8 hours</option>
              <option value="24">24 hours</option>
              <option value="168">1 week</option>
            </select>
          </SettingsFormField>

          <SettingsFormField
            label={t('admin:maxLoginAttempts', { defaultValue: 'Max Login Attempts' })}
            help={t('admin:maxLoginAttemptsHelp', { defaultValue: 'Number of failed login attempts before account lockout.' })}
          >
            <input
              type="number"
              name="maxLoginAttempts"
              value={settings.maxLoginAttempts}
              onChange={handleChange}
              min="3"
              max="10"
              className="admin-form__input"
            />
          </SettingsFormField>

          <SettingsFormField
            label={t('admin:passwordMinLength', { defaultValue: 'Minimum Password Length' })}
            help={t('admin:passwordMinLengthHelp', { defaultValue: 'Minimum number of characters required for passwords.' })}
          >
            <input
              type="number"
              name="passwordMinLength"
              value={settings.passwordMinLength}
              onChange={handleChange}
              min="6"
              max="20"
              className="admin-form__input"
            />
          </SettingsFormField>
        </SettingsFormSection>

        <SettingsFormSection
          title={t('admin:advancedSecurity', { defaultValue: 'Advanced Security' })}
          description={t('admin:advancedSecurityDesc', { defaultValue: 'Additional security features and protections.' })}
          icon="gear"
        >
          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="requireTwoFactor"
              name="requireTwoFactor"
              checked={settings.requireTwoFactor}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="requireTwoFactor" className="admin-form__checkbox-label">
              {t('admin:requireTwoFactor', { defaultValue: 'Require Two-Factor Authentication' })}
            </label>
          </div>

          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="enableCaptcha"
              name="enableCaptcha"
              checked={settings.enableCaptcha}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="enableCaptcha" className="admin-form__checkbox-label">
              {t('admin:enableCaptcha', { defaultValue: 'Enable CAPTCHA for Login' })}
            </label>
          </div>
        </SettingsFormSection>

        <div className="admin-form__actions">
          <button type="submit" className="admin-button admin-button--primary">
            {t('admin:saveSettings', { defaultValue: 'Save Settings' })}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsSecurity;
