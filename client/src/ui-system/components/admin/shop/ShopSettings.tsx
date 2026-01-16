import React, { useState, useEffect } from 'react';
import { Icon } from '../../../icons/components';

export interface ShopSettingsData {
  storeName: string;
  storeDescription: string;
  currency: string;
  taxRate: number;
  shippingRate: number;
  freeShippingThreshold: number;
  allowBackorders: boolean;
  lowStockThreshold: number;
  emailNotifications: boolean;
}

export const ShopSettings: React.FC = () => {
  const [settings, setSettings] = useState<ShopSettingsData>({
    storeName: '',
    storeDescription: '',
    currency: 'USD',
    taxRate: 0,
    shippingRate: 0,
    freeShippingThreshold: 0,
    allowBackorders: false,
    lowStockThreshold: 10,
    emailNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // Skip API call - not implemented yet
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/shop/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        // Show success message
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ShopSettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="shop-settings__loading">Loading settings...</div>;
  }

  return (
    <div className="shop-settings">
      <div className="shop-settings__header">
        <h1 className="shop-settings__title">Shop Settings</h1>
        <button 
          className="shop-settings__save-btn"
          onClick={saveSettings}
          disabled={saving}
        >
          <Icon name="save" size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="shop-settings__sections">
        <div className="shop-settings__section">
          <h3 className="shop-settings__section-title">Store Information</h3>
          
          <div className="shop-settings__field">
            <label className="shop-settings__label">Store Name</label>
            <input
              type="text"
              className="shop-settings__input"
              value={settings.storeName}
              onChange={(e) => handleInputChange('storeName', e.target.value)}
              placeholder="Enter store name"
            />
          </div>

          <div className="shop-settings__field">
            <label className="shop-settings__label">Store Description</label>
            <textarea
              className="shop-settings__textarea"
              value={settings.storeDescription}
              onChange={(e) => handleInputChange('storeDescription', e.target.value)}
              placeholder="Enter store description"
              rows={3}
            />
          </div>

          <div className="shop-settings__field">
            <label className="shop-settings__label">Currency</label>
            <select
              className="shop-settings__select"
              value={settings.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="RUB">RUB - Russian Ruble</option>
            </select>
          </div>
        </div>

        <div className="shop-settings__section">
          <h3 className="shop-settings__section-title">Pricing & Shipping</h3>
          
          <div className="shop-settings__field">
            <label className="shop-settings__label">Tax Rate (%)</label>
            <input
              type="number"
              className="shop-settings__input"
              value={settings.taxRate}
              onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.01"
            />
          </div>

          <div className="shop-settings__field">
            <label className="shop-settings__label">Shipping Rate</label>
            <input
              type="number"
              className="shop-settings__input"
              value={settings.shippingRate}
              onChange={(e) => handleInputChange('shippingRate', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="shop-settings__field">
            <label className="shop-settings__label">Free Shipping Threshold</label>
            <input
              type="number"
              className="shop-settings__input"
              value={settings.freeShippingThreshold}
              onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="shop-settings__section">
          <h3 className="shop-settings__section-title">Inventory Settings</h3>
          
          <div className="shop-settings__field">
            <label className="shop-settings__checkbox-label">
              <input
                type="checkbox"
                className="shop-settings__checkbox"
                checked={settings.allowBackorders}
                onChange={(e) => handleInputChange('allowBackorders', e.target.checked)}
              />
              Allow backorders when out of stock
            </label>
          </div>

          <div className="shop-settings__field">
            <label className="shop-settings__label">Low Stock Threshold</label>
            <input
              type="number"
              className="shop-settings__input"
              value={settings.lowStockThreshold}
              onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        <div className="shop-settings__section">
          <h3 className="shop-settings__section-title">Notifications</h3>
          
          <div className="shop-settings__field">
            <label className="shop-settings__checkbox-label">
              <input
                type="checkbox"
                className="shop-settings__checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
              />
              Send email notifications for new orders
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
