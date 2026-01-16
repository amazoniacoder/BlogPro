/**
 * Morphology Analyzer
 * 
 * Analyzes Russian word morphology: case, gender, number, part of speech
 */

import { MorphologicalInfo, Case, Gender } from '../../../types/LanguageTypes';

export interface WordInfo {
  word: string;
  lemma: string;
  morphology: MorphologicalInfo;
  position: number;
}

export class MorphologyAnalyzer {
  // Noun endings by case, gender, number
  private readonly nounEndings = {
    masculine: {
      singular: {
        nominative: ['', 'ь'],
        genitive: ['а', 'я', 'ы', 'и'],
        dative: ['у', 'ю'],
        accusative: ['', 'а', 'я', 'ь'],
        instrumental: ['ом', 'ем', 'ём'],
        prepositional: ['е', 'и']
      }
    },
    feminine: {
      singular: {
        nominative: ['а', 'я', 'ь'],
        genitive: ['ы', 'и'],
        dative: ['е', 'и'],
        accusative: ['у', 'ю', 'ь'],
        instrumental: ['ой', 'ей', 'ью'],
        prepositional: ['е', 'и']
      }
    },
    neuter: {
      singular: {
        nominative: ['о', 'е', 'ё'],
        genitive: ['а', 'я'],
        dative: ['у', 'ю'],
        accusative: ['о', 'е', 'ё'],
        instrumental: ['ом', 'ем', 'ём'],
        prepositional: ['е', 'и']
      }
    }
  };

  // Adjective endings
  private readonly adjectiveEndings = {
    masculine: {
      nominative: ['ый', 'ий', 'ой'],
      genitive: ['ого', 'его'],
      accusative: ['ый', 'ий', 'ой', 'ого', 'его']
    },
    feminine: {
      nominative: ['ая', 'яя'],
      genitive: ['ой', 'ей'],
      accusative: ['ую', 'юю']
    },
    neuter: {
      nominative: ['ое', 'ее'],
      genitive: ['ого', 'его'],
      accusative: ['ое', 'ее']
    }
  };

  analyzeWord(word: string, position: number = 0): WordInfo | null {
    const lowerWord = word.toLowerCase();
    
    
    // Try adjective first for better accuracy
    const adjAnalysis = this.analyzeAdjective(lowerWord);
    if (adjAnalysis) {
      return {
        word,
        lemma: lowerWord,
        morphology: adjAnalysis,
        position
      };
    }
    
    // Try to analyze as noun
    const nounAnalysis = this.analyzeNoun(lowerWord);
    if (nounAnalysis) {
      return {
        word,
        lemma: lowerWord,
        morphology: nounAnalysis,
        position
      };
    }

    return null;
  }

  private analyzeNoun(word: string): MorphologicalInfo | null {
    // Specific known nouns for better accuracy
    const knownNouns: Record<string, {gender: Gender, case: Case}> = {
      'мама': { gender: 'feminine', case: 'nominative' },
      'папа': { gender: 'masculine', case: 'nominative' },
      'дом': { gender: 'masculine', case: 'nominative' },
      'книга': { gender: 'feminine', case: 'nominative' },
      'окно': { gender: 'neuter', case: 'nominative' }
    };
    
    if (knownNouns[word]) {
      const known = knownNouns[word];
      return {
        lemma: word,
        partOfSpeech: 'noun',
        case: known.case,
        gender: known.gender,
        number: 'singular',
        confidence: 0.95
      };
    }
    
    // Pattern-based analysis
    for (const gender of ['feminine', 'masculine', 'neuter'] as Gender[]) {
      const genderEndings = this.nounEndings[gender];
      if (!genderEndings) continue;

      for (const caseName of ['nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'prepositional'] as Case[]) {
        const endings = genderEndings.singular[caseName];
        if (!endings) continue;
        
        for (const ending of endings) {
          if (word.endsWith(ending) && (ending === '' || word.length > ending.length)) {
            return {
              lemma: word,
              partOfSpeech: 'noun',
              case: caseName,
              gender,
              number: 'singular',
              confidence: this.calculateConfidence(word, ending)
            };
          }
        }
      }
    }
    return null;
  }

  private analyzeAdjective(word: string): MorphologicalInfo | null {
    for (const gender of ['masculine', 'feminine', 'neuter'] as Gender[]) {
      const genderEndings = this.adjectiveEndings[gender];
      if (!genderEndings) continue;

      for (const caseName of ['nominative', 'genitive', 'accusative'] as Case[]) {
        const endings = genderEndings[caseName as keyof typeof genderEndings];
        if (!endings) continue;
        
        for (const ending of endings) {
          if (word.endsWith(ending) && word.length > ending.length) {
            return {
              lemma: word,
              partOfSpeech: 'adjective',
              case: caseName,
              gender,
              number: 'singular',
              confidence: this.calculateConfidence(word, ending)
            };
          }
        }
      }
    }
    return null;
  }

  private calculateConfidence(word: string, ending: string): number {
    let confidence = 0.6;
    if (ending.length > 1) confidence += 0.2;
    if (word.length > 4) confidence += 0.1;
    return Math.min(confidence, 0.9);
  }
}
