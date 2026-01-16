import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsFormSection from './SettingsFormSection';
import SettingsFormField from './SettingsFormField';

interface SettingsNotificationsProps {
  onSave: (settings: any) => void;
}

const SettingsNotifications: React.FC<SettingsNotificationsProps> = ({ onSave }) => {
  const { t } = useTranslation(['admin', 'common']);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    newComments: true,
    newUsers: true,
    systemAlerts: true,
    weeklyReports: false,
    notificationEmail: '',
    pushNotifications: true,
    browserNotifications: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
          title={t('admin:emailNotifications', { defaultValue: 'Email Notifications' })}
          description={t('admin:emailNotificationsDesc', { defaultValue: 'Configure which events trigger email notifications.' })}
          icon="bell"
        >
          <SettingsFormField
            label={t('admin:notificationEmail', { defaultValue: 'Notification Email' })}
            help={t('admin:notificationEmailHelp', { defaultValue: 'Email address to receive admin notifications.' })}
          >
            <input
              type="email"
              name="notificationEmail"
              value={settings.notificationEmail}
              onChange={handleChange}
              placeholder="admin@example.com"
              className="admin-form__input"
            />
          </SettingsFormField>

          <div className="admin-settings__notification-options">
            <div className="admin-form__checkbox">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="admin-form__checkbox-input"
              />
              <label htmlFor="emailNotifications" className="admin-form__checkbox-label">
                {t('admin:enableEmailNotifications', { defaultValue: 'Enable Email Notifications' })}
              </label>
            </div>

            <div className="admin-form__checkbox">
              <input
                type="checkbox"
                id="newComments"
                name="newComments"
                checked={settings.newComments}
                onChange={handleChange}
                className="admin-form__checkbox-input"
              />
              <label htmlFor="newComments" className="admin-form__checkbox-label">
                {t('admin:newComments', { defaultValue: 'New Comments' })}
              </label>
            </div>

            <div className="admin-form__checkbox">
              <input
                type="checkbox"
                id="newUsers"
                name="newUsers"
                checked={settings.newUsers}
                onChange={handleChange}
                className="admin-form__checkbox-input"
              />
              <label htmlFor="newUsers" className="admin-form__checkbox-label">
                {t('admin:newUsers', { defaultValue: 'New User Registrations' })}
              </label>
            </div>

            <div className="admin-form__checkbox">
              <input
                type="checkbox"
                id="systemAlerts"
                name="systemAlerts"
                checked={settings.systemAlerts}
                onChange={handleChange}
                className="admin-form__checkbox-input"
              />
              <label htmlFor="systemAlerts" className="admin-form__checkbox-label">
                {t('admin:systemAlerts', { defaultValue: 'System Alerts & Errors' })}
              </label>
            </div>

            <div className="admin-form__checkbox">
              <input
                type="checkbox"
                id="weeklyReports"
                name="weeklyReports"
                checked={settings.weeklyReports}
                onChange={handleChange}
                className="admin-form__checkbox-input"
              />
              <label htmlFor="weeklyReports" className="admin-form__checkbox-label">
                {t('admin:weeklyReports', { defaultValue: 'Weekly Analytics Reports' })}
              </label>
            </div>
          </div>
        </SettingsFormSection>

        <SettingsFormSection
          title={t('admin:browserNotifications', { defaultValue: 'Browser Notifications' })}
          description={t('admin:browserNotificationsDesc', { defaultValue: 'Real-time notifications in your browser.' })}
          icon="gear"
        >
          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="pushNotifications"
              name="pushNotifications"
              checked={settings.pushNotifications}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="pushNotifications" className="admin-form__checkbox-label">
              {t('admin:enablePushNotifications', { defaultValue: 'Enable Push Notifications' })}
            </label>
          </div>

          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="browserNotifications"
              name="browserNotifications"
              checked={settings.browserNotifications}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="browserNotifications" className="admin-form__checkbox-label">
              {t('admin:browserNotifications', { defaultValue: 'Browser Desktop Notifications' })}
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

export default SettingsNotifications;
