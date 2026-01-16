import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsFormSection from './SettingsFormSection';
import SettingsFormField from './SettingsFormField';

interface SettingsContactProps {
  onSave: (settings: any) => void;
}

const SettingsContact: React.FC<SettingsContactProps> = ({ onSave }) => {
  const { t } = useTranslation(['admin', 'common']);
  const [settings, setSettings] = useState({
    contactFormEnabled: true,
    requireCaptcha: true,
    autoReply: false,
    autoReplyMessage: '',
    contactEmail: '',
    phoneNumber: '',
    address: '',
    businessHours: '',
    responseTime: '24'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          title={t('admin:contactForm', { defaultValue: 'Contact Form' })}
          description={t('admin:contactFormDesc', { defaultValue: 'Configure your website contact form settings.' })}
          icon="users"
        >
          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="contactFormEnabled"
              name="contactFormEnabled"
              checked={settings.contactFormEnabled}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="contactFormEnabled" className="admin-form__checkbox-label">
              {t('admin:enableContactForm', { defaultValue: 'Enable Contact Form' })}
            </label>
          </div>

          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="requireCaptcha"
              name="requireCaptcha"
              checked={settings.requireCaptcha}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="requireCaptcha" className="admin-form__checkbox-label">
              {t('admin:requireCaptcha', { defaultValue: 'Require CAPTCHA' })}
            </label>
          </div>

          <SettingsFormField
            label={t('admin:responseTime', { defaultValue: 'Expected Response Time' })}
            help={t('admin:responseTimeHelp', { defaultValue: 'How quickly you typically respond to contact inquiries.' })}
          >
            <select name="responseTime" value={settings.responseTime} onChange={handleChange} className="admin-form__input">
              <option value="1">Within 1 hour</option>
              <option value="24">Within 24 hours</option>
              <option value="48">Within 2 days</option>
              <option value="168">Within 1 week</option>
            </select>
          </SettingsFormField>
        </SettingsFormSection>

        <SettingsFormSection
          title={t('admin:autoReply', { defaultValue: 'Auto-Reply' })}
          description={t('admin:autoReplyDesc', { defaultValue: 'Automatic responses to contact form submissions.' })}
          icon="bell"
        >
          <div className="admin-form__checkbox">
            <input
              type="checkbox"
              id="autoReply"
              name="autoReply"
              checked={settings.autoReply}
              onChange={handleChange}
              className="admin-form__checkbox-input"
            />
            <label htmlFor="autoReply" className="admin-form__checkbox-label">
              {t('admin:enableAutoReply', { defaultValue: 'Enable Auto-Reply' })}
            </label>
          </div>

          <SettingsFormField
            label={t('admin:autoReplyMessage', { defaultValue: 'Auto-Reply Message' })}
            help={t('admin:autoReplyMessageHelp', { defaultValue: 'Message sent automatically when someone submits the contact form.' })}
          >
            <textarea
              name="autoReplyMessage"
              value={settings.autoReplyMessage}
              onChange={handleChange}
              rows={4}
              placeholder="Thank you for contacting us. We will get back to you soon."
              className="admin-form__textarea"
            />
          </SettingsFormField>
        </SettingsFormSection>

        <SettingsFormSection
          title={t('admin:contactInformation', { defaultValue: 'Contact Information' })}
          description={t('admin:contactInformationDesc', { defaultValue: 'Your business contact details displayed on the website.' })}
          icon="users"
        >
          <SettingsFormField
            label={t('admin:contactEmail', { defaultValue: 'Contact Email' })}
            help={t('admin:contactEmailHelp', { defaultValue: 'Primary email for contact inquiries.' })}
          >
            <input
              type="email"
              name="contactEmail"
              value={settings.contactEmail}
              onChange={handleChange}
              placeholder="contact@example.com"
              className="admin-form__input"
            />
          </SettingsFormField>

          <SettingsFormField
            label={t('admin:phoneNumber', { defaultValue: 'Phone Number' })}
            help={t('admin:phoneNumberHelp', { defaultValue: 'Business phone number for customer contact.' })}
          >
            <input
              type="tel"
              name="phoneNumber"
              value={settings.phoneNumber}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className="admin-form__input"
            />
          </SettingsFormField>

          <SettingsFormField
            label={t('admin:address', { defaultValue: 'Business Address' })}
            help={t('admin:addressHelp', { defaultValue: 'Physical business address for contact page.' })}
          >
            <textarea
              name="address"
              value={settings.address}
              onChange={handleChange}
              rows={3}
              placeholder="123 Business St, City, State 12345"
              className="admin-form__textarea"
            />
          </SettingsFormField>

          <SettingsFormField
            label={t('admin:businessHours', { defaultValue: 'Business Hours' })}
            help={t('admin:businessHoursHelp', { defaultValue: 'When customers can expect to reach you.' })}
          >
            <textarea
              name="businessHours"
              value={settings.businessHours}
              onChange={handleChange}
              rows={3}
              placeholder="Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 10:00 AM - 2:00 PM\nSunday: Closed"
              className="admin-form__textarea"
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

export default SettingsContact;
