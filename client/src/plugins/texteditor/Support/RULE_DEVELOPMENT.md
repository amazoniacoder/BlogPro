# Grammar Rule Development Guide

## Overview

This guide explains how to create new grammar rules for the text editor's checking system using **algorithmic pattern matching** rather than dictionary lookups.

## Rule Interface

All grammar rules must implement the `GrammarRule` interface:

```typescript
export interface GrammarRule {
  readonly id: string;                    // Unique identifier
  readonly type: string;                  // Rule category
  readonly subtype: string;               // Specific rule type
  readonly severity: 'error' | 'warning' | 'suggestion';
  readonly description: string;           // Human-readable description
  readonly explanation: string;           // Detailed explanation
  readonly examples: Array<{wrong: string, correct: string}>;
  readonly confidence: number;            // 0.0 - 1.0
  readonly enabled: boolean;              // Rule activation state
  
  check(text: string): GrammarError[];   // Main checking method
}
```

## Rule Categories

### 1. Orthography Rules
**Purpose**: Spelling patterns, proper names, word formation

```typescript
export class ProperNamesRule implements GrammarRule {
  readonly id = 'proper_names_rule';
  readonly type = 'orthography';
  readonly subtype = 'capitalization';
  
  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Pattern-based detection
    const countryPattern = /(россии|москвой|германии)(?=[\s.,!?;:]|$)/gi;
    
    let match;
    while ((match = countryPattern.exec(text)) !== null) {
      const word = match[1];
      
      if (this.isLowercaseProperName(word)) {
        errors.push(this.createError(word, match.index, match.index + word.length));
      }
    }
    
    return errors;
  }
}
```

### 2. Agreement Rules
**Purpose**: Grammatical agreement between words

```typescript
export class NounAdjectiveAgreementRule implements GrammarRule {
  check(text: string): GrammarError[] {
    const words = this.tokenize(text);
    const errors: GrammarError[] = [];
    
    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i];
      const word2 = words[i + 1];
      
      const analysis1 = this.morphologyAnalyzer.analyzeWord(word1.text);
      const analysis2 = this.morphologyAnalyzer.analyzeWord(word2.text);
      
      if (this.isAdjectiveNounPair(analysis1, analysis2)) {
        const error = this.checkGenderAgreement(analysis1, analysis2, word1, word2);
        if (error) errors.push(error);
      }
    }
    
    return errors;
  }
}
```

### 3. Punctuation Rules
**Purpose**: Comma, dash, and punctuation placement

```typescript
export class PunctuationRule implements GrammarRule {
  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Dash before linking words (это, вот, так, значит)
    const linkingPattern = /([\w]+)\s+(это|вот|так|значит)\s+([\w]+)/g;
    
    let match;
    while ((match = linkingPattern.exec(text)) !== null) {
      if (!match[0].includes('—') && !match[0].includes('-')) {
        errors.push(this.createDashError(match));
      }
    }
    
    return errors;
  }
}
```

## Key Implementation Principles

### 1. Precise Error Highlighting
**❌ Wrong**: Highlight entire phrase
```typescript
// DON'T DO THIS
start: Math.min(nounToken.start, adjToken.start),
end: Math.max(nounToken.end, adjToken.end),
text: `${nounToken.text} ${adjToken.text}`,
```

**✅ Correct**: Highlight only the incorrect word
```typescript
// DO THIS
start: adjToken.start,        // Only the adjective
end: adjToken.end,
text: adjToken.text,          // Only the incorrect word
```

### 2. Intelligent Suggestions
**Generate contextually appropriate corrections**:

```typescript
private generateSuggestions(noun: WordInfo, adjective: WordInfo): string[] {
  const targetGender = noun.morphology.gender;
  const adjWord = adjective.word;
  
  // Preserve capitalization
  const isCapitalized = adjWord[0] === adjWord[0].toUpperCase();
  
  let correctedForm = this.getAdjectiveForm(adjWord.toLowerCase(), targetGender);
  
  if (correctedForm && isCapitalized) {
    correctedForm = correctedForm.charAt(0).toUpperCase() + correctedForm.slice(1);
  }
  
  return correctedForm ? [correctedForm] : [];
}
```

### 3. Pattern-Based Detection
**Use regex patterns with linguistic knowledge**:

```typescript
// Proper names pattern - matches words followed by punctuation
const properNamePattern = /(россии|москвой|германии)(?=[\s.,!?;:]|$)/gi;

// Adjective-noun agreement pattern
const adjNounPattern = /([а-яё]+(?:ый|ий|ой))\s+([а-яё]+(?:а|я|ь))/g;

// Linking word pattern for dash rules
const linkingWordPattern = /([\w]+)\s+(это|вот|так|значит)\s+([\w]+)/g;
```

## Error Object Structure

```typescript
interface GrammarError {
  id: string;                    // Unique error ID
  ruleId: string;               // Rule that generated error
  type: string;                 // Error category
  subtype: string;              // Specific error type
  severity: 'error' | 'warning' | 'suggestion';
  message: string;              // User-friendly error message
  explanation: string;          // Detailed explanation
  start: number;                // Start position (precise!)
  end: number;                  // End position (precise!)
  text: string;                 // Incorrect text (only the wrong word!)
  suggestions: string[];        // Correction suggestions
  confidence: number;           // Rule confidence (0.0-1.0)
  context: string;              // Surrounding text context
}
```

## Rule Registration

### 1. Add to RuleRegistry
```typescript
// In RuleRegistry.ts
private async registerDefaultRules(): Promise<void> {
  // Add your rule here
  const { MyNewRule } = await import('./path/MyNewRule');
  this.register(new MyNewRule());
}
```

### 2. Rule Categories
- **orthography/**: Spelling, proper names, word formation
- **agreement/**: Grammatical agreement rules
- **syntax/**: Punctuation, sentence structure
- **verbs/**: Verb conjugation, participles
- **style/**: Style and readability rules

## Testing Your Rule

### 1. Unit Tests
```typescript
describe('MyGrammarRule', () => {
  let rule: MyGrammarRule;
  
  beforeEach(() => {
    rule = new MyGrammarRule();
  });
  
  test('should detect error in incorrect text', () => {
    const errors = rule.check('Большой мама');
    
    expect(errors).toHaveLength(1);
    expect(errors[0].text).toBe('Большой');  // Only incorrect word
    expect(errors[0].suggestions).toContain('Большая');
  });
  
  test('should not detect error in correct text', () => {
    const errors = rule.check('Большая мама');
    
    expect(errors).toHaveLength(0);
  });
});
```

### 2. Integration Testing
```typescript
// Test with GrammarCheckService
const grammarService = new GrammarCheckService();
const result = await grammarService.checkTextWithGrammar('Большой мама', 'ru');

expect(result.grammar.errors).toHaveLength(1);
expect(result.grammar.errors[0].suggestions).toContain('Большая');
```

## Best Practices

### ✅ Do's
1. **Use algorithmic patterns** instead of hardcoded word lists
2. **Highlight only incorrect words**, not entire phrases
3. **Preserve capitalization** in suggestions
4. **Add comprehensive logging** for debugging
5. **Test with various text inputs** including edge cases
6. **Use positive lookahead** for word boundaries: `(?=[\s.,!?;:]|$)`
7. **Generate contextually appropriate suggestions**

### ❌ Don'ts
1. **Don't highlight correct words** in agreement errors
2. **Don't use word boundaries `\b`** with punctuation (use lookahead instead)
3. **Don't hardcode specific words** (use patterns when possible)
4. **Don't ignore capitalization** in suggestions
5. **Don't create overly broad patterns** that match too much
6. **Don't forget error deduplication** considerations

## Advanced Patterns

### Morphological Analysis Integration
```typescript
private checkAgreement(word1: WordInfo, word2: WordInfo): GrammarError | null {
  const morph1 = word1.morphology;
  const morph2 = word2.morphology;
  
  if (morph1.gender !== morph2.gender) {
    return this.createGenderError(word1, word2);
  }
  
  return null;
}
```

### Pattern Cookbook
```typescript
// Countries ending in -ия, -стан
const countryPattern = /([\u0430-\u044f]+(?:ия|стан))(?=[\s.,!?;:]|$)/g;

// Adjectives ending in -ый, -ий, -ой
const masculineAdjPattern = /([\u0430-\u044f]+(?:ый|ий|ой))(?=[\s.,!?;:]|$)/g;

// Linking words requiring dashes
const linkingPattern = /([\w]+)\s+(это|вот|так|значит)\s+([\w]+)/g;
```

## Debugging Tips

### Add Comprehensive Logging
```typescript
check(text: string): GrammarError[] {
  console.log(`📝 ${this.id}: Checking text:`, text);
  
  const errors: GrammarError[] = [];
  const pattern = /your_pattern/g;
  
  let match;
  while ((match = pattern.exec(text)) !== null) {
    console.log(`📝 ${this.id}: Found match:`, match[1], 'at position', match.index);
    
    if (this.shouldCreateError(match)) {
      console.log(`📝 ${this.id}: Creating error for:`, match[1]);
      errors.push(this.createError(match));
    }
  }
  
  console.log(`📝 ${this.id}: Found ${errors.length} errors`);
  return errors;
}
```

This approach ensures your rules are robust, testable, and maintainable!