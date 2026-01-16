import { Icon } from '../../../../ui-system/icons/components';
/**
 * Dictionary Management Panel
 * 
 * Professional dictionary management interface with search, filtering, and bulk operations.
 * Supports language-specific dictionaries and import/export functionality.
 * 
 * Features:
 * - Word list display with search
 * - Add/remove word interface
 * - Language switching (EN/RU)
 * - Bulk operations (clear, export)
 * - Import dictionary from JSON
 * - Real-time statistics
 * 
 * @author BlogPro Text Editor Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types/spellCheckTypes';
import { ServiceFactory } from '../services/ServiceFactory';
import './DictionaryPanel.css';

interface DictionaryPanelProps {
  /** Panel visibility */
  isOpen: boolean;
  /** Close panel callback */
  onClose: () => void;
  /** Current language */
  currentLanguage: Language;
  /** Language change callback */
  onLanguageChange?: (language: Language) => void;
}

interface DictionaryStats {
  totalWords: number;
  englishWords: number;
  russianWords: number;
  lastUpdated: Date;
}

const DictionaryPanel: React.FC<DictionaryPanelProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);
  const [words, setWords] = useState<string[]>([]);
  const [filteredWords, setFilteredWords] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newWord, setNewWord] = useState('');
  const [stats, setStats] = useState<DictionaryStats>({
    totalWords: 0,
    englishWords: 0,
    russianWords: 0,
    lastUpdated: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dictionaryService = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Initialize service
  useEffect(() => {
    const initService = async () => {
      try {
        const spellService = await ServiceFactory.getUnifiedSpellCheckService();
        dictionaryService.current = spellService;
      } catch (error) {
        console.error('Failed to initialize dictionary service:', error);
      }
    };
    initService();
  }, []);

  // Load words when language changes
  useEffect(() => {
    if (isOpen && dictionaryService.current) {
      loadWords();
      loadStats();
    }
  }, [isOpen, selectedLanguage]);

  // Filter words based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWords(words);
    } else {
      const filtered = words.filter(word =>
        word.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWords(filtered);
    }
  }, [words, searchQuery]);

  // Load words for current language
  const loadWords = useCallback(async () => {
    if (!dictionaryService.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const wordList = await dictionaryService.current.getCustomWords?.(selectedLanguage) || [];
      setWords(wordList);
    } catch (err) {
      setError('Failed to load dictionary words');
      console.error('Dictionary: Failed to load words', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLanguage]);

  // Load dictionary statistics
  const loadStats = useCallback(async () => {
    if (!dictionaryService.current) return;

    try {
      const dictStats = await dictionaryService.current.getDictionaryStats?.() || {
        totalWords: 0,
        englishWords: 0,
        russianWords: 0,
        lastUpdated: new Date()
      };
      setStats(dictStats);
    } catch (err) {
      console.error('Dictionary: Failed to load stats', err);
    }
  }, []);

  // Add new word
  const handleAddWord = useCallback(async () => {
    if (!dictionaryService.current || !newWord.trim()) return;

    const word = newWord.trim().toLowerCase();
    
    if (words.includes(word)) {
      setError(`Word "${word}" already exists in ${selectedLanguage} dictionary`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await dictionaryService.current.addCustomWord?.(word, selectedLanguage);
      setNewWord('');
      await loadWords();
      await loadStats();
    } catch (err) {
      setError(`Failed to add word "${word}"`);
      console.error('Dictionary: Failed to add word', err);
    } finally {
      setIsLoading(false);
    }
  }, [newWord, selectedLanguage, words, loadWords, loadStats]);

  // Remove word
  const handleRemoveWord = useCallback(async (word: string) => {
    if (!dictionaryService.current) return;

    setIsLoading(true);
    setError(null);

    try {
      await dictionaryService.current.removeCustomWord?.(word, selectedLanguage);
      await loadWords();
      await loadStats();
    } catch (err) {
      setError(`Failed to remove word "${word}"`);
      console.error('Dictionary: Failed to remove word', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLanguage, loadWords, loadStats]);

  // Clear dictionary
  const handleClearDictionary = useCallback(async () => {
    if (!dictionaryService.current) return;

    const confirmed = window.confirm(
      `Are you sure you want to clear all ${selectedLanguage.toUpperCase()} dictionary words? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError(null);

    try {
      await dictionaryService.current.clearCustomDictionary?.(selectedLanguage);
      await loadWords();
      await loadStats();
    } catch (err) {
      setError(`Failed to clear ${selectedLanguage} dictionary`);
      console.error('Dictionary: Failed to clear dictionary', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLanguage, loadWords, loadStats]);

  // Export dictionary
  const handleExportDictionary = useCallback(async () => {
    if (!dictionaryService.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const jsonData = await dictionaryService.current.exportCustomDictionary?.(selectedLanguage) || '[]';
      
      // Create download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dictionary-${selectedLanguage}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to export ${selectedLanguage} dictionary`);
      console.error('Dictionary: Failed to export dictionary', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLanguage]);

  // Import dictionary
  const handleImportDictionary = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !dictionaryService.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const result = await dictionaryService.current.importCustomDictionary?.(text) || { imported: 0, skipped: 0 };
      
      await loadWords();
      await loadStats();
      
      alert(`Import completed: ${result.imported} words imported, ${result.skipped} words skipped`);
    } catch (err) {
      setError('Failed to import dictionary. Please check the file format.');
      console.error('Dictionary: Failed to import dictionary', err);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [loadWords, loadStats]);

  // Handle language change
  const handleLanguageChange = useCallback((language: Language) => {
    setSelectedLanguage(language);
    setSearchQuery('');
    setNewWord('');
    setError(null);
    onLanguageChange?.(language);
  }, [onLanguageChange]);

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
      } else if (event.key === 'Enter' && event.ctrlKey && newWord.trim()) {
        handleAddWord();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, newWord, handleAddWord]);

  if (!isOpen) return null;

  return (
    <div className="dictionary-panel-overlay">
      <div ref={panelRef} className="dictionary-panel" role="dialog" aria-labelledby="dictionary-title">
        {/* Header */}
        <div className="dictionary-panel__header">
          <h2 id="dictionary-title" className="dictionary-panel__title">
            Dictionary Management
          </h2>
          <button
            className="dictionary-panel__close"
            onClick={onClose}
            aria-label="Close dictionary panel"
          >
            ✕
          </button>
        </div>

        {/* Language Selector */}
        <div className="dictionary-panel__language-selector">
          <label className="dictionary-panel__label">Language:</label>
          <div className="dictionary-panel__language-tabs">
            <button
              className={`dictionary-panel__language-tab ${selectedLanguage === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              English ({stats.englishWords})
            </button>
            <button
              className={`dictionary-panel__language-tab ${selectedLanguage === 'ru' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('ru')}
            >
              Russian ({stats.russianWords})
            </button>
          </div>
        </div>

        {/* Add Word Section */}
        <div className="dictionary-panel__add-section">
          <div className="dictionary-panel__add-input">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder={`Add new ${selectedLanguage.toUpperCase()} word...`}
              className="dictionary-panel__input"
              disabled={isLoading}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
            />
            <button
              onClick={handleAddWord}
              disabled={!newWord.trim() || isLoading}
              className="dictionary-panel__add-button"
              title="Add word (Ctrl+Enter)"
            >
              Add
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="dictionary-panel__search-section">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words..."
            className="dictionary-panel__search"
            disabled={isLoading}
          />
          <span className="dictionary-panel__search-count">
            {filteredWords.length} of {words.length} words
          </span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="dictionary-panel__error" role="alert">
            {error}
          </div>
        )}

        {/* Word List */}
        <div className="dictionary-panel__word-list">
          {isLoading ? (
            <div className="dictionary-panel__loading">
              <span className="dictionary-panel__loading-icon">⏳</span>
              Loading words...
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="dictionary-panel__empty">
              {searchQuery ? 'No words match your search' : `No ${selectedLanguage.toUpperCase()} words in dictionary`}
            </div>
          ) : (
            <div className="dictionary-panel__words">
              {filteredWords.map((word) => (
                <div key={word} className="dictionary-panel__word-item">
                  <span className="dictionary-panel__word-text">{word}</span>
                  <button
                    onClick={() => handleRemoveWord(word)}
                    className="dictionary-panel__remove-button"
                    title={`Remove "${word}" from dictionary`}
                    disabled={isLoading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="dictionary-panel__actions">
          <div className="dictionary-panel__actions-left">
            <button
              onClick={handleExportDictionary}
              disabled={words.length === 0 || isLoading}
              className="dictionary-panel__action-button"
              title="Export dictionary to JSON file"
            >
              📤 Export
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportDictionary}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="dictionary-panel__action-button"
              title="Import dictionary from JSON file"
            >
              📥 Import
            </button>
          </div>

          <div className="dictionary-panel__actions-right">
            <button
              onClick={handleClearDictionary}
              disabled={words.length === 0 || isLoading}
              className="dictionary-panel__action-button dictionary-panel__action-button--danger"
              title={`Clear all ${selectedLanguage.toUpperCase()} words`}
            >
              <Icon name="delete" size={16} /> Clear All
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="dictionary-panel__stats">
          <div className="dictionary-panel__stat">
            <span className="dictionary-panel__stat-label">Total Words:</span>
            <span className="dictionary-panel__stat-value">{stats.totalWords}</span>
          </div>
          <div className="dictionary-panel__stat">
            <span className="dictionary-panel__stat-label">Last Updated:</span>
            <span className="dictionary-panel__stat-value">
              {stats.lastUpdated.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DictionaryPanel;
