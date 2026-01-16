/**
 * Complex Sentence Rule
 * 
 * Checks complex sentence structure and punctuation
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class ComplexSentenceRule implements GrammarRule {
  readonly id = 'complex_sentence_rule';
  readonly type = 'syntax' as const;
  readonly subtype = 'clause_structure' as const;
  readonly severity = 'warning' as const;
  readonly description = 'Структура сложных предложений';
  readonly explanation = 'Проверка структуры и пунктуации в сложных предложениях';
  readonly examples = [
    { wrong: 'Книга которую я читаю интересная', correct: 'Книга, которую я читаю, интересная' },
    { wrong: 'Когда он пришёл мы уже ушли', correct: 'Когда он пришёл, мы уже ушли' },
    { wrong: 'Он работает: учится: отдыхает', correct: 'Он работает, учится, отдыхает' }
  ];
  readonly confidence = 0.75;
  readonly enabled = true;

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    errors.push(...this.checkRelativeClauses(text));
    errors.push(...this.checkTemporalClauses(text));
    errors.push(...this.checkEnumeration(text));
    
    return errors;
  }

  private checkRelativeClauses(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Relative clauses with который, которая, которое
    const relativePattern = /(\w+)\s+(который|которая|которое|которые)\s+([^,]+?)\s+(\w+)/g;
    let match;
    
    while ((match = relativePattern.exec(text)) !== null) {
      const beforeRelative = match[1];
      const relative = match[2];
      const clause = match[3];

      
      // Check if commas are missing around relative clause
      const fullMatch = match[0];
      const commasBefore = beforeRelative.endsWith(',') || text.charAt(match.index - 1) === ',';
      const commasAfter = fullMatch.includes(',') && fullMatch.lastIndexOf(',') > relative.length;
      
      if (!commasBefore) {
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: `Перед "${relative}" нужна запятая`,
          explanation: 'Придаточные определительные предложения выделяются запятыми',
          start: match.index + beforeRelative.length,
          end: match.index + beforeRelative.length + 1,
          text: ' ',
          suggestions: [', '],
          confidence: this.confidence,
          context: match[0]
        });
      }
      
      if (!commasAfter && clause.length > 5) { // Only for longer clauses
        const clauseEnd = match.index + beforeRelative.length + 1 + relative.length + 1 + clause.length;
        errors.push({
          id: `${this.id}_${Date.now()}_${clauseEnd}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: 'После придаточного предложения нужна запятая',
          explanation: 'Придаточные предложения выделяются запятыми с обеих сторон',
          start: clauseEnd,
          end: clauseEnd + 1,
          text: ' ',
          suggestions: [', '],
          confidence: this.confidence * 0.8,
          context: match[0]
        });
      }
    }
    
    return errors;
  }

  private checkTemporalClauses(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Temporal clauses starting sentences
    const temporalPattern = /(Когда|Пока|После того как|До того как|В то время как)\s+([^,]+?)\s+([а-яё]+)/g;
    let match;
    
    while ((match = temporalPattern.exec(text)) !== null) {
      const conjunction = match[1];
      const clause = match[2];

      
      // Check if comma is missing after temporal clause
      if (!clause.endsWith(',') && clause.length > 3) {
        const commaPosition = match.index + conjunction.length + 1 + clause.length;
        
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: 'После придаточного времени нужна запятая',
          explanation: 'Придаточные предложения времени отделяются запятой от главного предложения',
          start: commaPosition,
          end: commaPosition + 1,
          text: ' ',
          suggestions: [', '],
          confidence: this.confidence,
          context: match[0]
        });
      }
    }
    
    return errors;
  }

  private checkEnumeration(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Check for incorrect colon usage in enumeration
    const colonEnumerationPattern = /(\w+):\s*(\w+):\s*(\w+)/g;
    let match;
    
    while ((match = colonEnumerationPattern.exec(text)) !== null) {
      const item1 = match[1];
      const item2 = match[2];
      const item3 = match[3];
      
      // Suggest comma instead of colon for simple enumeration
      if (this.isSimpleEnumeration(item1, item2, item3)) {
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: 'В простом перечислении используйте запятые, а не двоеточия',
          explanation: 'Двоеточие используется для пояснения, а не для простого перечисления',
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          suggestions: [`${item1}, ${item2}, ${item3}`],
          confidence: this.confidence * 0.7,
          context: match[0]
        });
      }
    }
    
    return errors;
  }

  private isSimpleEnumeration(item1: string, item2: string, item3: string): boolean {
    // Simple heuristic: if all items are short and similar (likely nouns/verbs)
    const maxLength = Math.max(item1.length, item2.length, item3.length);
    const minLength = Math.min(item1.length, item2.length, item3.length);
    
    // Items are similar in length and not too long
    return maxLength <= 15 && (maxLength - minLength) <= 5;
  }
}
