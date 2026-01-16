import React, { useState, useEffect, useRef, RefObject } from 'react';
import { Language, SpellCheckConfig } from '../../types/spellCheckTypes';
import SpellCheckIndicator from '../SpellCheckIndicator';
import DictionaryPanel from '../DictionaryPanel';
import SpellCheckSettings from '../SpellCheckSettings';
import './SpellCheckManager.css';

interface SpellCheckManagerProps {
  editorRef: RefObject<HTMLDivElement>;
  content: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export const SpellCheckManager: React.FC<SpellCheckManagerProps> = ({
  editorRef,
  content,
  enabled,
  onEnabledChange
}) => {
  const [detectedLanguage, setDetectedLanguage] = useState<Language>('ru');
  const [isDictionaryPanelOpen, setIsDictionaryPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [spellCheckConfig, setSpellCheckConfig] = useState<SpellCheckConfig>({
    enabled: true,
    languages: ['en', 'ru'],
    autoDetect: true,
    customDictionary: true,
    autoCorrect: false,
    checkGrammar: false,
    debounceDelay: 500
  });

  const spellCheckService = useRef<any>(null);
  const dictionaryService = useRef<any>(null);
  const languageDetector = useRef<any>(null);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Use direct instantiation to avoid circular dependency
        const { UnifiedSpellCheckService } = await import('../../services/spellcheck/UnifiedSpellCheckService');
        spellCheckService.current = new UnifiedSpellCheckService();
        await spellCheckService.current.initialize();
        
        // Use services directly since they're not in ServiceFactory
        const { LanguageDetectionService } = await import('../../services/grammar/LanguageDetectionService');
        languageDetector.current = LanguageDetectionService.getInstance();
        
        // Dictionary functionality is built into spell check service
        dictionaryService.current = null; // Not needed as separate service

        const savedConfig = localStorage.getItem('spellcheck-config');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          setSpellCheckConfig(config);
          onEnabledChange(config.enabled);
        }

        if (spellCheckService.current?.initialize) {
          await spellCheckService.current.initialize(spellCheckConfig);
        }
        
        // Dictionary functionality is handled by spell check service
      } catch (error) {
        console.error('Service initialization failed:', error);
      }
    };

    initializeServices();

    return () => {
      if (spellCheckService.current?.destroy) {
        spellCheckService.current.destroy();
      }
      // Dictionary cleanup handled by spell check service
    };
  }, []);

  // Language detection and spell checking
  useEffect(() => {
    if (enabled && content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      if (plainText.length > 3) {
        if (languageDetector.current) {
          const langResult = languageDetector.current.detectLanguage(plainText);
          const detectedLang = langResult.language === 'mixed' ? 'ru' : langResult.language as Language;
          setDetectedLanguage(detectedLang);
        }
      }
    }
  }, [content, enabled, detectedLanguage]);

  const toggleSpellCheck = () => {
    const newEnabled = !enabled;
    onEnabledChange(newEnabled);
    
    if (editorRef.current && spellCheckService.current) {
      if (newEnabled && spellCheckService.current.enableSpellCheck) {
        spellCheckService.current.enableSpellCheck(editorRef.current, detectedLanguage);
      } else if (!newEnabled && spellCheckService.current.disableSpellCheck) {
        spellCheckService.current.disableSpellCheck(editorRef.current);
      }
    }
  };

  // Removed unused functions: addWordToDictionary, handleSpellCorrection, handleIgnoreWord
  // These can be re-added when spell check functionality is fully implemented

  const handleConfigChange = (newConfig: Partial<SpellCheckConfig>) => {
    const updatedConfig = { ...spellCheckConfig, ...newConfig };
    setSpellCheckConfig(updatedConfig);
    onEnabledChange(updatedConfig.enabled);
    
    if (editorRef.current && spellCheckService.current) {
      if (updatedConfig.enabled && spellCheckService.current.enableSpellCheck) {
        spellCheckService.current.enableSpellCheck(editorRef.current, detectedLanguage);
      } else if (!updatedConfig.enabled && spellCheckService.current.disableSpellCheck) {
        spellCheckService.current.disableSpellCheck(editorRef.current);
      }
    }
  };

  return (
    <div className="spell-check-manager">
      <div className="spell-check-controls">
        <button
          className={`spell-check-button ${enabled ? 'spell-check-button--active' : ''}`}
          onClick={toggleSpellCheck}
          title={`${enabled ? 'Отключить' : 'Включить'} проверку орфографии`}
          type="button"
        >
          Орфография
        </button>
        
        {enabled && (
          <>
            <div className={`spell-check-language spell-check-language--${detectedLanguage}`}>
              {detectedLanguage.toUpperCase()}
            </div>
            
            <button
              className="spell-check-button"
              onClick={() => setIsDictionaryPanelOpen(true)}
              title="Управление словарем"
              type="button"
            >
              Словарь
            </button>
            
            <button
              className="spell-check-button"
              onClick={() => setIsSettingsPanelOpen(true)}
              title="Настройки орфографии"
              type="button"
            >
              Настройки
            </button>
          </>
        )}
      </div>
      
      <SpellCheckIndicator
        editorElement={editorRef.current}
        content={content}
        language={detectedLanguage}
        enabled={enabled}
        onCorrection={() => {
          if (editorRef.current) {
            const event = new Event('input', { bubbles: true });
            editorRef.current.dispatchEvent(event);
          }
        }}
        onAddToDictionary={async (word) => {
          if (spellCheckService.current?.addCustomWord) {
            await spellCheckService.current.addCustomWord(word, detectedLanguage);
          }
        }}
        onIgnoreWord={() => {}}
      />
      
      <DictionaryPanel
        isOpen={isDictionaryPanelOpen}
        onClose={() => setIsDictionaryPanelOpen(false)}
        currentLanguage={detectedLanguage}
        onLanguageChange={setDetectedLanguage}
      />
      
      <SpellCheckSettings
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
        config={spellCheckConfig}
        onConfigChange={handleConfigChange}
        currentLanguage={detectedLanguage}
      />
    </div>
  );
};
