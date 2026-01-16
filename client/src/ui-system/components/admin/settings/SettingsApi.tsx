import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsFormSection from './SettingsFormSection';
import SettingsFormField from './SettingsFormField';
import { Icon } from '@/ui-system/icons/components';

interface SettingsApiProps {
  onSave: (settings: any) => void;
}

const SettingsApi: React.FC<SettingsApiProps> = ({ onSave }) => {
  const { t } = useTranslation(['admin', 'common']);
  const [settings, setSettings] = useState({
    apiEnabled: true,
    rateLimitEnabled: true,
    rateLimitRequests: '100',
    rateLimitWindow: '15',
    requireApiKey: true,
    corsEnabled: true,
    allowedOrigins: '',
    webhooksEnabled: false,
    webhookUrl: '',
    logApiRequests: true
  });
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Default API Key', key: 'bp_' + Math.random().toString(36).substr(2, 32), created: '2024-01-15' }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: `API Key ${apiKeys.length + 1}`,
      key: 'bp_' + Math.random().toString(36).substr(2, 32),
      created: new Date().toISOString().split('T')[0]
    };
    setApiKeys(prev => [...prev, newKey]);
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...settings, apiKeys });
  };

  return (
    <div className="settings-content__panel settings-content__panel--active">
      <form onSubmit={handleSubmit}>
        <SettingsFormSection
          title={t('admin:apiConfiguration', { defaultValue: 'API Configuration' })}
          description={t('admin:apiConfigDesc', { defaultValue: 'Configure REST API access and security settings.' })}
          icon="puzzle"
        >
          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="apiEnabled"
              name="apiEnabled"
              checked={settings.apiEnabled}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="apiEnabled" className="admin-form__checkbox-label">
              {t('admin:enableApi', { defaultValue: 'Enable REST API' })}
            </label>
          </div>

          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="requireApiKey"
              name="requireApiKey"
              checked={settings.requireApiKey}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="requireApiKey" className="admin-form__checkbox-label">
              {t('admin:requireApiKey', { defaultValue: 'Require API Key Authentication' })}
            </label>
          </div>

          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="logApiRequests"
              name="logApiRequests"
              checked={settings.logApiRequests}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="logApiRequests" className="admin-form__checkbox-label">
              {t('admin:logApiRequests', { defaultValue: 'Log API Requests' })}
            </label>
          </div>
        </SettingsFormSection>

        <SettingsFormSection
          title={t('admin:rateLimiting', { defaultValue: 'Rate Limiting' })}
          description={t('admin:rateLimitingDesc', { defaultValue: 'Protect your API from abuse with rate limiting.' })}
          icon="gear"
        >
          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="rateLimitEnabled"
              name="rateLimitEnabled"
              checked={settings.rateLimitEnabled}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="rateLimitEnabled" className="admin-form__checkbox-label">
              {t('admin:enableRateLimit', { defaultValue: 'Enable Rate Limiting' })}
            </label>
          </div>

          <div className="admin-form__input-group">
            <SettingsFormField
              label={t('admin:maxRequests', { defaultValue: 'Max Requests' })}
              help={t('admin:maxRequestsHelp', { defaultValue: 'Maximum requests per time window.' })}
            >
              <input
                type="number"
                name="rateLimitRequests"
                value={settings.rateLimitRequests}
                onChange={handleChange}
                min="10"
                max="1000"
                className="admin-form__input"
              />
            </SettingsFormField>

            <SettingsFormField
              label={t('admin:timeWindow', { defaultValue: 'Time Window (minutes)' })}
              help={t('admin:timeWindowHelp', { defaultValue: 'Time window for rate limiting.' })}
            >
              <select name="rateLimitWindow" value={settings.rateLimitWindow} onChange={handleChange} className="admin-form__input">
                <option value="1">1 minute</option>
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="60">1 hour</option>
              </select>
            </SettingsFormField>
          </div>
        </SettingsFormSection>

        <SettingsFormSection
          title={t('admin:corsSettings', { defaultValue: 'CORS Settings' })}
          description={t('admin:corsSettingsDesc', { defaultValue: 'Configure Cross-Origin Resource Sharing for web applications.' })}
          icon="share"
        >
          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="corsEnabled"
              name="corsEnabled"
              checked={settings.corsEnabled}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="corsEnabled" className="admin-form__checkbox-label">
              {t('admin:enableCors', { defaultValue: 'Enable CORS' })}
            </label>
          </div>

          <SettingsFormField
            label={t('admin:allowedOrigins', { defaultValue: 'Allowed Origins' })}
            help={t('admin:allowedOriginsHelp', { defaultValue: 'Comma-separated list of allowed origins. Use * for all origins.' })}
          >
            <textarea
              name="allowedOrigins"
              value={settings.allowedOrigins}
              onChange={handleChange}
              rows={3}
              placeholder="https://example.com, https://app.example.com"
              className="admin-form__textarea"
            />
          </SettingsFormField>
        </SettingsFormSection>

        <SettingsFormSection
          title={t('admin:apiKeys', { defaultValue: 'API Keys' })}
          description={t('admin:apiKeysDesc', { defaultValue: 'Manage API keys for authentication.' })}
          icon="gear"
        >
          <div className="admin-form__actions" style={{ marginBottom: '1rem' }}>
            <button type="button" onClick={generateApiKey} className="admin-button admin-button--secondary">
              <Icon name="add" size={16} />
              {t('admin:generateApiKey', { defaultValue: 'Generate New API Key' })}
            </button>
          </div>

          <div className="api-keys-list">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="api-key-item">
                <div className="api-key-info">
                  <strong>{apiKey.name}</strong>
                  <code className="api-key-value">{apiKey.key}</code>
                  <small>Created: {apiKey.created}</small>
                </div>
                <button
                  type="button"
                  onClick={() => deleteApiKey(apiKey.id)}
                  className="admin-button admin-button--danger admin-button--small"
                >
                  <Icon name="delete" size={14} />
                </button>
              </div>
            ))}
          </div>
        </SettingsFormSection>

        <SettingsFormSection
          title={t('admin:webhooks', { defaultValue: 'Webhooks' })}
          description={t('admin:webhooksDesc', { defaultValue: 'Configure webhooks for real-time notifications.' })}
          icon="share"
        >
          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="webhooksEnabled"
              name="webhooksEnabled"
              checked={settings.webhooksEnabled}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="webhooksEnabled" className="admin-form__checkbox-label">
              {t('admin:enableWebhooks', { defaultValue: 'Enable Webhooks' })}
            </label>
          </div>

          <SettingsFormField
            label={t('admin:webhookUrl', { defaultValue: 'Webhook URL' })}
            help={t('admin:webhookUrlHelp', { defaultValue: 'URL to receive webhook notifications.' })}
          >
            <input
              type="url"
              name="webhookUrl"
              value={settings.webhookUrl}
              onChange={handleChange}
              placeholder="https://your-app.com/webhook"
              className="admin-form__input"
            />
          </SettingsFormField>
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

export default SettingsApi;
