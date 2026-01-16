/**
 * По- Prefix Grammar Rule
 * 
 * Detects separated "по" + word patterns that should be hyphenated
 * according to Russian grammar rules.
 */

import { GrammarRule, GrammarError, GrammarErrorType } from '../../../types/LanguageTypes';

export class PoPrefixRule implements GrammarRule {
  id = 'po-prefix-hyphen';
  name = 'По- prefix hyphenation';
  description = 'Checks for separated "по" + word that should be hyphenated';
  type: GrammarErrorType = 'orthography';
  category = 'orthography';
  severity: 'error' | 'warning' | 'suggestion' = 'error';
  enabled = true;
  explanation = 'Приставка по- пишется через дефис с наречиями, образованными от полных прилагательных и местоимений и оканчивающимися на -ому, -ему, -ски, -цки, -ьи';
  examples = [
    { wrong: 'по русски', correct: 'по-русски' },
    { wrong: 'по новому', correct: 'по-новому' },
    { wrong: 'по вашему', correct: 'по-вашему' }
  ];
  confidence = 0.9;

  check(text: string): GrammarError[] {
    
    const errors: GrammarError[] = [];
    
    // Pattern: "по" + space + word ending in -ому, -ему, -ски, -цки, -ьи (removed word boundary at start)
    const poPattern = /[пП]о\s+([а-яёА-ЯЁ]+(?:ому|ему|ски|цки|ьи))\b/gi;
    let match;
    let matchCount = 0;
    
    
    // Reset regex lastIndex to ensure we start from beginning
    poPattern.lastIndex = 0;
    
    while ((match = poPattern.exec(text)) !== null) {
      matchCount++;
      const fullMatch = match[0]; // "по русски"
      const suffix = match[1]; // "русски"
      const start = match.index;
      const end = match.index + fullMatch.length;
      
      
      // Check if this should be hyphenated (exclude exceptions)
      const shouldHyphenate = this.shouldBeHyphenated(suffix);
      
      if (shouldHyphenate) {
        const suggestion = `по-${suffix}`;
        
        
        errors.push({
          id: `po-prefix-${Date.now()}-${start}`,
          ruleId: this.id,
          type: 'orthography',
          subtype: 'spelling',
          severity: this.severity,
          message: `"${fullMatch}" должно писаться через дефис`,
          explanation: 'Приставка по- пишется через дефис с наречиями, образованными от полных прилагательных и местоимений',
          start,
          end,
          text: fullMatch,
          suggestions: [suggestion],
          confidence: 0.9,
          context: text.substring(Math.max(0, start - 20), Math.min(text.length, end + 20))
        });
      } else {
      }
    }
    
    
    if (matchCount === 0) {
      const testPatterns = ['по русски', 'по новому', 'по старому', 'По русски'];
      testPatterns.forEach(pattern => {
        poPattern.lastIndex = 0; // Reset regex
        const testMatch = poPattern.exec(pattern);
        if (testMatch) {
        }
      });
      
      // Test the specific word ending
      const testWord = 'русски';
      const endings = [/ому$/, /ему$/, /ски$/, /цки$/, /ьи$/];
      endings.forEach((ending) => {
        ending.test(testWord);
      });
      
      // Test simpler pattern
      const simplePattern = /[пП]о\s+русски/;
      simplePattern.test('По русски');
    }
    
    return errors;
  }

  /**
   * Check if the word should be hyphenated with по-
   */
  private shouldBeHyphenated(suffix: string): boolean {
    const lowerSuffix = suffix.toLowerCase();
    
    // Exceptions that should NOT be hyphenated (comparative forms, etc.)
    const exceptions = [
      'долгу',    // подолгу
      'больше',   // побольше  
      'меньше',   // поменьше
      'лучше',    // получше
      'хуже',     // похуже
      'тише',     // потише
      'громче'    // погромче
    ];
    
    if (exceptions.includes(lowerSuffix)) {
      return false;
    }
    
    // Check if it ends with the correct suffixes for hyphenation
    const hyphenatedEndings = [
      { pattern: /ому$/, name: '-ому' },   // по-новому, по-старому
      { pattern: /ему$/, name: '-ему' },   // по-вашему, по-моему  
      { pattern: /ски$/, name: '-ски' },   // по-русски, по-английски
      { pattern: /цки$/, name: '-цки' },   // по-немецки, по-французски
      { pattern: /ьи$/, name: '-ьи' }     // по-лисьи, по-медвежьи
    ];
    
    for (const ending of hyphenatedEndings) {
      if (ending.pattern.test(lowerSuffix)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get rule configuration
   */
  getConfig() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      severity: this.severity,
      enabled: this.enabled
    };
  }

  /**
   * Update rule configuration
   */
  updateConfig(config: Partial<{ enabled: boolean; severity: 'error' | 'warning' | 'suggestion' }>) {
    if (config.enabled !== undefined) {
      this.enabled = config.enabled;
    }
    if (config.severity !== undefined) {
      this.severity = config.severity;
    }
  }
}
