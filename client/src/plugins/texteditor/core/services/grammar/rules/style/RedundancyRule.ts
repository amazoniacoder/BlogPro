/**
 * Redundancy Rule
 * 
 * Detects redundant expressions (плеоназм, тавтология)
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class RedundancyRule implements GrammarRule {
  readonly id = 'redundancy_rule';
  readonly type = 'style' as const;
  readonly subtype = 'repetition' as const;
  readonly severity = 'warning' as const;
  readonly description = 'Избыточность и тавтология';
  readonly explanation = 'Избегайте повторов и избыточных выражений';
  readonly examples = [
    { wrong: 'свободная вакансия', correct: 'вакансия' },
    { wrong: 'первая премьера', correct: 'премьера' },
    { wrong: 'очень прекрасный', correct: 'прекрасный' }
  ];
  readonly confidence = 0.8;
  readonly enabled = true;

  // Common redundant expressions
  private readonly redundantPhrases = [
    { pattern: /свободная\s+вакансия/gi, correction: 'вакансия', reason: 'вакансия уже означает свободное место' },
    { pattern: /первая\s+премьера/gi, correction: 'премьера', reason: 'премьера всегда первая' },
    { pattern: /главная\s+суть/gi, correction: 'суть', reason: 'суть всегда главная' },
    { pattern: /период\s+времени/gi, correction: 'период', reason: 'период уже означает отрезок времени' },
    { pattern: /памятный\s+сувенир/gi, correction: 'сувенир', reason: 'сувенир всегда памятный' },
    { pattern: /прейскурант\s+цен/gi, correction: 'прейскурант', reason: 'прейскурант уже содержит цены' }
  ];

  // Excessive intensifiers
  private readonly excessiveIntensifiers = [
    { pattern: /очень\s+(прекрасный|отличный|превосходный|идеальный)/gi, reason: 'слово уже выражает высшую степень' },
    { pattern: /самый\s+(лучший|худший|первый|последний)/gi, reason: 'слово уже выражает крайнюю степень' },
    { pattern: /более\s+(лучше|хуже)/gi, correction: 'лучше/хуже', reason: 'двойное сравнение' }
  ];

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    errors.push(...this.checkRedundantPhrases(text));
    errors.push(...this.checkExcessiveIntensifiers(text));
    errors.push(...this.checkWordRepetition(text));
    
    return errors;
  }

  private checkRedundantPhrases(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    for (const phrase of this.redundantPhrases) {
      let match;
      while ((match = phrase.pattern.exec(text)) !== null) {
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: `Избыточное выражение "${match[0]}"`,
          explanation: phrase.reason,
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          suggestions: [phrase.correction],
          confidence: this.confidence,
          context: match[0]
        });
      }
    }
    
    return errors;
  }

  private checkExcessiveIntensifiers(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    for (const intensifier of this.excessiveIntensifiers) {
      let match;
      while ((match = intensifier.pattern.exec(text)) !== null) {
        const suggestion = intensifier.correction || match[0].split(' ')[1];
        
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: `Избыточное усиление "${match[0]}"`,
          explanation: intensifier.reason,
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          suggestions: [suggestion],
          confidence: this.confidence,
          context: match[0]
        });
      }
    }
    
    return errors;
  }

  private checkWordRepetition(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    const words = text.toLowerCase().split(/\s+/);
    
    for (let i = 0; i < words.length - 1; i++) {
      const word = words[i].replace(/[^\w]/g, '');
      const nextWord = words[i + 1].replace(/[^\w]/g, '');
      
      // Check for immediate repetition
      if (word === nextWord && word.length > 3) {
        const wordStart = text.toLowerCase().indexOf(word + ' ' + nextWord);
        if (wordStart !== -1) {
          errors.push({
            id: `${this.id}_${Date.now()}_${wordStart}`,
            ruleId: this.id,
            type: this.type,
            subtype: this.subtype,
            severity: this.severity,
            message: `Повтор слова "${word}"`,
            explanation: 'Избегайте повторения одного и того же слова',
            start: wordStart,
            end: wordStart + word.length * 2 + 1,
            text: `${word} ${nextWord}`,
            suggestions: [word],
            confidence: this.confidence * 0.9,
            context: `${word} ${nextWord}`
          });
        }
      }
    }
    
    return errors;
  }
}
