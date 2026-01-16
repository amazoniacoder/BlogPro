/**
 * Шипящие + гласные Rule
 * 
 * Implements orthographic rules for sibilants + vowels:
 * - жи/ши: after ж, ш always write и (not ы)
 * - ча/ща: after ч, щ always write а (not я) 
 * - чу/щу: after ч, щ always write у (not ю)
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class ShipyashchieRule implements GrammarRule {
  readonly id = 'shipyashchie_rule';
  readonly type = 'orthography' as const;
  readonly subtype = 'spelling' as const;
  readonly severity = 'error' as const;
  readonly description = 'Правописание гласных после шипящих';
  readonly explanation = 'После шипящих ж, ш пишется и; после ч, щ пишется а, у';
  readonly examples = [
    { wrong: 'жызнь', correct: 'жизнь' },
    { wrong: 'шыть', correct: 'шить' },
    { wrong: 'чясто', correct: 'часто' },
    { wrong: 'щявель', correct: 'щавель' },
    { wrong: 'чюдо', correct: 'чудо' },
    { wrong: 'щюка', correct: 'щука' }
  ];
  readonly confidence = 0.95;
  readonly enabled = true;

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // жи/ши rule: ж,ш + ы -> ж,ш + и
    const zhiShiPattern = /([жш])ы/g;
    let match;
    
    while ((match = zhiShiPattern.exec(text)) !== null) {
      const consonant = match[1];
      const correction = consonant + 'и';
      
      errors.push({
        id: `${this.id}_${Date.now()}_${match.index}`,
        ruleId: this.id,
        type: this.type,
        subtype: this.subtype,
        severity: this.severity,
        message: `После ${consonant} пишется и, а не ы`,
        explanation: this.explanation,
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        suggestions: [correction],
        confidence: this.confidence,
        context: this.getContext(text, match.index, match[0].length)
      });
    }
    
    // ча/ща rule: ч,щ + я -> ч,щ + а
    const chaSchaPattern = /([чщ])я/g;
    
    while ((match = chaSchaPattern.exec(text)) !== null) {
      const consonant = match[1];
      const correction = consonant + 'а';
      
      errors.push({
        id: `${this.id}_${Date.now()}_${match.index}`,
        ruleId: this.id,
        type: this.type,
        subtype: this.subtype,
        severity: this.severity,
        message: `После ${consonant} пишется а, а не я`,
        explanation: this.explanation,
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        suggestions: [correction],
        confidence: this.confidence,
        context: this.getContext(text, match.index, match[0].length)
      });
    }
    
    // чу/щу rule: ч,щ + ю -> ч,щ + у
    const chuSchuPattern = /([чщ])ю/g;
    
    while ((match = chuSchuPattern.exec(text)) !== null) {
      const consonant = match[1];
      const correction = consonant + 'у';
      
      errors.push({
        id: `${this.id}_${Date.now()}_${match.index}`,
        ruleId: this.id,
        type: this.type,
        subtype: this.subtype,
        severity: this.severity,
        message: `После ${consonant} пишется у, а не ю`,
        explanation: this.explanation,
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        suggestions: [correction],
        confidence: this.confidence,
        context: this.getContext(text, match.index, match[0].length)
      });
    }
    
    return errors;
  }
  
  private getContext(text: string, start: number, length: number): string {
    const contextStart = Math.max(0, start - 10);
    const contextEnd = Math.min(text.length, start + length + 10);
    return text.substring(contextStart, contextEnd);
  }
}
