import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsFormSection from './SettingsFormSection';
import SettingsFormField from './SettingsFormField';

interface SettingsMailingsProps {
  onSave: (settings: any) => void;
}

const SettingsMailings: React.FC<SettingsMailingsProps> = ({ onSave }) => {
  const { t } = useTranslation(['admin', 'common']);
  const [settings, setSettings] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: '',
    fromName: '',
    newsletterEnabled: true,
    welcomeEmail: true,
    unsubscribeLink: true,
    trackOpens: false,
    trackClicks: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
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
          title={t('admin:smtpConfiguration', { defaultValue: 'SMTP Configuration' })}
          description={t('admin:smtpConfigDesc', { defaultValue: 'Configure email server settings for sending newsletters and notifications.' })}
          icon="gear"
        >
          <SettingsFormField
            label={t('admin:smtpHost', { defaultValue: 'SMTP Host' })}
            help={t('admin:smtpHostHelp', { defaultValue: 'Your email provider\'s SMTP server address.' })}
          >
            <input
              type="text"
              name="smtpHost"
              value={settings.smtpHost}
              onChange={handleChange}
              placeholder="smtp.gmail.com"
              className="admin-form__input"
            />
          </SettingsFormField>

          <div className="admin-form__input-group">
            <SettingsFormField
              label={t('admin:smtpPort', { defaultValue: 'SMTP Port' })}
              help={t('admin:smtpPortHelp', { defaultValue: 'Usually 587 for TLS or 465 for SSL.' })}
            >
              <input
                type="number"
                name="smtpPort"
                value={settings.smtpPort}
                onChange={handleChange}
                className="admin-form__input"
              />
            </SettingsFormField>

            <div className="admin-form__checkbox">
              <input
                type="checkbox"
                id="smtpSecure"
                name="smtpSecure"
                checked={settings.smtpSecure}
                onChange={handleChange}
                className="admin-form__checkbox-input"
              />
              <label htmlFor="smtpSecure" className="admin-form__checkbox-label">
                {t('admin:useSSL', { defaultValue: 'Use SSL/TLS' })}
              </label>
            </div>
          </div>

          <SettingsFormField
            label={t('admin:smtpUsername', { defaultValue: 'SMTP Username' })}
            help={t('admin:smtpUsernameHelp', { defaultValue: 'Your email account username.' })}
          >
            <input
              type="text"
              name="smtpUser"
              value={settings.smtpUser}
              onChange={handleChange}
              placeholder="your-email@gmail.com"
              className="admin-form__input"
            />
          </SettingsFormField>

          <SettingsFormField
            label={t('admin:smtpPassword', { defaultValue: 'SMTP Password' })}
            help={t('admin:smtpPasswordHelp', { defaultValue: 'Your email account password or app password.' })}
          >
            <input
              type="password"
              name="smtpPassword"
              value={settings.smtpPassword}
              onChange={handleChange}
              className="admin-form__input"
            />
          </SettingsFormField>
        </SettingsFormSection>

        <SettingsFormSection
          title={t('admin:emailSettings', { defaultValue: 'Email Settings' })}
          description={t('admin:emailSettingsDesc', { defaultValue: 'Configure sender information and email preferences.' })}
          icon="user"
        >
          <SettingsFormField
            label={t('admin:fromEmail', { defaultValue: 'From Email' })}
            help={t('admin:fromEmailHelp', { defaultValue: 'Email address that appears as sender.' })}
          >
            <input
              type="email"
              name="fromEmail"
              value={settings.fromEmail}
              onChange={handleChange}
              placeholder="noreply@example.com"
              className="admin-form__input"
            />
          </SettingsFormField>

          <SettingsFormField
            label={t('admin:fromName', { defaultValue: 'From Name' })}
            help={t('admin:fromNameHelp', { defaultValue: 'Name that appears as sender.' })}
          >
            <input
              type="text"
              name="fromName"
              value={settings.fromName}
              onChange={handleChange}
              placeholder="BlogPro Newsletter"
              className="admin-form__input"
            />
          </SettingsFormField>
        </SettingsFormSection>

        <SettingsFormSection
          title={t('admin:newsletterSettings', { defaultValue: 'Newsletter Settings' })}
          description={t('admin:newsletterSettingsDesc', { defaultValue: 'Configure newsletter and mailing list options.' })}
          icon="share"
        >
          <div className="admin-settings__notification-options">
            <div className="admin-form__checkbox">
              <input
                type="checkbox"
                id="newsletterEnabled"
                name="newsletterEnabled"
                checked={settings.newsletterEnabled}
                onChange={handleChange}
                className="admin-form__checkbox-input"
              />
              <label htmlFor="newsletterEnabled" className="admin-form__checkbox-label">
                {t('admin:enableNewsletter', { defaultValue: 'Enable Newsletter Signup' })}
              </label>
            </div>

            <div className="admin-form__checkbox">
              <input
                type="checkbox"
                id="welcomeEmail"
                name="welcomeEmail"
                checked={settings.welcomeEmail}
                onChange={handleChange}
                className="admin-form__checkbox-input"
              />
              <label htmlFor="welcomeEmail" className="admin-form__checkbox-label">
                {t('admin:sendWelcomeEmail', { defaultValue: 'Send Welcome Email' })}
              </label>
            </div>

            <div className="admin-form__checkbox">
              <input
                type="checkbox"
                id="unsubscribeLink"
                name="unsubscribeLink"
                checked={settings.unsubscribeLink}
                onChange={handleChange}
                className="admin-form__checkbox-input"
              />
              <label htmlFor="unsubscribeLink" className="admin-form__checkbox-label">
                {t('admin:includeUnsubscribe', { defaultValue: 'Include Unsubscribe Link' })}
              </label>
            </div>

            <div className="admin-form__checkbox">
              <input
                type="checkbox"
                id="trackOpens"
                name="trackOpens"
                checked={settings.trackOpens}
                onChange={handleChange}
                className="admin-form__checkbox-input"
              />
              <label htmlFor="trackOpens" className="admin-form__checkbox-label">
                {t('admin:trackEmailOpens', { defaultValue: 'Track Email Opens' })}
              </label>
            </div>

            <div className="admin-form__checkbox">
              <input
                type="checkbox"
                id="trackClicks"
                name="trackClicks"
                checked={settings.trackClicks}
                onChange={handleChange}
                className="admin-form__checkbox-input"
              />
              <label htmlFor="trackClicks" className="admin-form__checkbox-label">
                {t('admin:trackLinkClicks', { defaultValue: 'Track Link Clicks' })}
              </label>
            </div>
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

export default SettingsMailings;
