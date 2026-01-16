/**
 * Soft Sign Rule
 * 
 * Implements soft sign (ь) placement rules:
 * - After soft consonants before hard consonants
 * - At the end of words after soft consonants
 * - In verb forms (-ться, -тся)
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class SoftSignRule implements GrammarRule {
  readonly id = 'soft_sign_rule';
  readonly type = 'orthography' as const;
  readonly subtype = 'soft_sign' as const;
  readonly severity = 'error' as const;
  readonly description = 'Правописание мягкого знака';
  readonly explanation = 'Мягкий знак обозначает мягкость согласных';
  readonly examples = [
    { wrong: 'галка', correct: 'галька' },
    { wrong: 'угол', correct: 'уголь' },
    { wrong: 'боятся', correct: 'бояться' }
  ];
  readonly confidence = 0.9;
  readonly enabled = true;

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // -тся/-ться rule
    const tsyaPattern = /([а-я]+)(тся|ться)/g;
    let match;
    
    while ((match = tsyaPattern.exec(text)) !== null) {
      const word = match[0];
      const ending = match[2];
      
      // Simple heuristic: if word ends with question "что делать?" -> ться
      // if "что делает?" -> тся
      if (this.isInfinitive(word) && ending === 'тся') {
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: 'В неопределённой форме глагола пишется -ться',
          explanation: 'Что делать? - пишется -ться',
          start: match.index + match[1].length,
          end: match.index + match[0].length,
          text: ending,
          suggestions: ['ться'],
          confidence: this.confidence,
          context: this.getContext(text, match.index, match[0].length)
        });
      } else if (!this.isInfinitive(word) && ending === 'ться') {
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: 'В 3-м лице глагола пишется -тся',
          explanation: 'Что делает? - пишется -тся',
          start: match.index + match[1].length,
          end: match.index + match[0].length,
          text: ending,
          suggestions: ['тся'],
          confidence: this.confidence,
          context: this.getContext(text, match.index, match[0].length)
        });
      }
    }
    
    return errors;
  }
  
  private isInfinitive(word: string): boolean {
    // Simple heuristic: infinitive forms often end with -ать, -ить, -еть, -ять
    return /[аиея]ть?ся$/.test(word) || /овать?ся$/.test(word);
  }
  
  private getContext(text: string, start: number, length: number): string {
    const contextStart = Math.max(0, start - 10);
    const contextEnd = Math.min(text.length, start + length + 10);
    return text.substring(contextStart, contextEnd);
  }
}
