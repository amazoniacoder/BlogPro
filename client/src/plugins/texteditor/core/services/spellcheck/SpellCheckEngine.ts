/**
 * Spell Check Engine
 * 
 * Core spell checking engine extracted from SpellCheckService.
 * Handles word extraction, language detection, and spell checking logic.
 */

import { SpellError, SpellCheckResult, Language } from '../../types/spellCheckTypes';
import { ZeroDictionarySpellChecker } from './ZeroDictionarySpellChecker';

export class SpellCheckEngine {
  private spellChecker: ZeroDictionarySpellChecker;
  constructor(spellChecker?: ZeroDictionarySpellChecker) {
    this.spellChecker = spellChecker || ZeroDictionarySpellChecker.getInstance();
  }

  /**
   * Perform spell checking on text
   */
  async checkText(text: string, language?: Language): Promise<SpellCheckResult> {
    console.log(`🔧 SpellCheckEngine: checkText called with '${text}'`);
    const detectedLanguage = language || 'ru'; // Default to Russian

    const errors: SpellError[] = [];

    const words = this.extractWords(text);
    console.log(`🔧 SpellCheckEngine: Extracted ${words.length} words:`, words.map(w => w.word));

    
    // Batch check all words using zero-dictionary approach
    const wordList = words.map(w => w.word);
    console.log(`🔧 SpellCheckEngine: Checking words with ZeroDictionarySpellChecker:`, wordList);
    const results = await this.spellChecker.checkWords(wordList);
    console.log(`🔧 SpellCheckEngine: Results from zero-dictionary checker:`, results);
    
    // Process results and create errors
    words.forEach((wordInfo, index) => {
      const isCorrect = results[index];

      
      if (!isCorrect) {
        const errorInfo: SpellError = {
          word: wordInfo.word,
          start: wordInfo.start,
          end: wordInfo.end,
          type: 'spelling' as const,
          suggestions: [],
          language: detectedLanguage,
          confidence: 0.8
        };
        
        errors.push(errorInfo);
      }
    });
    


    return {
      errors,
      language: detectedLanguage,
      confidence: 0.9,
      processedAt: new Date()
    };
  }

  /**
   * Extract words from text with position information
   */
  private extractWords(text: string): Array<{ word: string; start: number; end: number }> {
    const words: Array<{ word: string; start: number; end: number }> = [];
    const regex = /[а-яё]+/gi; // Russian letters only
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      words.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    return words;
  }

  /**
   * Get spelling suggestions for a word
   */
  async getSuggestions(_word: string, _language: Language): Promise<string[]> {
    // Zero-dictionary system handles suggestions through server
    return [];
  }
}
