/**
 * Prefix Rule
 * 
 * Implements prefix spelling rules:
 * - пре-/при- prefixes
 * - не-/ни- in pronouns and adverbs
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class PrefixRule implements GrammarRule {
  readonly id = 'prefix_rule';
  readonly type = 'orthography' as const;
  readonly subtype = 'prefix' as const;
  readonly severity = 'error' as const;
  readonly description = 'Правописание приставок';
  readonly explanation = 'Правописание приставок пре-/при-, не-/ни-';
  readonly examples = [
    { wrong: 'прибывать', correct: 'пребывать' },
    { wrong: 'преехать', correct: 'приехать' },
    { wrong: 'нигде', correct: 'негде' }
  ];
  readonly confidence = 0.8;
  readonly enabled = true;

  // пре- meanings: очень, пере-, около
  private readonly preWords = [
    'пребывать', 'преобразовать', 'превосходный', 'прекрасный',
    'преступник', 'препятствие', 'преграда', 'прервать'
  ];
  
  // при- meanings: приближение, присоединение, неполнота действия
  private readonly priWords = [
    'приехать', 'прийти', 'приносить', 'приставить',
    'приоткрыть', 'присесть', 'прилечь', 'приморский'
  ];

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Check пре-/при- usage
    const prePattern = /при([а-я]+)/g;
    const priPattern = /пре([а-я]+)/g;
    
    let match;
    
    // Check for incorrect при- instead of пре-
    while ((match = prePattern.exec(text)) !== null) {
      const word = 'пре' + match[1];
      if (this.preWords.includes(word)) {
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: 'В данном слове пишется приставка пре-',
          explanation: 'Приставка пре- имеет значение "очень" или "пере-"',
          start: match.index,
          end: match.index + 3,
          text: 'при',
          suggestions: ['пре'],
          confidence: this.confidence,
          context: this.getContext(text, match.index, match[0].length)
        });
      }
    }
    
    // Check for incorrect пре- instead of при-
    while ((match = priPattern.exec(text)) !== null) {
      const word = 'при' + match[1];
      if (this.priWords.includes(word)) {
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: 'В данном слове пишется приставка при-',
          explanation: 'Приставка при- имеет значение приближения или присоединения',
          start: match.index,
          end: match.index + 3,
          text: 'пре',
          suggestions: ['при'],
          confidence: this.confidence,
          context: this.getContext(text, match.index, match[0].length)
        });
      }
    }
    
    return errors;
  }
  
  private getContext(text: string, start: number, length: number): string {
    const contextStart = Math.max(0, start - 10);
    const contextEnd = Math.min(text.length, start + length + 10);
    return text.substring(contextStart, contextEnd);
  }
}
