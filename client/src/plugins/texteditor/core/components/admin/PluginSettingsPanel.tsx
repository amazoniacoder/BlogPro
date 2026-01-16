/**
 * Plugin Settings Panel
 * 
 * Individual plugin configuration interface.
 * Allows administrators to configure plugin-specific settings.
 */

import React, { useState, useEffect } from 'react';
import { PluginSettings } from '../../../shared/utils/PluginSettings';
import { PluginRegistry } from '../../../plugins/core/PluginRegistry';

export interface PluginSettingsPanelProps {
  readonly pluginName: string;
  readonly onClose: () => void;
  readonly onSave: (settings: Record<string, any>) => void;
}

interface SettingField {
  readonly key: string;
  readonly label: string;
  readonly type: 'boolean' | 'number' | 'string' | 'select';
  readonly options?: string[];
  readonly min?: number;
  readonly max?: number;
  readonly defaultValue: any;
}

const PLUGIN_SETTINGS: Record<string, SettingField[]> = {
  'word-count': [
    { key: 'compact', label: 'Компактное отображение', type: 'boolean', defaultValue: true },
    { key: 'showWords', label: 'Показывать количество слов', type: 'boolean', defaultValue: true },
    { key: 'showCharacters', label: 'Показывать количество символов', type: 'boolean', defaultValue: true },
    { key: 'showReadingTime', label: 'Показывать время чтения', type: 'boolean', defaultValue: true },
    { key: 'readingSpeed', label: 'Скорость чтения (слов/мин)', type: 'number', min: 100, max: 500, defaultValue: 200 }
  ],
  'spell-check': [
    { key: 'enabled', label: 'Включить проверку орфографии', type: 'boolean', defaultValue: true },
    { key: 'autoDetect', label: 'Автоопределение языка', type: 'boolean', defaultValue: true },
    { key: 'checkGrammar', label: 'Проверка грамматики', type: 'boolean', defaultValue: false }
  ],
  'auto-save': [
    { key: 'enabled', label: 'Включить автосохранение', type: 'boolean', defaultValue: true },
    { key: 'interval', label: 'Интервал сохранения (мс)', type: 'number', min: 30000, max: 600000, defaultValue: 300000 }
  ],
  'performance-monitor': [
    { key: 'showButton', label: 'Показывать кнопку аналитики', type: 'boolean', defaultValue: true },
    { key: 'autoOpen', label: 'Автооткрытие панели', type: 'boolean', defaultValue: false }
  ]
};

export const PluginSettingsPanel: React.FC<PluginSettingsPanelProps> = ({
  pluginName,
  onClose,
  onSave
}) => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const settingFields = PLUGIN_SETTINGS[pluginName] || [];

  useEffect(() => {
    // Load current settings
    const currentSettings = PluginSettings.getConfig(pluginName);
    const initialSettings: Record<string, any> = {};
    
    settingFields.forEach(field => {
      initialSettings[field.key] = currentSettings[field.key] ?? field.defaultValue;
    });
    
    setSettings(initialSettings);
  }, [pluginName, settingFields]);

  const handleSettingChange = (key: string, value: any): void => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = (): void => {
    PluginSettings.updateConfig(pluginName, settings);
    onSave(settings);
    setHasChanges(false);
    
    // Update plugin if it's currently initialized
    if (PluginRegistry.isInitialized(pluginName)) {
      const plugin = PluginRegistry.getPlugin(pluginName);
      if (plugin && 'updateConfig' in plugin) {
        (plugin as any).updateConfig(settings);
      }
    }
  };

  const handleReset = (): void => {
    const defaultSettings: Record<string, any> = {};
    settingFields.forEach(field => {
      defaultSettings[field.key] = field.defaultValue;
    });
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const renderField = (field: SettingField): React.ReactNode => {
    const value = settings[field.key];

    switch (field.type) {
      case 'boolean':
        return (
          <label className="setting-field">
            <span className="setting-label">{field.label}</span>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleSettingChange(field.key, e.target.checked)}
            />
          </label>
        );

      case 'number':
        return (
          <label className="setting-field">
            <span className="setting-label">{field.label}</span>
            <input
              type="number"
              value={value || field.defaultValue}
              min={field.min}
              max={field.max}
              onChange={(e) => handleSettingChange(field.key, parseInt(e.target.value, 10))}
            />
          </label>
        );

      case 'string':
        return (
          <label className="setting-field">
            <span className="setting-label">{field.label}</span>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleSettingChange(field.key, e.target.value)}
            />
          </label>
        );

      case 'select':
        return (
          <label className="setting-field">
            <span className="setting-label">{field.label}</span>
            <select
              value={value || field.defaultValue}
              onChange={(e) => handleSettingChange(field.key, e.target.value)}
            >
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        );

      default:
        return null;
    }
  };

  if (settingFields.length === 0) {
    return (
      <div className="plugin-settings-panel">
        <div className="panel-header">
          <h3>Настройки: {pluginName}</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className="panel-content">
          <p>Нет настраиваемых параметров для этого плагина.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="plugin-settings-panel">
      <div className="panel-header">
        <h3>Настройки: {pluginName}</h3>
        <button onClick={onClose}>×</button>
      </div>
      
      <div className="panel-content">
        <div className="settings-form">
          {settingFields.map(field => (
            <div key={field.key} className="setting-row">
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>
      
      <div className="panel-footer">
        <button 
          onClick={handleReset}
          className="reset-button"
          disabled={!hasChanges}
        >
          Сбросить по умолчанию
        </button>
        <button 
          onClick={handleSave}
          className="save-button"
          disabled={!hasChanges}
        >
          Сохранить изменения
        </button>
      </div>
    </div>
  );
};
