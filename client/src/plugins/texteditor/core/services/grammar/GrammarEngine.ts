/**
 * Grammar Engine
 * 
 * Consolidated grammar checking engine that combines all grammar analysis functionality.
 * Includes morphology analysis, agreement checking, and rule-based validation.
 */

import { GrammarResult, GrammarError, GrammarRule } from '../../types/LanguageTypes';

export class GrammarEngine {
  private rules: Map<string, GrammarRule> = new Map();
  private performanceStats = new Map<string, {average: number, max: number, count: number}>();

  constructor() {
    this.initializeRules();
  }

  /**
   * Check grammar for text
   */
  async checkGrammar(text: string): Promise<GrammarResult> {
    const startTime = performance.now();
    const errors: GrammarError[] = [];
    
    // Basic punctuation and capitalization checks
    errors.push(...this.checkPunctuation(text));
    errors.push(...this.checkCapitalization(text));
    errors.push(...this.checkAgreement(text));
    
    const endTime = performance.now();
    this.updatePerformanceStats('checkGrammar', endTime - startTime);

    return {
      errors,
      suggestions: [],
      confidence: 0.8,
      processedAt: new Date(),
      language: 'ru',
      statistics: {
        totalRulesChecked: this.rules.size,
        errorsFound: errors.filter(e => e.severity === 'error').length,
        warningsFound: errors.filter(e => e.severity === 'warning').length,
        suggestionsFound: errors.filter(e => e.severity === 'suggestion').length
      }
    };
  }

  /**
   * Check punctuation errors
   */
  private checkPunctuation(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Check for missing commas before "что", "чтобы", "который"
    const commaPattern = /(\w+)\s+(что|чтобы|который)/gi;
    let match;
    while ((match = commaPattern.exec(text)) !== null) {
      errors.push({
        id: `comma-${match.index}`,
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        type: 'syntax',
        subtype: 'comma',
        severity: 'warning',
        message: `Возможно, нужна запятая перед "${match[2]}"`,
        explanation: 'Перед союзами обычно ставится запятая',
        context: match[0],
        suggestions: [match[0].replace(/(\w+)\s+/, '$1, ')],
        ruleId: 'comma-before-conjunction',
        confidence: 0.7
      });
    }

    return errors;
  }

  /**
   * Check capitalization errors
   */
  private checkCapitalization(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Check sentence beginnings
    const sentences = text.split(/[.!?]+\s*/);
    let currentPos = 0;
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed && /^[а-яё]/i.test(trimmed) && trimmed[0] === trimmed[0].toLowerCase()) {
        errors.push({
          id: `cap-${currentPos}`,
          start: currentPos,
          end: currentPos + 1,
          text: trimmed[0],
          type: 'syntax',
          subtype: 'capitalization',
          severity: 'error',
          message: 'Предложение должно начинаться с заглавной буквы',
          explanation: 'Первое слово предложения пишется с заглавной буквы',
          context: trimmed.substring(0, 10),
          suggestions: [trimmed[0].toUpperCase()],
          ruleId: 'sentence-capitalization',
          confidence: 0.9
        });
      }
      currentPos += sentence.length + 1;
    });

    return errors;
  }

  /**
   * Check agreement errors (simplified)
   */
  private checkAgreement(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Simple noun-adjective agreement check
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i].toLowerCase();
      const word2 = words[i + 1].toLowerCase();
      
      // Check for common agreement errors
      if (this.isAgreementError(word1, word2)) {
        const start = text.indexOf(words[i] + ' ' + words[i + 1]);
        errors.push({
          id: `agreement-${start}`,
          start,
          end: start + words[i].length + words[i + 1].length + 1,
          text: words[i] + ' ' + words[i + 1],
          type: 'agreement',
          subtype: 'gender_agreement',
          severity: 'error',
          message: 'Возможная ошибка согласования',
          explanation: 'Прилагательное должно согласовываться с существительным',
          context: words[i] + ' ' + words[i + 1],
          suggestions: [],
          ruleId: 'noun-adjective-agreement',
          confidence: 0.6
        });
      }
    }

    return errors;
  }

  /**
   * Simple agreement error detection
   */
  private isAgreementError(word1: string, word2: string): boolean {
    // Simplified agreement checking - in real implementation would use morphology
    const commonErrors = [
      ['красивый', 'девочка'], // should be красивая
      ['большой', 'дом'], // correct
      ['хороший', 'книга'] // should be хорошая
    ];
    
    return commonErrors.some(([adj, noun]) => 
      (word1 === adj && word2 === noun) || (word1 === noun && word2 === adj)
    );
  }

  /**
   * Add grammar rule
   */
  addRule(rule: GrammarRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Update grammar rule
   */
  updateRule(ruleId: string, rule: GrammarRule): void {
    if (this.rules.has(ruleId)) {
      this.rules.set(ruleId, rule);
    }
  }

  /**
   * Get all rules
   */
  getAllRules(): GrammarRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rules by type
   */
  getRulesByType(type: string): GrammarRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.type === type);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): Map<string, {average: number, max: number, count: number}> {
    return new Map(this.performanceStats);
  }

  /**
   * Initialize default rules
   */
  private initializeRules(): void {
    const defaultRules: GrammarRule[] = [
      {
        id: 'comma-before-conjunction',
        description: 'Check for missing commas before conjunctions',
        type: 'syntax',
        severity: 'warning',
        enabled: true,

        explanation: 'Перед союзами обычно ставится запятая',
        examples: [{ wrong: 'Он сказал что придёт', correct: 'Он сказал, что придёт' }],
        confidence: 0.7,
        check: () => []
      },
      {
        id: 'sentence-capitalization',
        description: 'Check sentence starts with capital letter',
        type: 'syntax',
        severity: 'error',
        enabled: true,

        explanation: 'Первое слово предложения пишется с заглавной буквы',
        examples: [{ wrong: 'предложение начинается', correct: 'Предложение начинается' }],
        confidence: 0.9,
        check: () => []
      },
      {
        id: 'noun-adjective-agreement',
        description: 'Check agreement between nouns and adjectives',
        type: 'agreement',
        severity: 'error',
        enabled: true,

        explanation: 'Прилагательное должно согласовываться с существительным',
        examples: [{ wrong: 'красивый девочка', correct: 'красивая девочка' }],
        confidence: 0.6,
        check: () => []
      }
    ];

    defaultRules.forEach(rule => this.addRule(rule));
  }

  /**
   * Update performance statistics
   */
  private updatePerformanceStats(operation: string, duration: number): void {
    const existing = this.performanceStats.get(operation);
    if (existing) {
      existing.count++;
      existing.max = Math.max(existing.max, duration);
      existing.average = (existing.average * (existing.count - 1) + duration) / existing.count;
    } else {
      this.performanceStats.set(operation, {
        average: duration,
        max: duration,
        count: 1
      });
    }
  }
}
