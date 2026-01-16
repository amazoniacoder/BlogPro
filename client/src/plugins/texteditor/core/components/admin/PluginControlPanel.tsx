import { Icon } from '../../../../../ui-system/icons/components';
/**
 * Plugin Control Panel
 * 
 * Administrator interface for managing editor plugins.
 * Provides enable/disable controls and plugin status monitoring.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PluginRegistry } from '../../../plugins/core/PluginRegistry';
import { PluginMetadata } from '../../../plugins/core/PluginInterface';
import { PluginSettings } from '../../../shared/utils/PluginSettings';
import { PluginSettingsPanel } from './PluginSettingsPanel';
import './PluginControlPanel.css';

export interface PluginControlPanelProps {
  readonly userRole: string;
  readonly onClose: () => void;
  readonly className?: string;
}

interface PluginState {
  readonly metadata: PluginMetadata;
  readonly isInitialized: boolean;
  readonly isEnabled: boolean;
  readonly hasError: boolean;
  readonly errorMessage?: string;
}

export const PluginControlPanel: React.FC<PluginControlPanelProps> = ({
  userRole,
  onClose,
  className = ''
}) => {
  const [pluginStates, setPluginStates] = useState<PluginState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsPlugin, setSettingsPlugin] = useState<string | null>(null);

  /**
   * Load plugin states from registry and settings
   */
  const loadPluginStates = useCallback((): void => {
    try {
      const registeredPlugins = PluginRegistry.getRegisteredPlugins();
      const initializedPlugins = PluginRegistry.getInitializedPlugins();
      
      const states: PluginState[] = registeredPlugins.map(metadata => ({
        metadata,
        isInitialized: initializedPlugins.includes(metadata.name),
        isEnabled: PluginSettings.isEnabled(metadata.name),
        hasError: false // TODO: Implement error tracking
      }));
      
      setPluginStates(states);
    } catch (error) {

    }
  }, []);

  /**
   * Toggle plugin enabled state
   */
  const togglePlugin = useCallback(async (pluginName: string): Promise<void> => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const currentState = pluginStates.find(state => state.metadata.name === pluginName);
      if (!currentState) return;
      
      if (currentState.isInitialized) {
        await PluginRegistry.destroy(pluginName);
      } else {
        // Get saved config and merge with default config
        const savedConfig = PluginSettings.getConfig(pluginName);
        let defaultConfig = {};
        
        // Set default configs for built-in plugins
        if (pluginName === 'word-count') {
          defaultConfig = {
            compact: true,
            showWords: true,
            showCharacters: true,
            showReadingTime: true,
            mountPoint: '.editor-footer-controls'
          };
        } else if (pluginName === 'spell-check') {
          defaultConfig = {
            enabled: true,
            mountPoint: '.editor-footer-left'
          };
        } else if (pluginName === 'performance-monitor') {
          defaultConfig = {
            userRole: 'admin',
            mountPoint: '.editor-footer-right'
          };
        }
        
        const config = { ...defaultConfig, ...savedConfig };
        await PluginRegistry.initialize(pluginName, config);
      }
      
      // Toggle settings
      const newEnabled = PluginSettings.toggle(pluginName);
      
      // Update state
      setPluginStates(prev => prev.map(state => 
        state.metadata.name === pluginName
          ? { ...state, isInitialized: !state.isInitialized, isEnabled: newEnabled }
          : state
      ));
      
    } catch (error) {

      
      // Update error state
      setPluginStates(prev => prev.map(state => 
        state.metadata.name === pluginName
          ? { ...state, hasError: true, errorMessage: (error as Error).message }
          : state
      ));
    } finally {
      setIsLoading(false);
    }
  }, [pluginStates, isLoading]);

  /**
   * Clear plugin error
   */
  const clearError = useCallback((pluginName: string): void => {
    setPluginStates(prev => prev.map(state => 
      state.metadata.name === pluginName
        ? { ...state, hasError: false, errorMessage: undefined }
        : state
    ));
  }, []);

  /**
   * Export plugin settings
   */
  const exportSettings = useCallback((): void => {
    try {
      const settings = PluginSettings.export();
      const blob = new Blob([settings], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `plugin-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {

    }
  }, []);

  /**
   * Open plugin settings
   */
  const openSettings = useCallback((pluginName: string): void => {
    setSettingsPlugin(pluginName);
  }, []);

  /**
   * Handle settings save
   */
  const handleSettingsSave = useCallback((): void => {
    setSettingsPlugin(null);
    loadPluginStates(); // Refresh plugin states
  }, [loadPluginStates]);

  // Load initial state
  useEffect(() => {
    loadPluginStates();
  }, [loadPluginStates]);

  // Refresh state periodically
  useEffect(() => {
    const interval = setInterval(loadPluginStates, 5000);
    return () => clearInterval(interval);
  }, [loadPluginStates]);

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className={`plugin-control-panel ${className}`}>
      <div className="panel-header">
        <h3>Управление плагинами</h3>
        <div className="panel-actions">
          <button 
            onClick={exportSettings}
            className="export-button"
            title="Экспорт настроек плагинов"
          >
            📤 Экспорт
          </button>
          <button 
            onClick={onClose}
            className="close-button"
            aria-label="Закрыть панель плагинов"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="panel-stats">
        <span className="stat">
          Всего: {pluginStates.length}
        </span>
        <span className="stat">
          Активных: {pluginStates.filter(s => s.isInitialized).length}
        </span>
        <span className="stat">
          Ошибок: {pluginStates.filter(s => s.hasError).length}
        </span>
      </div>
      
      <div className="plugin-list">
        {pluginStates.length === 0 ? (
          <div className="no-plugins">Плагины не зарегистрированы</div>
        ) : (
          pluginStates.map(state => (
            <div 
              key={state.metadata.name} 
              className={`plugin-item ${state.hasError ? 'plugin-item--error' : ''}`}
            >
              <div className="plugin-info">
                <h4 className="plugin-name">{state.metadata.name}</h4>
                <p className="plugin-description">{state.metadata.description}</p>
                <div className="plugin-meta">
                  <span className="plugin-version">v{state.metadata.version}</span>
                  {state.metadata.dependencies && state.metadata.dependencies.length > 0 && (
                    <span className="plugin-deps">
                      Зависимости: {state.metadata.dependencies.join(', ')}
                    </span>
                  )}
                </div>
                {state.hasError && (
                  <div className="plugin-error">
                    <span className="error-message">{state.errorMessage}</span>
                    <button 
                      onClick={() => clearError(state.metadata.name)}
                      className="clear-error-button"
                    >
                      Очистить
                    </button>
                  </div>
                )}
              </div>
              
              <div className="plugin-controls">
                <div className={`plugin-status ${state.isInitialized ? 'active' : 'inactive'}`}>
                  {state.isInitialized ? 'Активен' : 'Неактивен'}
                </div>
                <div className="plugin-actions">
                  <button
                    onClick={() => openSettings(state.metadata.name)}
                    className="settings-button"
                    title="Настройки плагина"
                  >
                    <Icon name="gear" size={16} />
                  </button>
                  <label className="plugin-toggle">
                    <input
                      type="checkbox"
                      checked={state.isInitialized}
                      onChange={() => togglePlugin(state.metadata.name)}
                      disabled={isLoading}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="panel-footer">
        <button 
          onClick={loadPluginStates}
          className="refresh-button"
          disabled={isLoading}
        >
          {isLoading ? '🔄 Загрузка...' : '🔄 Обновить'}
        </button>
      </div>
      
      {settingsPlugin && (
        <PluginSettingsPanel
          pluginName={settingsPlugin}
          onClose={() => setSettingsPlugin(null)}
          onSave={handleSettingsSave}
        />
      )}
    </div>
  );
};
