# Pattern & Template System

## Overview

The spell and grammar check system uses **algorithmic pattern matching** to detect errors without relying on extensive dictionaries. This approach is scalable, flexible, and can handle new words automatically.

## Core Philosophy

### ✅ Algorithmic Approach
- **Pattern-based detection**: Use regex and linguistic patterns
- **Morphological analysis**: Understand word structure and relationships
- **Contextual awareness**: Consider surrounding words and punctuation
- **Scalable**: Works with unknown words that follow patterns

### ❌ Dictionary-only Approach
- Limited to known words
- Requires constant dictionary updates
- Cannot handle new words or names
- Less flexible for different languages

## Pattern Categories

### 1. Orthography Patterns

#### Proper Names Detection
```typescript
// Pattern: Detect lowercase proper names by linguistic patterns
const patterns = [
  // Countries (all cases) - using positive lookahead for punctuation
  /(россии|россия|россией|россию)(?=[\s.,!?;:]|$)/gi,
  
  // Cities (all cases)
  /(москвой|москва|москве|москву|москвы)(?=[\s.,!?;:]|$)/gi,
  
  // Pattern-based: Countries ending in -ия
  /([а-я]+ия)(?=[\s.,!?;:]|$)/g,
  
  // Pattern-based: Countries ending in -стан  
  /([а-я]+стан)(?=[\s.,!?;:]|$)/g
];
```

**Key Insight**: Use `(?=[\s.,!?;:]|$)` instead of `\b` to match words followed by punctuation.

#### Geographic Names with Prefixes
```typescript
// Pattern: Geographic features with identifying prefixes
const geoPatterns = [
  // Rivers, seas, mountains with prefixes
  /\b(?:река|море|озеро|гора|хребет|остров)\s+([а-я]+)\b/g,
  
  // Geographic adjectives
  /\b([а-я]+(?:ское|ский|ская|цкое|цкий|цкая))\s+(?:море|озеро|поле|плато)\b/g
];
```

### 2. Agreement Patterns

#### Noun-Adjective Agreement
```typescript
// Pattern: Detect adjective-noun pairs for agreement checking
const adjNounPatterns = [
  // Masculine adjectives + any noun
  /([а-яё]+(?:ый|ий|ой))\s+([а-яё]+)/g,
  
  // Feminine adjectives + any noun  
  /([а-яё]+(?:ая|яя))\s+([а-яё]+)/g,
  
  // Neuter adjectives + any noun
  /([а-яё]+(?:ое|ее))\s+([а-яё]+)/g
];

// Then use morphological analysis to verify agreement
```

#### Subject-Predicate Agreement
```typescript
// Pattern: Detect potential subject-predicate constructions
const subjectPredicatePattern = /([А-ЯЁ][а-яё]+)\s+([а-яё]+(?:а|ица|ород|страна))(?:\s+[А-ЯЁ][а-яё]*)?[.!?\s]/g;

// Known patterns for higher accuracy
const knownPatterns = [
  { subject: 'Москва', predicate: 'столица' },
  { subject: 'Столица', predicate: 'россии' },
  { subject: 'Россия', predicate: 'страна' }
];
```

### 3. Punctuation Patterns

#### Dash Before Linking Words
```typescript
// Pattern: Detect missing dashes before linking words
const linkingWordPattern = /([\w]+)\s+(это|вот|так|значит)\s+([\w]+)/g;

// Examples:
// "Жизнь это борьба" → "Жизнь — это борьба"
// "Москва вот столица" → "Москва — вот столица"
```

#### Comma Before Subordinate Conjunctions
```typescript
// Pattern: Detect missing commas before subordinate conjunctions
const subordinatePattern = /([а-яёА-ЯЁ]+)\s+(что|чтобы|когда|если|хотя|потому что|так как)\s+/g;

// Check if comma is missing before conjunction
if (!beforeConjunction.endsWith(',')) {
  // Create error
}
```

#### Apposition Patterns (Instrumental Case)
```typescript
// Pattern: Detect missing dashes in apposition constructions
const appositionPattern = /([а-яё]+ой)\s+([а-яё]+ицей|[а-яё]+ом)/g;

// Examples:
// "москвой столицей" → "москвой — столицей"
```

## Morphological Analysis Patterns

### Word Classification
```typescript
// Adjective endings by gender
const adjectiveEndings = {
  masculine: {
    nominative: ['ый', 'ий', 'ой'],
    genitive: ['ого', 'его'],
    accusative: ['ый', 'ий', 'ой', 'ого', 'его']
  },
  feminine: {
    nominative: ['ая', 'яя'],
    genitive: ['ой', 'ей'],
    accusative: ['ую', 'юю']
  },
  neuter: {
    nominative: ['ое', 'ее'],
    genitive: ['ого', 'его'],
    accusative: ['ое', 'ее']
  }
};

// Noun endings by gender
const nounEndings = {
  masculine: {
    singular: {
      nominative: ['', 'ь'],
      genitive: ['а', 'я', 'ы', 'и'],
      // ... other cases
    }
  },
  feminine: {
    singular: {
      nominative: ['а', 'я', 'ь'],
      genitive: ['ы', 'и'],
      // ... other cases
    }
  }
};
```

### Known Word Dictionary
```typescript
// High-confidence known words for better accuracy
const knownNouns: Record<string, {gender: Gender, case: Case}> = {
  'мама': { gender: 'feminine', case: 'nominative' },
  'папа': { gender: 'masculine', case: 'nominative' },
  'дом': { gender: 'masculine', case: 'nominative' },
  'книга': { gender: 'feminine', case: 'nominative' },
  'окно': { gender: 'neuter', case: 'nominative' }
};
```

## Template System

### Rule Template Structure
```typescript
export class TemplateRule implements GrammarRule {
  readonly id = 'template_rule';
  readonly type = 'category' as const;
  readonly subtype = 'specific_type' as const;
  readonly severity = 'error' as const;
  readonly description = 'Human readable description';
  readonly explanation = 'Detailed explanation of the rule';
  readonly examples = [
    { wrong: 'incorrect example', correct: 'correct example' }
  ];
  readonly confidence = 0.8;
  readonly enabled = true;

  check(text: string): GrammarError[] {
    console.log(`📝 ${this.id}: Checking text:`, text);
    const errors: GrammarError[] = [];
    
    // 1. Define patterns
    const patterns = [
      /pattern1/g,
      /pattern2/g
    ];
    
    // 2. Check each pattern
    patterns.forEach((pattern, index) => {
      console.log(`📝 ${this.id}: Testing pattern ${index}:`, pattern);
      
      let match;
      while ((match = pattern.exec(text)) !== null) {
        console.log(`📝 ${this.id}: Found match:`, match[1]);
        
        // 3. Validate match
        if (this.shouldCreateError(match)) {
          console.log(`📝 ${this.id}: Creating error`);
          errors.push(this.createError(match));
        }
      }
    });
    
    console.log(`📝 ${this.id}: Found ${errors.length} errors`);
    return errors;
  }
  
  private shouldCreateError(match: RegExpExecArray): boolean {
    // Add validation logic here
    return true;
  }
  
  private createError(match: RegExpExecArray): GrammarError {
    const word = match[1];
    
    return {
      id: `${this.id}_${Date.now()}_${match.index}`,
      ruleId: this.id,
      type: this.type,
      subtype: this.subtype,
      severity: this.severity,
      message: `Error message for "${word}"`,
      explanation: this.explanation,
      start: match.index,                    // Precise start
      end: match.index + word.length,        // Precise end
      text: word,                           // Only incorrect word
      suggestions: this.generateSuggestions(word),
      confidence: this.confidence,
      context: match[0]
    };
  }
  
  private generateSuggestions(word: string): string[] {
    // Generate contextually appropriate suggestions
    return [];
  }
}
```

## Pattern Cookbook

### Common Regex Patterns

#### Word Boundaries with Punctuation
```typescript
// ❌ Wrong: \b doesn't work with punctuation
/\b(word)\b/g

// ✅ Correct: Use positive lookahead
/(word)(?=[\s.,!?;:]|$)/g
```

#### Case-Insensitive Proper Names
```typescript
// Detect both "россия" and "Россия"
/(россия|москва|германия)(?=[\s.,!?;:]|$)/gi
```

#### Morphological Endings
```typescript
// Adjective endings
/([а-яё]+(?:ый|ий|ой|ая|яя|ое|ее))/g

// Noun endings by gender
/([а-яё]+(?:а|я|ь))$/g  // Feminine
/([а-яё]+(?:|ь))$/g     // Masculine  
/([а-яё]+(?:о|е|ё))$/g  // Neuter
```

#### Contextual Patterns
```typescript
// Geographic names with prefixes
/\b(?:река|море|озеро|гора)\s+([а-я]+)\b/g

// Titles with names
/\b(?:господин|госпожа|доктор|профессор)\s+([а-я]+)\b/g
```

### Pattern Validation

#### Multi-step Validation
```typescript
check(text: string): GrammarError[] {
  const errors: GrammarError[] = [];
  const pattern = /your_pattern/g;
  
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const word = match[1];
    
    // Step 1: Pattern match (already done)
    
    // Step 2: Linguistic validation
    if (!this.isValidLinguistically(word)) continue;
    
    // Step 3: Context validation
    if (!this.isValidInContext(match, text)) continue;
    
    // Step 4: Confidence check
    if (this.calculateConfidence(word) < 0.5) continue;
    
    // Create error
    errors.push(this.createError(match));
  }
  
  return errors;
}
```

## Advanced Techniques

### Morphological Transformations
```typescript
// Transform adjectives to match noun gender
private transformAdjective(adjective: string, targetGender: Gender): string | null {
  // Known transformations
  const transformations = {
    'большой': {
      masculine: 'большой',
      feminine: 'большая', 
      neuter: 'большое'
    }
  };
  
  // Pattern-based transformations
  if (targetGender === 'feminine') {
    if (adjective.endsWith('ый')) return adjective.replace(/ый$/, 'ая');
    if (adjective.endsWith('ий')) return adjective.replace(/ий$/, 'яя');
    if (adjective.endsWith('ой')) return adjective.replace(/ой$/, 'ая');
  }
  
  return null;
}
```

### Capitalization Preservation
```typescript
private preserveCapitalization(original: string, corrected: string): string {
  if (original[0] === original[0].toUpperCase()) {
    return corrected.charAt(0).toUpperCase() + corrected.slice(1);
  }
  return corrected;
}
```

### Context-Aware Patterns
```typescript
// Consider surrounding context for better accuracy
private isValidInContext(match: RegExpExecArray, fullText: string): boolean {
  const beforeText = fullText.substring(0, match.index);
  const afterText = fullText.substring(match.index + match[0].length);
  
  // Check if this is actually an error in context
  if (beforeText.includes('не ')) return false;  // Negation context
  if (afterText.startsWith(' не')) return false; // Following negation
  
  return true;
}
```

## Testing Patterns

### Pattern Validation Tests
```typescript
describe('Pattern Tests', () => {
  test('proper name pattern should match lowercase countries', () => {
    const pattern = /(россии|москвой)(?=[\s.,!?;:]|$)/gi;
    const text = 'Мы живем в россии.';
    
    const matches = [...text.matchAll(pattern)];
    expect(matches).toHaveLength(1);
    expect(matches[0][1]).toBe('россии');
  });
  
  test('pattern should not match when word is capitalized', () => {
    const pattern = /(россии|москвой)(?=[\s.,!?;:]|$)/gi;
    const text = 'Мы живем в России.';
    
    // Should match due to case-insensitive flag, but validation should reject
    const matches = [...text.matchAll(pattern)];
    expect(matches[0][1]).toBe('России');
    
    // Validation should reject capitalized words
    const isLowercase = matches[0][1][0] !== matches[0][1][0].toUpperCase();
    expect(isLowercase).toBe(false);
  });
});
```

This pattern-based approach ensures the system is scalable, maintainable, and can handle new words and linguistic constructions automatically!