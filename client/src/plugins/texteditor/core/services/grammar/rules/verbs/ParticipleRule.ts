/**
 * Participle Rule
 * 
 * Checks participle formation and agreement patterns
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class ParticipleRule implements GrammarRule {
  readonly id = 'participle_rule';
  readonly type = 'agreement' as const;
  readonly subtype = 'participle_agreement' as const;
  readonly severity = 'error' as const;
  readonly description = 'Правописание причастий';
  readonly explanation = 'Причастия должны правильно образовываться и согласовываться';
  readonly examples = [
    { wrong: 'читающий книгу', correct: 'читающий книгу' },
    { wrong: 'прочитанный книга', correct: 'прочитанная книга' },
    { wrong: 'написавший письмо', correct: 'написавший письмо' }
  ];
  readonly confidence = 0.8;
  readonly enabled = true;

  // Active participle patterns (действительные причастия)
  private readonly activeParticiples = {
    present: {
      // -ущ/-ющ, -ащ/-ящ
      first: /([а-я]+)(ущ|ющ)(ий|ая|ее|ие)$/,
      second: /([а-я]+)(ащ|ящ)(ий|ая|ее|ие)$/
    },
    past: {
      // -вш-, -ш-
      pattern: /([а-я]+)(вш|ш)(ий|ая|ее|ие)$/
    }
  };

  // Passive participle patterns (страдательные причастия)
  private readonly passiveParticiples = {
    present: {
      // -ем/-им, -ом
      pattern: /([а-я]+)(ем|им|ом)(ый|ая|ое|ые)$/
    },
    past: {
      // -нн-, -енн-, -т-
      pattern: /([а-я]+)(нн|енн|т)(ый|ая|ое|ые)$/
    }
  };

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    const words = this.tokenize(text);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Check participle formation
      const formationError = this.checkParticipleFormation(word);
      if (formationError) {
        errors.push(formationError);
      }
      
      // Check participle agreement with nouns
      if (i < words.length - 1) {
        const agreementError = this.checkParticipleAgreement(word, words[i + 1]);
        if (agreementError) {
          errors.push(agreementError);
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

  private checkParticipleFormation(word: {text: string, start: number, end: number}): GrammarError | null {
    const lowerWord = word.text.toLowerCase();
    
    // Check for common participle formation errors
    const commonErrors = [
      {
        pattern: /([а-я]+)ющий$/,
        shouldBe: /([а-я]+)(ать|ять)$/,
        correction: '$1ающий',
        message: 'От глаголов 1-го спряжения причастия образуются с суффиксом -ющ-'
      },
      {
        pattern: /([а-я]+)ащий$/,
        shouldBe: /([а-я]+)ить$/,
        correction: '$1ящий',
        message: 'От глаголов 2-го спряжения причастия образуются с суффиксом -ящ-'
      }
    ];
    
    for (const error of commonErrors) {
      if (error.pattern.test(lowerWord)) {
        return {
          id: `${this.id}_${Date.now()}_${word.start}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: `Ошибка в образовании причастия "${word.text}": ${error.message}`,
          explanation: this.explanation,
          start: word.start,
          end: word.end,
          text: word.text,
          suggestions: [lowerWord.replace(error.pattern, error.correction)],
          confidence: this.confidence,
          context: word.text
        };
      }
    }
    
    return null;
  }

  private checkParticipleAgreement(
    word1: {text: string, start: number, end: number},
    word2: {text: string, start: number, end: number}
  ): GrammarError | null {
    const participle = this.isParticiple(word1.text.toLowerCase());
    const noun = this.isNoun(word2.text.toLowerCase());
    
    if (participle && noun) {
      // Check gender agreement
      const participleGender = this.getParticipleGender(word1.text.toLowerCase());
      const nounGender = this.getNounGender(word2.text.toLowerCase());
      
      if (participleGender && nounGender && participleGender !== nounGender) {
        return {
          id: `${this.id}_${Date.now()}_${word1.start}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: `Причастие "${word1.text}" не согласуется с существительным "${word2.text}" в роде`,
          explanation: 'Причастие должно согласовываться с определяемым словом в роде, числе и падеже',
          start: word1.start,
          end: word2.end,
          text: `${word1.text} ${word2.text}`,
          suggestions: [this.generateCorrection(word1.text, nounGender)],
          confidence: this.confidence,
          context: `${word1.text} ${word2.text}`
        };
      }
    }
    
    return null;
  }

  private isParticiple(word: string): boolean {
    return this.activeParticiples.present.first.test(word) ||
           this.activeParticiples.present.second.test(word) ||
           this.activeParticiples.past.pattern.test(word) ||
           this.passiveParticiples.present.pattern.test(word) ||
           this.passiveParticiples.past.pattern.test(word);
  }

  private isNoun(word: string): boolean {
    // Simplified noun detection
    const nounEndings = ['а', 'я', 'о', 'е', 'ь', 'ы', 'и'];
    return nounEndings.some(ending => word.endsWith(ending)) || 
           /[а-я]+[^аеёиоуыэюя]$/.test(word);
  }

  private getParticipleGender(word: string): 'masculine' | 'feminine' | 'neuter' | null {
    if (word.endsWith('ий') || word.endsWith('ый')) return 'masculine';
    if (word.endsWith('ая') || word.endsWith('яя')) return 'feminine';
    if (word.endsWith('ее') || word.endsWith('ое')) return 'neuter';
    return null;
  }

  private getNounGender(word: string): 'masculine' | 'feminine' | 'neuter' | null {
    // Simplified gender detection
    if (word.endsWith('а') || word.endsWith('я')) return 'feminine';
    if (word.endsWith('о') || word.endsWith('е')) return 'neuter';
    if (/[а-я]+[^аеёиоуыэюя]$/.test(word)) return 'masculine';
    return null;
  }

  private generateCorrection(participle: string, nounGender: 'masculine' | 'feminine' | 'neuter'): string {
    const stem = participle.replace(/(ий|ый|ая|яя|ее|ое)$/, '');
    
    switch (nounGender) {
      case 'masculine': return stem + 'ый';
      case 'feminine': return stem + 'ая';
      case 'neuter': return stem + 'ое';
      default: return participle;
    }
  }
}
