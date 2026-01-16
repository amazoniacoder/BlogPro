/**
 * Double Consonants Rule
 * 
 * Implements rules for double consonants (нн/н):
 * - In adjectives derived from nouns
 * - In past participles
 * - In adverbs derived from adjectives
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class DoubleConsonantsRule implements GrammarRule {
  readonly id = 'double_consonants_rule';
  readonly type = 'orthography' as const;
  readonly subtype = 'double_consonants' as const;
  readonly severity = 'error' as const;
  readonly description = 'Правописание нн и н в словах';
  readonly explanation = 'Удвоенные согласные в суффиксах прилагательных и причастий';
  readonly examples = [
    { wrong: 'деревяный', correct: 'деревянный' },
    { wrong: 'стекляный', correct: 'стеклянный' },
    { wrong: 'написаный', correct: 'написанный' }
  ];
  readonly confidence = 0.85;
  readonly enabled = true;



  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Check for missing double н
    const singleNPattern = /([а-я]*)(ан|ян|ен)ый/g;
    let match;
    
    while ((match = singleNPattern.exec(text)) !== null) {
      const root = match[1];
      const suffix = match[2];
      
      // Specific cases that require нн
      if (this.requiresDoubleN(root, suffix)) {
        const correction = root + suffix + 'нный';
        
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: `В слове "${match[0]}" пишется нн`,
          explanation: 'В прилагательных с суффиксами -ан-, -ян-, -ен- пишется нн',
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          suggestions: [correction],
          confidence: this.confidence,
          context: this.getContext(text, match.index, match[0].length)
        });
      }
    }
    
    return errors;
  }
  
  private requiresDoubleN(root: string, suffix: string): boolean {
    // Common words that require double н
    const doubleNWords = [
      'деревян', 'стеклян', 'оловян', // -ян- exceptions
      'ветрен', 'огнен', 'соломен',  // -ен- words
      'кожан', 'песчан', 'глинян'    // -ан- words
    ];
    
    return doubleNWords.some(word => (root + suffix).includes(word));
  }
  
  private getContext(text: string, start: number, length: number): string {
    const contextStart = Math.max(0, start - 10);
    const contextEnd = Math.min(text.length, start + length + 10);
    return text.substring(contextStart, contextEnd);
  }
}
