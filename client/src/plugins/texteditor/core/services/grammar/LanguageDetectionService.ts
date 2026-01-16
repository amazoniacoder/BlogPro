/**
 * Language Detection Service
 * 
 * Advanced language detection for English and Russian text with confidence scoring.
 * Supports mixed language content and word-level detection.
 * 
 * Features:
 * - Character frequency analysis
 * - Word pattern recognition
 * - Mixed language handling
 * - Confidence scoring
 * - Performance optimized
 * 
 * @author BlogPro Text Editor Team
 * @version 1.0.0
 */

import { Language, LanguageDetectionResult } from '../../types/spellCheckTypes';

export class LanguageDetectionService {
  private static instance: LanguageDetectionService;
  
  // Character ranges for different languages
  private static readonly CYRILLIC_RANGE = /[\u0400-\u04FF]/g;
  private static readonly LATIN_RANGE = /[a-zA-Z]/g;
  
  // Common English words for pattern recognition
  private static readonly ENGLISH_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their'
  ]);
  
  // Common Russian words for pattern recognition
  private static readonly RUSSIAN_WORDS = new Set([
    'и', 'в', 'не', 'на', 'я', 'быть', 'он', 'с', 'что', 'а',
    'по', 'это', 'она', 'этот', 'к', 'но', 'они', 'мы', 'как', 'из',
    'у', 'который', 'то', 'за', 'свой', 'что', 'её', 'так', 'вы', 'сказать',
    'этого', 'его', 'до', 'вот', 'бы', 'такой', 'только', 'себя', 'ещё', 'год'
  ]);

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): LanguageDetectionService {
    if (!LanguageDetectionService.instance) {
      LanguageDetectionService.instance = new LanguageDetectionService();
    }
    return LanguageDetectionService.instance;
  }

  /**
   * Detect language of text with confidence scoring
   */
  detectLanguage(text: string): LanguageDetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        language: 'en',
        confidence: 0,
        details: { cyrillicCount: 0, latinCount: 0, totalChars: 0 }
      };
    }

    const details = this.analyzeCharacters(text);
    const wordAnalysis = this.analyzeWords(text);
    
    // Combine character and word analysis
    const result = this.combineAnalysis(details, wordAnalysis);
    
    return {
      language: result.language,
      confidence: result.confidence,
      details
    };
  }

  /**
   * Detect language for each word in text
   */
  detectWordLanguages(text: string): Array<{ word: string; language: Language; confidence: number }> {
    const words = this.extractWords(text);
    const results: Array<{ word: string; language: Language; confidence: number }> = [];

    for (const word of words) {
      const result = this.detectWordLanguage(word);
      results.push({
        word,
        language: result.language as Language,
        confidence: result.confidence
      });
    }

    return results;
  }

  /**
   * Check if text contains mixed languages
   */
  isMixedLanguage(text: string, threshold: number = 0.3): boolean {
    const result = this.detectLanguage(text);
    return result.confidence < threshold;
  }

  /**
   * Get language statistics for text
   */
  getLanguageStats(text: string): {
    totalWords: number;
    englishWords: number;
    russianWords: number;
    unknownWords: number;
    mixedPercentage: number;
  } {
    const wordResults = this.detectWordLanguages(text);
    const totalWords = wordResults.length;
    
    let englishWords = 0;
    let russianWords = 0;
    let unknownWords = 0;

    for (const result of wordResults) {
      if (result.confidence > 0.7) {
        if (result.language === 'en') englishWords++;
        else if (result.language === 'ru') russianWords++;
      } else {
        unknownWords++;
      }
    }

    const mixedPercentage = totalWords > 0 ? (unknownWords / totalWords) * 100 : 0;

    return {
      totalWords,
      englishWords,
      russianWords,
      unknownWords,
      mixedPercentage
    };
  }

  /**
   * Analyze character distribution in text
   */
  private analyzeCharacters(text: string): {
    cyrillicCount: number;
    latinCount: number;
    totalChars: number;
  } {
    // Extract only letter characters, ignore punctuation, numbers, HTML, etc.
    const lettersOnly = text.replace(/[^\p{L}]/gu, '');
    
    const cyrillicMatches = lettersOnly.match(LanguageDetectionService.CYRILLIC_RANGE) || [];
    const latinMatches = lettersOnly.match(LanguageDetectionService.LATIN_RANGE) || [];
    
    return {
      cyrillicCount: cyrillicMatches.length,
      latinCount: latinMatches.length,
      totalChars: cyrillicMatches.length + latinMatches.length
    };
  }

  /**
   * Analyze words for language patterns
   */
  private analyzeWords(text: string): {
    englishWordCount: number;
    russianWordCount: number;
    totalWords: number;
  } {
    const words = this.extractWords(text);
    let englishWordCount = 0;
    let russianWordCount = 0;

    for (const word of words) {
      const lowerWord = word.toLowerCase();
      
      if (LanguageDetectionService.ENGLISH_WORDS.has(lowerWord)) {
        englishWordCount++;
      } else if (LanguageDetectionService.RUSSIAN_WORDS.has(lowerWord)) {
        russianWordCount++;
      }
    }

    return {
      englishWordCount,
      russianWordCount,
      totalWords: words.length
    };
  }

  /**
   * Combine character and word analysis for final result
   */
  private combineAnalysis(
    charAnalysis: { cyrillicCount: number; latinCount: number; totalChars: number },
    wordAnalysis: { englishWordCount: number; russianWordCount: number; totalWords: number }
  ): { language: Language | 'mixed'; confidence: number } {
    
    // Character-based analysis
    const { cyrillicCount, latinCount, totalChars } = charAnalysis;
    let charLanguage: Language | 'mixed' = 'en';
    let charConfidence = 0;

    if (totalChars > 0) {
      const cyrillicRatio = cyrillicCount / totalChars;
      const latinRatio = latinCount / totalChars;

      if (cyrillicRatio > 0.7) {
        charLanguage = 'ru';
        charConfidence = cyrillicRatio;
      } else if (latinRatio > 0.7) {
        charLanguage = 'en';
        charConfidence = latinRatio;
      } else {
        charLanguage = 'mixed';
        charConfidence = Math.max(cyrillicRatio, latinRatio);
      }
    }

    // Word-based analysis
    const { englishWordCount, russianWordCount, totalWords } = wordAnalysis;
    let wordLanguage: Language | 'mixed' = 'en';
    let wordConfidence = 0;

    if (totalWords > 0) {
      const englishRatio = englishWordCount / totalWords;
      const russianRatio = russianWordCount / totalWords;

      if (russianRatio > englishRatio && russianRatio > 0.3) {
        wordLanguage = 'ru';
        wordConfidence = russianRatio;
      } else if (englishRatio > russianRatio && englishRatio > 0.3) {
        wordLanguage = 'en';
        wordConfidence = englishRatio;
      } else {
        wordLanguage = 'mixed';
        wordConfidence = Math.max(englishRatio, russianRatio);
      }
    }

    // Combine results with weighted scoring
    const charWeight = 0.6;
    const wordWeight = 0.4;

    let finalLanguage: Language | 'mixed';
    let finalConfidence: number;

    if (charLanguage === wordLanguage && charLanguage !== 'mixed') {
      finalLanguage = charLanguage;
      finalConfidence = (charConfidence * charWeight) + (wordConfidence * wordWeight);
    } else if (charLanguage !== 'mixed' && charConfidence > 0.8) {
      finalLanguage = charLanguage;
      finalConfidence = charConfidence * 0.9;
    } else if (wordLanguage !== 'mixed' && wordConfidence > 0.5) {
      finalLanguage = wordLanguage;
      finalConfidence = wordConfidence * 0.8;
    } else {
      // Default to character-based analysis for mixed content
      finalLanguage = charLanguage === 'mixed' ? (cyrillicCount > latinCount ? 'ru' : 'en') : charLanguage;
      finalConfidence = Math.max(charConfidence, wordConfidence) * 0.7;
    }

    return {
      language: finalLanguage,
      confidence: Math.min(finalConfidence, 1.0)
    };
  }

  /**
   * Detect language of a single word
   */
  private detectWordLanguage(word: string): { language: Language | 'mixed'; confidence: number } {
    const lowerWord = word.toLowerCase();
    
    // Check against known word lists
    if (LanguageDetectionService.ENGLISH_WORDS.has(lowerWord)) {
      return { language: 'en', confidence: 0.95 };
    }
    
    if (LanguageDetectionService.RUSSIAN_WORDS.has(lowerWord)) {
      return { language: 'ru', confidence: 0.95 };
    }

    // Character-based analysis for unknown words
    const cyrillicCount = (word.match(LanguageDetectionService.CYRILLIC_RANGE) || []).length;
    const latinCount = (word.match(LanguageDetectionService.LATIN_RANGE) || []).length;
    const totalLetters = cyrillicCount + latinCount;

    if (totalLetters === 0) {
      return { language: 'en', confidence: 0.1 };
    }

    const cyrillicRatio = cyrillicCount / totalLetters;
    
    if (cyrillicRatio > 0.8) {
      return { language: 'ru', confidence: cyrillicRatio };
    } else if (cyrillicRatio < 0.2) {
      return { language: 'en', confidence: 1 - cyrillicRatio };
    } else {
      return { language: 'mixed', confidence: 0.5 };
    }
  }

  /**
   * Extract words from text
   */
  private extractWords(text: string): string[] {
    // Match Unicode letters (including Cyrillic and Latin)
    const wordMatches = text.match(/[\p{L}]{2,}/gu) || [];
    return wordMatches;
  }

  /**
   * Get appropriate language code for HTML lang attribute
   */
  getLanguageCode(language: Language): string {
    const languageCodes = {
      'en': 'en-US',
      'ru': 'ru-RU'
    };
    
    return languageCodes[language] || 'en-US';
  }

  /**
   * Check if language detection is confident enough
   */
  isConfidentDetection(result: LanguageDetectionResult, threshold: number = 0.7): boolean {
    return result.confidence >= threshold;
  }
}

export default LanguageDetectionService;
