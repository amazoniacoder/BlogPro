/**
 * Word Order Rule
 * 
 * Checks typical Russian word order patterns
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class WordOrderRule implements GrammarRule {
  readonly id = 'word_order_rule';
  readonly type = 'style' as const;
  readonly subtype = 'word_order' as const;
  readonly severity = 'suggestion' as const;
  readonly description = 'Порядок слов в предложении';
  readonly explanation = 'Рекомендации по типичному порядку слов в русском языке';
  readonly examples = [
    { wrong: 'красивая очень девочка', correct: 'очень красивая девочка' },
    { wrong: 'в магазине вчера я был', correct: 'вчера я был в магазине' },
    { wrong: 'книгу интересную читаю', correct: 'читаю интересную книгу' }
  ];
  readonly confidence = 0.6;
  readonly enabled = true;

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    errors.push(...this.checkAdverbPlacement(text));
    errors.push(...this.checkAdjectivePlacement(text));
    
    return errors;
  }

  private checkAdverbPlacement(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Adverb after adjective (should be before)
    const adverbAfterAdjPattern = /([а-яё]+ая|[а-яё]+ый|[а-яё]+ое)\s+(очень|весьма|крайне|довольно|слишком)/gi;
    let match;
    
    while ((match = adverbAfterAdjPattern.exec(text)) !== null) {
      const adjective = match[1];
      const adverb = match[2];
      
      errors.push({
        id: `${this.id}_${Date.now()}_${match.index}`,
        ruleId: this.id,
        type: this.type,
        subtype: this.subtype,
        severity: this.severity,
        message: `Наречие "${adverb}" лучше поставить перед прилагательным`,
        explanation: 'Наречия степени обычно ставятся перед прилагательными',
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        suggestions: [`${adverb} ${adjective}`],
        confidence: this.confidence,
        context: match[0]
      });
    }
    
    return errors;
  }

  private checkAdjectivePlacement(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Object before verb with adjective (unusual order)
    const objectVerbAdjPattern = /([а-яё]+у|[а-яё]+ую)\s+([а-яё]+ую|[а-яё]+ый)\s+(читаю|пишу|делаю|изучаю)/gi;
    let match;
    
    while ((match = objectVerbAdjPattern.exec(text)) !== null) {
      const object = match[1];
      const adjective = match[2];
      const verb = match[3];
      
      // Only suggest if this looks like unusual word order
      if (this.isUnusualOrder(object, adjective, verb)) {
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: 'Возможно, стоит изменить порядок слов',
          explanation: 'Типичный порядок: глагол + прилагательное + существительное',
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          suggestions: [`${verb} ${adjective} ${object}`],
          confidence: this.confidence * 0.7,
          context: match[0]
        });
      }
    }
    
    return errors;
  }

  private isUnusualOrder(object: string, adjective: string, verb: string): boolean {
    // Simple heuristic: if object comes first, it might be unusual
    // This is a simplified check - real implementation would be more sophisticated
    return object.length > 3 && adjective.length > 3 && verb.length > 3;
  }
}
