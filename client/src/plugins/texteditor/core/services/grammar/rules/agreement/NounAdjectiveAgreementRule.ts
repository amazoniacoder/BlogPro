/**
 * Noun-Adjective Agreement Rule
 * 
 * Checks agreement between nouns and adjectives in gender, number, and case
 */

import { GrammarRule, GrammarError, Gender, Case } from '../../../../types/LanguageTypes';
import { MorphologyAnalyzer, WordInfo } from '../../morphology/MorphologyAnalyzer';

export class NounAdjectiveAgreementRule implements GrammarRule {
  readonly id = 'noun_adjective_agreement';
  readonly type = 'agreement' as const;
  readonly subtype = 'gender_agreement' as const;
  readonly severity = 'error' as const;
  readonly description = 'Согласование прилагательных с существительными';
  readonly explanation = 'Прилагательное должно согласоваться с существительным в роде, числе и падеже';
  readonly examples = [
    { wrong: 'красивый девочка', correct: 'красивая девочка' },
    { wrong: 'большой дом', correct: 'большой дом' },
    { wrong: 'хороший книга', correct: 'хорошая книга' }
  ];
  readonly confidence = 0.8;
  readonly enabled = true;

  private morphologyAnalyzer = new MorphologyAnalyzer();

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    const words = this.tokenize(text);
    
    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i];
      const word2 = words[i + 1];
      
      const analysis1 = this.morphologyAnalyzer.analyzeWord(word1.text, word1.start);
      const analysis2 = this.morphologyAnalyzer.analyzeWord(word2.text, word2.start);
      
      
      if (analysis1 && analysis2) {
        // Check noun + adjective pattern
        if (this.isNounAdjectivePair(analysis1, analysis2)) {
          const agreementError = this.checkAgreement(analysis1, analysis2, word1, word2);
          if (agreementError) {
            errors.push(agreementError);
          }
        }
        
        // Check adjective + noun pattern
        if (this.isAdjectiveNounPair(analysis1, analysis2)) {
          const agreementError = this.checkAgreement(analysis2, analysis1, word2, word1);
          if (agreementError) {
            errors.push(agreementError);
          }
        }
      }
    }
    
    return errors;
  }

  private tokenize(text: string): Array<{text: string, start: number, end: number}> {
    const words: Array<{text: string, start: number, end: number}> = [];
    const regex = /[а-яёА-ЯЁ]+/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      words.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    return words;
  }

  private isNounAdjectivePair(word1: WordInfo, word2: WordInfo): boolean {
    return word1.morphology.partOfSpeech === 'noun' && 
           word2.morphology.partOfSpeech === 'adjective';
  }

  private isAdjectiveNounPair(word1: WordInfo, word2: WordInfo): boolean {
    return word1.morphology.partOfSpeech === 'adjective' && 
           word2.morphology.partOfSpeech === 'noun';
  }

  private checkAgreement(
    noun: WordInfo, 
    adjective: WordInfo, 
    nounToken: {text: string, start: number, end: number},
    adjToken: {text: string, start: number, end: number}
  ): GrammarError | null {
    const nounMorph = noun.morphology;
    const adjMorph = adjective.morphology;
    
    // Check gender agreement
    if (nounMorph.gender !== adjMorph.gender) {
      return {
        id: `${this.id}_${Date.now()}_${adjToken.start}`,
        ruleId: this.id,
        type: this.type,
        subtype: 'gender_agreement',
        severity: this.severity,
        message: `Прилагательное "${adjToken.text}" не согласуется с существительным "${nounToken.text}" в роде`,
        explanation: `Существительное ${nounMorph.gender} рода, а прилагательное ${adjMorph.gender} рода`,
        start: adjToken.start,
        end: adjToken.end,
        text: adjToken.text,
        suggestions: this.generateSuggestions(noun, adjective),
        confidence: this.confidence,
        context: this.getContext(nounToken.text + ' ' + adjToken.text, 0, nounToken.text.length + adjToken.text.length + 1)
      };
    }
    
    // Check number agreement
    if (nounMorph.number !== adjMorph.number) {
      return {
        id: `${this.id}_${Date.now()}_${adjToken.start}`,
        ruleId: this.id,
        type: this.type,
        subtype: 'number_agreement',
        severity: this.severity,
        message: `Прилагательное "${adjToken.text}" не согласуется с существительным "${nounToken.text}" в числе`,
        explanation: `Существительное в ${nounMorph.number === 'singular' ? 'единственном' : 'множественном'} числе`,
        start: adjToken.start,
        end: adjToken.end,
        text: adjToken.text,
        suggestions: this.generateSuggestions(noun, adjective),
        confidence: this.confidence,
        context: this.getContext(nounToken.text + ' ' + adjToken.text, 0, nounToken.text.length + adjToken.text.length + 1)
      };
    }
    
    // Check case agreement
    if (nounMorph.case !== adjMorph.case) {
      return {
        id: `${this.id}_${Date.now()}_${adjToken.start}`,
        ruleId: this.id,
        type: this.type,
        subtype: 'case_agreement',
        severity: this.severity,
        message: `Прилагательное "${adjToken.text}" не согласуется с существительным "${nounToken.text}" в падеже`,
        explanation: `Существительное в ${this.getCaseRussianName(nounMorph.case!)} падеже`,
        start: adjToken.start,
        end: adjToken.end,
        text: adjToken.text,
        suggestions: this.generateSuggestions(noun, adjective),
        confidence: this.confidence,
        context: this.getContext(nounToken.text + ' ' + adjToken.text, 0, nounToken.text.length + adjToken.text.length + 1)
      };
    }
    
    return null;
  }

  private generateSuggestions(noun: WordInfo, adjective: WordInfo): string[] {
    
    const suggestions: string[] = [];
    const adjWord = adjective.word;
    const targetGender = noun.morphology.gender;
    const targetCase = noun.morphology.case || 'nominative';
    
    // Preserve original capitalization
    const isCapitalized = adjWord[0] === adjWord[0].toUpperCase();
    
    if (!targetGender) return suggestions;
    
    let correctedForm = this.getAdjectiveForm(adjWord.toLowerCase(), targetGender, targetCase);
    
    if (correctedForm) {
      // Restore capitalization
      if (isCapitalized) {
        correctedForm = correctedForm.charAt(0).toUpperCase() + correctedForm.slice(1);
      }
      suggestions.push(correctedForm);
    }
    
    return suggestions;
  }
  
  private getAdjectiveForm(adjective: string, targetGender: Gender, targetCase: Case): string | null {
    // Common adjective transformations
    const transformations: Record<string, Record<Gender, Partial<Record<Case, string>>>> = {
      // большой → большая/большое
      'большой': {
        masculine: { nominative: 'большой', accusative: 'большого' },
        feminine: { nominative: 'большая', accusative: 'большую' },
        neuter: { nominative: 'большое', accusative: 'большое' }
      },
      // красивый → красивая/красивое  
      'красивый': {
        masculine: { nominative: 'красивый', accusative: 'красивого' },
        feminine: { nominative: 'красивая', accusative: 'красивую' },
        neuter: { nominative: 'красивое', accusative: 'красивое' }
      },
      // хороший → хорошая/хорошее
      'хороший': {
        masculine: { nominative: 'хороший', accusative: 'хорошего' },
        feminine: { nominative: 'хорошая', accusative: 'хорошую' },
        neuter: { nominative: 'хорошее', accusative: 'хорошее' }
      }
    };
    
    // Check known transformations first
    if (transformations[adjective]) {
      const genderForms = transformations[adjective][targetGender];
      if (genderForms && genderForms[targetCase]) {
        return genderForms[targetCase]!;
      }
    }
    
    // Pattern-based transformations for unknown adjectives
    return this.transformAdjectiveByPattern(adjective, targetGender, targetCase);
  }
  
  private transformAdjectiveByPattern(adjective: string, targetGender: Gender, targetCase: Case): string | null {
    // Pattern-based transformations
    if (targetCase === 'nominative') {
      // Masculine → Feminine
      if (targetGender === 'feminine') {
        if (adjective.endsWith('ый')) return adjective.replace(/ый$/, 'ая');
        if (adjective.endsWith('ий')) return adjective.replace(/ий$/, 'яя');
        if (adjective.endsWith('ой')) return adjective.replace(/ой$/, 'ая');
      }
      
      // Masculine → Neuter
      if (targetGender === 'neuter') {
        if (adjective.endsWith('ый')) return adjective.replace(/ый$/, 'ое');
        if (adjective.endsWith('ий')) return adjective.replace(/ий$/, 'ее');
        if (adjective.endsWith('ой')) return adjective.replace(/ой$/, 'ое');
      }
      
      // Feminine → Masculine
      if (targetGender === 'masculine') {
        if (adjective.endsWith('ая')) return adjective.replace(/ая$/, 'ый');
        if (adjective.endsWith('яя')) return adjective.replace(/яя$/, 'ий');
      }
    }
    
    return null;
  }

  private getCaseRussianName(caseName: string): string {
    const caseNames: Record<string, string> = {
      nominative: 'именительном',
      genitive: 'родительном',
      dative: 'дательном',
      accusative: 'винительном',
      instrumental: 'творительном',
      prepositional: 'предложном'
    };
    return caseNames[caseName] || caseName;
  }

  private getContext(text: string, start: number, length: number): string {
    const contextStart = Math.max(0, start - 10);
    const contextEnd = Math.min(text.length, start + length + 10);
    return text.substring(contextStart, contextEnd);
  }
}
