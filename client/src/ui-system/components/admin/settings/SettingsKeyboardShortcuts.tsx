import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';

interface Shortcut {
  keys: string[];
  description: string;
  action: string;
}

const SettingsKeyboardShortcuts: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [isVisible, setIsVisible] = useState(false);

  const shortcuts: Shortcut[] = [
    {
      keys: ['Ctrl', 'S'],
      description: t('admin:saveSettings', { defaultValue: 'Save Settings' }),
      action: 'save'
    },
    {
      keys: ['Ctrl', 'Z'],
      description: t('admin:discardChanges', { defaultValue: 'Discard Changes' }),
      action: 'discard'
    },
    {
      keys: ['Tab'],
      description: t('admin:nextField', { defaultValue: 'Next Field' }),
      action: 'navigate'
    },
    {
      keys: ['Shift', 'Tab'],
      description: t('admin:previousField', { defaultValue: 'Previous Field' }),
      action: 'navigate'
    },
    {
      keys: ['←', '→'],
      description: t('admin:switchTabs', { defaultValue: 'Switch Tabs' }),
      action: 'tabs'
    },
    {
      keys: ['?'],
      description: t('admin:showShortcuts', { defaultValue: 'Show Shortcuts' }),
      action: 'help'
    }
  ];

  return (
    <>
      <button
        className="settings-shortcuts-toggle"
        onClick={() => setIsVisible(!isVisible)}
        title={t('admin:keyboardShortcuts', { defaultValue: 'Keyboard Shortcuts' })}
      >
        <Icon name="info" size={16} />
      </button>

      {isVisible && (
        <div className="settings-shortcuts-modal">
          <div className="settings-shortcuts-modal__backdrop" onClick={() => setIsVisible(false)} />
          <div className="settings-shortcuts-modal__content">
            <div className="settings-shortcuts-modal__header">
              <h3 className="settings-shortcuts-modal__title">
                {t('admin:keyboardShortcuts', { defaultValue: 'Keyboard Shortcuts' })}
              </h3>
              <button
                className="settings-shortcuts-modal__close"
                onClick={() => setIsVisible(false)}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            
            <div className="settings-shortcuts-modal__list">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="settings-shortcut">
                  <div className="settings-shortcut__keys">
                    {shortcut.keys.map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        <kbd className="settings-shortcut__key">{key}</kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="settings-shortcut__plus">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <span className="settings-shortcut__description">
                    {shortcut.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsKeyboardShortcuts;
