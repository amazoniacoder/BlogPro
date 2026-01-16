/**
 * Spell Check Settings Component
 * 
 * Professional settings panel for spell check configuration.
 * Provides comprehensive control over spell checking behavior.
 * 
 * Features:
 * - Enable/disable spell check toggle
 * - Language selection (EN/RU)
 * - Auto-detection settings
 * - Custom dictionary toggle
 * - Performance settings
 * - Configuration persistence
 * 
 * @author BlogPro Text Editor Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, SpellCheckConfig } from '../types/spellCheckTypes';
import './SpellCheckSettings.css';

interface SpellCheckSettingsProps {
  /** Settings panel visibility */
  isOpen: boolean;
  /** Close panel callback */
  onClose: () => void;
  /** Current configuration */
  config: SpellCheckConfig;
  /** Configuration change callback */
  onConfigChange: (config: Partial<SpellCheckConfig>) => void;
  /** Current language */
  currentLanguage: Language;
}

const SpellCheckSettings: React.FC<SpellCheckSettingsProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  currentLanguage
}) => {
  const [localConfig, setLocalConfig] = useState<SpellCheckConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const spellCheckService = useRef<any>(null);

  // Initialize service
  useEffect(() => {
    const initService = async () => {
      try {
        // Use direct instantiation to avoid circular dependency
        const { UnifiedSpellCheckService } = await import('../services/spellcheck/UnifiedSpellCheckService');
        spellCheckService.current = new UnifiedSpellCheckService();
        await spellCheckService.current.initialize();
      } catch (error) {
        console.error('Failed to initialize spell check service:', error);
      }
    };
    initService();
  }, []);

  // Update local config when props change
  useEffect(() => {
    setLocalConfig(config);
    setHasChanges(false);
  }, [config]);

  // Check for changes
  useEffect(() => {
    const configChanged = JSON.stringify(localConfig) !== JSON.stringify(config);
    setHasChanges(configChanged);
  }, [localConfig, config]);

  // Handle setting change
  const handleSettingChange = useCallback(<K extends keyof SpellCheckConfig>(
    key: K,
    value: SpellCheckConfig[K]
  ) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // Apply settings
  const handleApplySettings = useCallback(async () => {
    if (!spellCheckService.current) return;

    setIsApplying(true);

    try {
      // Update service configuration
      spellCheckService.current.updateConfig(localConfig);
      
      // Notify parent component
      onConfigChange(localConfig);
      
      setHasChanges(false);
      
      // Save to localStorage for persistence
      localStorage.setItem('spellcheck-config', JSON.stringify(localConfig));
      
      console.log('SpellCheck: Settings applied successfully', localConfig);
    } catch (error) {
      console.error('SpellCheck: Failed to apply settings', error);
    } finally {
      setIsApplying(false);
    }
  }, [localConfig, onConfigChange]);

  // Reset settings
  const handleResetSettings = useCallback(() => {
    const defaultConfig: SpellCheckConfig = {
      enabled: true,
      languages: ['en', 'ru'],
      autoDetect: true,
      customDictionary: true,
      autoCorrect: false,
      checkGrammar: false,
      debounceDelay: 500
    };
    
    setLocalConfig(defaultConfig);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Enter' && event.ctrlKey && hasChanges) {
        handleApplySettings();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, hasChanges, handleApplySettings]);

  if (!isOpen) return null;

  return (
    <div className="spell-check-settings-overlay">
      <div 
        ref={panelRef} 
        className="spell-check-settings-panel"
        role="dialog"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div className="spell-check-settings__header">
          <h3 id="settings-title" className="spell-check-settings__title">
            Spell Check Settings
          </h3>
          <button
            className="spell-check-settings__close"
            onClick={onClose}
            aria-label="Close settings panel"
          >
            ✕
          </button>
        </div>

        {/* Settings Content */}
        <div className="spell-check-settings__content">
          
          {/* Enable/Disable */}
          <div className="spell-check-settings__section">
            <div className="spell-check-settings__option">
              <div className="spell-check-settings__option-info">
                <label className="spell-check-settings__label">
                  Enable Spell Check
                </label>
                <p className="spell-check-settings__description">
                  Turn spell checking on or off for the editor
                </p>
              </div>
              <div 
                className={`spell-check-settings__toggle ${localConfig.enabled ? 'spell-check-settings__toggle--active' : ''}`}
                onClick={() => handleSettingChange('enabled', !localConfig.enabled)}
                role="switch"
                aria-checked={localConfig.enabled}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSettingChange('enabled', !localConfig.enabled);
                  }
                }}
              />
            </div>
          </div>

          {/* Language Settings */}
          <div className="spell-check-settings__section">
            <h4 className="spell-check-settings__section-title">Language Settings</h4>
            
            {/* Auto-Detection */}
            <div className="spell-check-settings__option">
              <div className="spell-check-settings__option-info">
                <label className="spell-check-settings__label">
                  Auto-Detect Language
                </label>
                <p className="spell-check-settings__description">
                  Automatically detect English or Russian text
                </p>
              </div>
              <div 
                className={`spell-check-settings__toggle ${localConfig.autoDetect ? 'spell-check-settings__toggle--active' : ''}`}
                onClick={() => handleSettingChange('autoDetect', !localConfig.autoDetect)}
                role="switch"
                aria-checked={localConfig.autoDetect}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSettingChange('autoDetect', !localConfig.autoDetect);
                  }
                }}
              />
            </div>

            {/* Supported Languages */}
            <div className="spell-check-settings__option">
              <div className="spell-check-settings__option-info">
                <label className="spell-check-settings__label">
                  Supported Languages
                </label>
                <p className="spell-check-settings__description">
                  Select which languages to check
                </p>
              </div>
              <div className="spell-check-settings__language-checkboxes">
                <label className="spell-check-settings__checkbox">
                  <input
                    type="checkbox"
                    checked={localConfig.languages.includes('en')}
                    onChange={(e) => {
                      const languages = e.target.checked
                        ? [...localConfig.languages.filter(l => l !== 'en'), 'en']
                        : localConfig.languages.filter(l => l !== 'en');
                      handleSettingChange('languages', languages as Language[]);
                    }}
                  />
                  <span className="spell-check-settings__checkbox-label">English</span>
                </label>
                <label className="spell-check-settings__checkbox">
                  <input
                    type="checkbox"
                    checked={localConfig.languages.includes('ru')}
                    onChange={(e) => {
                      const languages = e.target.checked
                        ? [...localConfig.languages.filter(l => l !== 'ru'), 'ru']
                        : localConfig.languages.filter(l => l !== 'ru');
                      handleSettingChange('languages', languages as Language[]);
                    }}
                  />
                  <span className="spell-check-settings__checkbox-label">Russian</span>
                </label>
              </div>
            </div>
          </div>

          {/* Dictionary Settings */}
          <div className="spell-check-settings__section">
            <h4 className="spell-check-settings__section-title">Dictionary Settings</h4>
            
            <div className="spell-check-settings__option">
              <div className="spell-check-settings__option-info">
                <label className="spell-check-settings__label">
                  Use Custom Dictionary
                </label>
                <p className="spell-check-settings__description">
                  Include words from your personal dictionary
                </p>
              </div>
              <div 
                className={`spell-check-settings__toggle ${localConfig.customDictionary ? 'spell-check-settings__toggle--active' : ''}`}
                onClick={() => handleSettingChange('customDictionary', !localConfig.customDictionary)}
                role="switch"
                aria-checked={localConfig.customDictionary}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSettingChange('customDictionary', !localConfig.customDictionary);
                  }
                }}
              />
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="spell-check-settings__section">
            <h4 className="spell-check-settings__section-title">Advanced Settings</h4>
            
            {/* Auto-Correction */}
            <div className="spell-check-settings__option">
              <div className="spell-check-settings__option-info">
                <label className="spell-check-settings__label">
                  Auto-Correction
                </label>
                <p className="spell-check-settings__description">
                  Automatically fix common typos as you type
                </p>
              </div>
              <div 
                className={`spell-check-settings__toggle ${localConfig.autoCorrect ? 'spell-check-settings__toggle--active' : ''}`}
                onClick={() => handleSettingChange('autoCorrect', !localConfig.autoCorrect)}
                role="switch"
                aria-checked={localConfig.autoCorrect}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSettingChange('autoCorrect', !localConfig.autoCorrect);
                  }
                }}
              />
            </div>

            {/* Grammar Check */}
            <div className="spell-check-settings__option">
              <div className="spell-check-settings__option-info">
                <label className="spell-check-settings__label">
                  Grammar Check
                </label>
                <p className="spell-check-settings__description">
                  Check for basic grammar and punctuation errors
                </p>
              </div>
              <div 
                className={`spell-check-settings__toggle ${localConfig.checkGrammar ? 'spell-check-settings__toggle--active' : ''}`}
                onClick={() => handleSettingChange('checkGrammar', !localConfig.checkGrammar)}
                role="switch"
                aria-checked={localConfig.checkGrammar}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSettingChange('checkGrammar', !localConfig.checkGrammar);
                  }
                }}
              />
            </div>

            {/* Debounce Delay */}
            <div className="spell-check-settings__option">
              <div className="spell-check-settings__option-info">
                <label className="spell-check-settings__label">
                  Check Delay
                </label>
                <p className="spell-check-settings__description">
                  Delay before checking spelling (milliseconds)
                </p>
              </div>
              <select
                value={localConfig.debounceDelay}
                onChange={(e) => handleSettingChange('debounceDelay', parseInt(e.target.value))}
                className="spell-check-settings__select"
              >
                <option value={200}>200ms (Fast)</option>
                <option value={500}>500ms (Normal)</option>
                <option value={1000}>1000ms (Slow)</option>
                <option value={2000}>2000ms (Very Slow)</option>
              </select>
            </div>
          </div>

          {/* Current Status */}
          <div className="spell-check-settings__status">
            <div className="spell-check-settings__status-item">
              <span className="spell-check-settings__status-label">Current Language:</span>
              <span className="spell-check-settings__status-value">
                {currentLanguage.toUpperCase()}
              </span>
            </div>
            <div className="spell-check-settings__status-item">
              <span className="spell-check-settings__status-label">Status:</span>
              <span className={`spell-check-settings__status-value ${localConfig.enabled ? 'enabled' : 'disabled'}`}>
                {localConfig.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="spell-check-settings__actions">
          <div className="spell-check-settings__actions-left">
            <button
              onClick={handleResetSettings}
              className="spell-check-settings__action-button spell-check-settings__action-button--secondary"
              disabled={isApplying}
            >
              Reset to Defaults
            </button>
          </div>
          
          <div className="spell-check-settings__actions-right">
            <button
              onClick={onClose}
              className="spell-check-settings__action-button spell-check-settings__action-button--secondary"
              disabled={isApplying}
            >
              Cancel
            </button>
            <button
              onClick={handleApplySettings}
              className="spell-check-settings__action-button spell-check-settings__action-button--primary"
              disabled={!hasChanges || isApplying}
              title={hasChanges ? 'Apply changes (Ctrl+Enter)' : 'No changes to apply'}
            >
              {isApplying ? 'Applying...' : 'Apply Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellCheckSettings;
