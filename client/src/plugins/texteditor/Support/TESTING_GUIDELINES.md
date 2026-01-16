# Testing Guidelines

## Overview

This guide provides comprehensive testing strategies for the spell and grammar checking system, ensuring reliability and maintainability.

## Testing Philosophy

### Test-Driven Development
1. **Write tests first** for new grammar rules
2. **Test edge cases** and boundary conditions
3. **Validate patterns** before implementing complex logic
4. **Mock external dependencies** for isolated testing

### Testing Pyramid
```
    ┌─────────────────┐
    │   E2E Tests     │  ← Integration with UI
    │   (Few)         │
    ├─────────────────┤
    │ Integration     │  ← Service interactions
    │ Tests (Some)    │
    ├─────────────────┤
    │   Unit Tests    │  ← Rule logic, patterns
    │   (Many)        │
    └─────────────────┘
```

## Unit Testing

### Grammar Rule Testing

#### Basic Rule Test Template
```typescript
import { MyGrammarRule } from '../MyGrammarRule';

describe('MyGrammarRule', () => {
  let rule: MyGrammarRule;

  beforeEach(() => {
    rule = new MyGrammarRule();
  });

  describe('Error Detection', () => {
    test('should detect error in incorrect text', () => {
      const text = 'Большой мама';
      const errors = rule.check(text);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        ruleId: 'noun_adjective_agreement',
        type: 'agreement',
        subtype: 'gender_agreement',
        severity: 'error',
        start: 0,
        end: 7,
        text: 'Большой',
        suggestions: ['Большая']
      });
    });

    test('should not detect error in correct text', () => {
      const text = 'Большая мама';
      const errors = rule.check(text);

      expect(errors).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty text', () => {
      const errors = rule.check('');
      expect(errors).toHaveLength(0);
    });

    test('should handle single word', () => {
      const errors = rule.check('Большой');
      expect(errors).toHaveLength(0);
    });

    test('should handle punctuation', () => {
      const text = 'Большой мама.';
      const errors = rule.check(text);

      expect(errors).toHaveLength(1);
      expect(errors[0].text).toBe('Большой');
    });
  });

  describe('Capitalization', () => {
    test('should preserve capitalization in suggestions', () => {
      const text = 'Большой мама';
      const errors = rule.check(text);

      expect(errors[0].suggestions).toContain('Большая');
      expect(errors[0].suggestions).not.toContain('большая');
    });

    test('should handle lowercase adjectives', () => {
      const text = 'большой мама';
      const errors = rule.check(text);

      expect(errors[0].suggestions).toContain('большая');
    });
  });
});
```

### Pattern Testing

#### Regex Pattern Validation
```typescript
describe('Pattern Tests', () => {
  describe('Proper Names Pattern', () => {
    const pattern = /(россии|москвой)(?=[\s.,!?;:]|$)/gi;

    test('should match lowercase proper names', () => {
      const testCases = [
        'Мы живем в россии.',
        'Гордимся москвой!',
        'Столица россии',
        'В москвой районе'
      ];

      testCases.forEach(text => {
        const matches = [...text.matchAll(pattern)];
        expect(matches.length).toBeGreaterThan(0);
      });
    });

    test('should not match capitalized proper names', () => {
      const text = 'Мы живем в России.';
      const matches = [...text.matchAll(pattern)];
      
      // Pattern matches due to case-insensitive flag
      expect(matches).toHaveLength(1);
      
      // But validation should reject capitalized
      const isLowercase = matches[0][1][0] !== matches[0][1][0].toUpperCase();
      expect(isLowercase).toBe(false);
    });

    test('should handle word boundaries correctly', () => {
      const text = 'россиянин живет в россии.';
      const matches = [...text.matchAll(pattern)];
      
      expect(matches).toHaveLength(1);
      expect(matches[0][1]).toBe('россии');
    });
  });

  describe('Morphological Patterns', () => {
    test('should identify adjective endings', () => {
      const adjPattern = /([а-яё]+(?:ый|ий|ой|ая|яя|ое|ее))/g;
      
      const adjectives = ['большой', 'красивая', 'хорошее', 'синий'];
      
      adjectives.forEach(adj => {
        const matches = [...adj.matchAll(adjPattern)];
        expect(matches).toHaveLength(1);
        expect(matches[0][1]).toBe(adj);
      });
    });
  });
});
```

### Morphology Analyzer Testing

```typescript
import { MorphologyAnalyzer } from '../MorphologyAnalyzer';

describe('MorphologyAnalyzer', () => {
  let analyzer: MorphologyAnalyzer;

  beforeEach(() => {
    analyzer = new MorphologyAnalyzer();
  });

  describe('Word Analysis', () => {
    test('should analyze adjectives correctly', () => {
      const result = analyzer.analyzeWord('большой');
      
      expect(result).not.toBeNull();
      expect(result!.morphology).toMatchObject({
        partOfSpeech: 'adjective',
        gender: 'masculine',
        case: 'nominative',
        number: 'singular'
      });
    });

    test('should analyze nouns correctly', () => {
      const result = analyzer.analyzeWord('мама');
      
      expect(result).not.toBeNull();
      expect(result!.morphology).toMatchObject({
        partOfSpeech: 'noun',
        gender: 'feminine',
        case: 'nominative',
        number: 'singular'
      });
    });

    test('should handle unknown words', () => {
      const result = analyzer.analyzeWord('абракадабра');
      
      expect(result).toBeNull();
    });
  });

  describe('Known Words Dictionary', () => {
    test('should prioritize known words', () => {
      const knownWords = ['мама', 'папа', 'дом', 'книга', 'окно'];
      
      knownWords.forEach(word => {
        const result = analyzer.analyzeWord(word);
        expect(result).not.toBeNull();
        expect(result!.morphology.confidence).toBeGreaterThan(0.9);
      });
    });
  });
});
```

## Integration Testing

### Service Integration Tests

```typescript
import { GrammarCheckService } from '../GrammarCheckService';
import { ServiceFactory } from '../ServiceFactory';

describe('GrammarCheckService Integration', () => {
  let service: GrammarCheckService;

  beforeEach(async () => {
    service = await ServiceFactory.getGrammarCheckService();
  });

  afterEach(() => {
    service?.destroy();
  });

  test('should perform combined spell and grammar check', async () => {
    const text = 'Большой мама живет в россии.';
    const result = await service.checkTextWithGrammar(text, 'ru');

    expect(result).toHaveProperty('spelling');
    expect(result).toHaveProperty('grammar');
    expect(result).toHaveProperty('combined');

    // Should find grammar error (gender agreement)
    expect(result.grammar.errors.length).toBeGreaterThan(0);
    
    // Should find proper name error
    expect(result.combined.length).toBeGreaterThan(0);
  });

  test('should deduplicate overlapping errors', async () => {
    const text = 'Большой мама';
    const result = await service.checkTextWithGrammar(text, 'ru');

    // Should not have duplicate errors for the same issue
    const uniquePositions = new Set(
      result.combined.map(error => `${error.start}-${error.end}`)
    );
    
    expect(result.combined.length).toBe(uniquePositions.size);
  });
});
```

### UI Component Integration Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpellCheckIndicator } from '../SpellCheckIndicator';

describe('SpellCheckIndicator Integration', () => {
  let mockEditorElement: HTMLDivElement;

  beforeEach(() => {
    mockEditorElement = document.createElement('div');
    mockEditorElement.innerHTML = 'Большой мама';
    document.body.appendChild(mockEditorElement);
  });

  afterEach(() => {
    document.body.removeChild(mockEditorElement);
  });

  test('should highlight errors and show suggestions', async () => {
    const onCorrection = vi.fn();
    
    render(
      <SpellCheckIndicator
        editorElement={mockEditorElement}
        content="Большой мама"
        language="ru"
        enabled={true}
        onCorrection={onCorrection}
      />
    );

    // Wait for spell check to complete
    await waitFor(() => {
      const highlights = mockEditorElement.querySelectorAll('.spell-error-highlight');
      expect(highlights).toHaveLength(1);
    });

    // Click on highlighted error
    const errorElement = mockEditorElement.querySelector('.spell-error-highlight');
    fireEvent.click(errorElement!);

    // Should show suggestion popup
    await waitFor(() => {
      expect(screen.getByText('Большая')).toBeInTheDocument();
    });

    // Click suggestion
    fireEvent.click(screen.getByText('Большая'));

    // Should call correction callback
    expect(onCorrection).toHaveBeenCalledWith('Большой', 'Большая');
  });
});
```

## End-to-End Testing

### Full Workflow Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Spell Check E2E', () => {
  test('should detect and correct grammar errors', async ({ page }) => {
    await page.goto('/admin/blog/new');
    
    // Type text with grammar error
    await page.fill('[data-testid="blog-content"]', 'Большой мама живет дома.');
    
    // Wait for spell check to highlight errors
    await page.waitForSelector('.spell-error-highlight');
    
    // Click on highlighted error
    await page.click('.spell-error-highlight');
    
    // Wait for suggestion popup
    await page.waitForSelector('.spell-check-context-menu');
    
    // Verify suggestion is shown
    await expect(page.locator('.spell-check-context-menu')).toContainText('Большая');
    
    // Click suggestion
    await page.click('text=Большая');
    
    // Verify text was corrected
    const content = await page.inputValue('[data-testid="blog-content"]');
    expect(content).toBe('Большая мама живет дома.');
  });

  test('should handle multiple errors', async ({ page }) => {
    await page.goto('/admin/blog/new');
    
    // Type text with multiple errors
    await page.fill('[data-testid="blog-content"]', 'Большой мама живет в россии.');
    
    // Wait for all errors to be highlighted
    await page.waitForSelector('.spell-error-highlight');
    
    // Should have multiple highlighted errors
    const highlights = await page.locator('.spell-error-highlight').count();
    expect(highlights).toBeGreaterThan(1);
  });
});
```

## Performance Testing

### Load Testing

```typescript
describe('Performance Tests', () => {
  test('should handle large text efficiently', async () => {
    const service = await ServiceFactory.getGrammarCheckService();
    const largeText = 'Большой мама '.repeat(1000);
    
    const startTime = performance.now();
    const result = await service.checkTextWithGrammar(largeText, 'ru');
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    
    // Should complete within reasonable time (adjust threshold as needed)
    expect(duration).toBeLessThan(5000); // 5 seconds
    expect(result.combined.length).toBeGreaterThan(0);
  });

  test('should cache results effectively', async () => {
    const service = await ServiceFactory.getSpellCheckService();
    const text = 'Hello world';
    
    // First call
    const start1 = performance.now();
    await service.checkText(text, 'en');
    const duration1 = performance.now() - start1;
    
    // Second call (should be cached)
    const start2 = performance.now();
    await service.checkText(text, 'en');
    const duration2 = performance.now() - start2;
    
    // Cached call should be significantly faster
    expect(duration2).toBeLessThan(duration1 * 0.5);
  });
});
```

## Test Data Management

### Test Fixtures

```typescript
// test-fixtures.ts
export const testCases = {
  genderAgreement: [
    { input: 'Большой мама', expected: 'Большая мама' },
    { input: 'красивый девочка', expected: 'красивая девочка' },
    { input: 'хороший книга', expected: 'хорошая книга' }
  ],
  
  properNames: [
    { input: 'живем в россии', expected: 'живем в России' },
    { input: 'столица москвы', expected: 'столица Москвы' },
    { input: 'поездка в германию', expected: 'поездка в Германию' }
  ],
  
  punctuation: [
    { input: 'Жизнь это борьба', expected: 'Жизнь — это борьба' },
    { input: 'Он сказал что придет', expected: 'Он сказал, что придет' },
    { input: 'Москва столица России', expected: 'Москва — столица России' }
  ]
};
```

### Parameterized Tests

```typescript
describe.each(testCases.genderAgreement)(
  'Gender Agreement Rule',
  ({ input, expected }) => {
    test(`should correct "${input}" to "${expected}"`, () => {
      const rule = new NounAdjectiveAgreementRule();
      const errors = rule.check(input);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].suggestions).toContain(expected.split(' ')[0]);
    });
  }
);
```

## Mock Strategies

### Service Mocking

```typescript
// Mock ServiceFactory for isolated testing
vi.mock('../ServiceFactory', () => ({
  ServiceFactory: {
    getGrammarCheckService: vi.fn().mockResolvedValue({
      checkTextWithGrammar: vi.fn().mockResolvedValue({
        spelling: { errors: [] },
        grammar: { errors: [] },
        combined: []
      })
    }),
    getSpellCheckService: vi.fn().mockResolvedValue({
      checkText: vi.fn().mockResolvedValue({ errors: [] }),
      getSuggestions: vi.fn().mockResolvedValue(['suggestion1', 'suggestion2'])
    })
  }
}));
```

### DOM Mocking

```typescript
// Mock DOM elements for UI testing
const createMockElement = () => {
  const element = document.createElement('div');
  element.setAttribute = vi.fn();
  element.removeAttribute = vi.fn();
  element.classList = {
    add: vi.fn(),
    remove: vi.fn()
  } as any;
  element.addEventListener = vi.fn();
  element.removeEventListener = vi.fn();
  
  return element;
};
```

## Continuous Integration

### Test Configuration

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

### Coverage Requirements

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

## Best Practices

### ✅ Do's
1. **Test edge cases** and boundary conditions
2. **Use descriptive test names** that explain the scenario
3. **Group related tests** with describe blocks
4. **Mock external dependencies** for isolated testing
5. **Test error conditions** and failure scenarios
6. **Validate both positive and negative cases**
7. **Use parameterized tests** for similar test cases

### ❌ Don'ts
1. **Don't test implementation details** - focus on behavior
2. **Don't write overly complex tests** - keep them simple and focused
3. **Don't ignore test failures** - fix them immediately
4. **Don't skip edge case testing** - they often reveal bugs
5. **Don't test external services directly** - use mocks instead

This comprehensive testing approach ensures the spell and grammar checking system is reliable, maintainable, and performs well under various conditions!