# Service Integration Guide

## Overview

This guide explains how to properly integrate with the text editor's spell and grammar checking services, including service lifecycle, error handling, and best practices.

## Service Architecture

### ServiceFactory Pattern
The system uses a centralized ServiceFactory for dependency injection and service management:

```typescript
// ✅ Correct: Use ServiceFactory
const grammarService = await ServiceFactory.getGrammarCheckService();
const spellService = await ServiceFactory.getSpellCheckService();

// ❌ Wrong: Direct instantiation
const grammarService = new GrammarCheckService(); // Don't do this
```

### Service Lifecycle

#### 1. Service Initialization
```typescript
// Services are lazily initialized
const service = await ServiceFactory.getGrammarCheckService();

// Check if service has required methods before calling
if (service && service.checkTextWithGrammar) {
  const result = await service.checkTextWithGrammar(text, language);
}
```

#### 2. Service Cleanup
```typescript
// Always cleanup services when component unmounts
useEffect(() => {
  return () => {
    // Cleanup services
    if (spellCheckService.current?.destroy) {
      spellCheckService.current.destroy();
    }
    if (grammarService.current?.destroy) {
      grammarService.current.destroy();
    }
  };
}, []);
```

## Core Services

### 1. GrammarCheckService

#### Main Interface
```typescript
interface IGrammarCheckService {
  checkTextWithGrammar(text: string, language: Language): Promise<{
    spelling: any;
    grammar: GrammarResult;
    combined: any[];
  }>;
  
  checkGrammar(text: string): Promise<GrammarResult>;
  setGrammarEnabled(enabled: boolean): void;
  isGrammarCheckingEnabled(): boolean;
  destroy(): void;
}
```

#### Usage Example
```typescript
const grammarService = await ServiceFactory.getGrammarCheckService();

// Combined spell + grammar checking
const result = await grammarService.checkTextWithGrammar(text, 'ru');

console.log('Spelling errors:', result.spelling.errors.length);
console.log('Grammar errors:', result.grammar.errors.length);
console.log('Combined errors:', result.combined.length);
```

#### Error Handling
```typescript
try {
  const result = await grammarService.checkTextWithGrammar(text, language);
  
  // Process results
  const combinedErrors = [
    ...result.spelling.errors.map(error => ({ ...error, type: 'spelling' })),
    ...result.grammar.errors.map(error => ({ ...error, type: 'grammar' }))
  ];
  
  setErrors(combinedErrors);
} catch (error) {
  console.error('Grammar check failed:', error);
  setErrors([]);
}
```

### 2. SpellCheckService

#### Interface
```typescript
interface ISpellCheckService {
  checkText(text: string, language: Language): Promise<SpellCheckResult>;
  getSuggestions(word: string, language: Language): Promise<string[]>;
  isWordCorrect(word: string, language: Language): Promise<boolean>;
  batchCheck(words: string[], language: Language): Promise<boolean[]>;
  learnCorrection(original: string, correction: string, language: Language): void;
  destroy(): void;
}
```

#### Usage Example
```typescript
const spellService = await ServiceFactory.getSpellCheckService();

// Check text for spelling errors
const result = await spellService.checkText(text, 'ru');

// Get suggestions for a specific word
const suggestions = await spellService.getSuggestions('wrold', 'en');

// Learn from user corrections
spellService.learnCorrection('wrold', 'world', 'en');
```

### 3. MorphologyAnalyzer

#### Interface
```typescript
interface WordInfo {
  word: string;
  lemma: string;
  morphology: MorphologicalInfo;
  position: number;
}

class MorphologyAnalyzer {
  analyzeWord(word: string, position?: number): WordInfo | null;
}
```

#### Usage Example
```typescript
const analyzer = new MorphologyAnalyzer();

const wordInfo = analyzer.analyzeWord('большой');
if (wordInfo) {
  console.log('Part of speech:', wordInfo.morphology.partOfSpeech);
  console.log('Gender:', wordInfo.morphology.gender);
  console.log('Case:', wordInfo.morphology.case);
}
```

## UI Integration

### 1. SpellCheckIndicator

#### Props Interface
```typescript
interface SpellCheckIndicatorProps {
  editorElement: HTMLElement | null;
  content: string;
  language: Language;
  enabled: boolean;
  onCorrection?: (original: string, correction: string) => void;
  onAddToDictionary?: (word: string) => void;
  onIgnoreWord?: (word: string) => void;
}
```

#### Usage Example
```typescript
<SpellCheckIndicator
  editorElement={editorRef.current}
  content={content}
  language={language}
  enabled={spellCheckEnabled}
  onCorrection={handleCorrection}
  onAddToDictionary={handleAddToDictionary}
  onIgnoreWord={handleIgnoreWord}
/>
```

### 2. SpellCheckManager

#### Props Interface
```typescript
interface SpellCheckManagerProps {
  editorRef: RefObject<HTMLDivElement>;
  content: string;
  onContentChange: (content: string) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}
```

#### Usage Example
```typescript
<SpellCheckManager
  editorRef={editorRef}
  content={content}
  onContentChange={setContent}
  enabled={spellCheckEnabled}
  onEnabledChange={setSpellCheckEnabled}
/>
```

## Error Processing

### Error Object Structure
```typescript
interface GrammarError {
  id: string;
  ruleId: string;
  type: string;
  subtype: string;
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  explanation: string;
  start: number;
  end: number;
  text: string;
  suggestions: string[];
  confidence: number;
  context: string;
}
```

### Error Deduplication
```typescript
// The system automatically deduplicates overlapping errors
const uniqueErrors = allErrors.filter((error, index, array) => {
  // Check if this is the first occurrence of this exact error
  const exactDuplicate = array.findIndex(e => 
    e.start === error.start && 
    e.end === error.end && 
    e.type === error.type &&
    e.subtype === error.subtype &&
    e.ruleId === error.ruleId
  ) === index;
  
  if (!exactDuplicate) return false;
  
  // Check for overlapping errors with different types
  const hasOverlappingError = array.some((e, i) => 
    i < index && // Only check previous errors
    e.start <= error.start && 
    e.end >= error.end &&
    e.type !== error.type
  );
  
  // Prefer morphology errors over syntax errors for overlapping positions
  if (hasOverlappingError && error.type !== 'agreement') {
    return false;
  }
  
  return true;
});
```

### Error Highlighting
```typescript
// Highlight errors in the UI
useEffect(() => {
  if (!editorElement || !enabled || errors.length === 0) {
    // Remove existing highlights
    const existingHighlights = editorElement.querySelectorAll('.spell-error-highlight');
    existingHighlights.forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ''), el);
      }
    });
    return;
  }

  // Save cursor position
  const selection = window.getSelection();
  let savedRange: Range | null = null;
  if (selection && selection.rangeCount > 0) {
    savedRange = selection.getRangeAt(0).cloneRange();
  }

  // Highlight errors
  errors.forEach((error) => {
    highlightTextError(error, editorElement);
  });

  // Restore cursor position
  if (savedRange && selection) {
    try {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    } catch (e) {
      // Handle invalid range
    }
  }
}, [editorElement, enabled, errors]);
```

## Best Practices

### 1. Service Method Existence Checks
```typescript
// ✅ Always check if methods exist before calling
if (grammarService.current && grammarService.current.checkTextWithGrammar) {
  const result = await grammarService.current.checkTextWithGrammar(text, language);
}

// ✅ Check for optional methods
if (autoSaveService.current?.updateContent) {
  autoSaveService.current.updateContent(content);
}
```

### 2. Async Service Initialization
```typescript
// ✅ Services return Promises, handle them properly
useEffect(() => {
  const initServices = async () => {
    try {
      grammarService.current = await ServiceFactory.getGrammarCheckService();
      spellService.current = await ServiceFactory.getSpellCheckService();
    } catch (error) {
      console.warn('Failed to initialize services:', error);
    }
  };
  
  initServices();
}, []);
```

### 3. Error Boundary Integration
```typescript
// ✅ Wrap service calls in try-catch
const handleContentChange = (content: string) => {
  setCurrentContent(content);
  onChange?.(content);
  
  // Only notify plugins if they're initialized
  try {
    pluginManager.onContentChange(content);
  } catch (error) {
    console.warn('Plugin content change notification failed:', error);
  }
};
```

### 4. Debounced Checking
```typescript
// ✅ Debounce spell checking to prevent excessive calls
useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (enabled && content.trim()) {
      performSpellCheck(content);
    } else {
      setErrors([]);
    }
  }, 1000); // 1 second debounce

  return () => clearTimeout(timeoutId);
}, [content, enabled, performSpellCheck]);
```

### 5. Memory Management
```typescript
// ✅ Clean up event listeners and services
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    // Handle click outside
  };

  if (popup.visible) {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }
}, [popup.visible]);
```

## Common Integration Patterns

### 1. Service Composition
```typescript
// Combine multiple services for comprehensive checking
const performComprehensiveCheck = async (text: string, language: Language) => {
  const [spellResult, grammarResult] = await Promise.all([
    spellService.checkText(text, language),
    grammarService.checkGrammar(text)
  ]);
  
  return {
    spelling: spellResult.errors,
    grammar: grammarResult.errors,
    combined: [...spellResult.errors, ...grammarResult.errors]
  };
};
```

### 2. Progressive Enhancement
```typescript
// Gracefully degrade if services are unavailable
const checkText = async (text: string, language: Language) => {
  let errors: any[] = [];
  
  // Try grammar + spell check first
  if (grammarService.current?.checkTextWithGrammar) {
    const result = await grammarService.current.checkTextWithGrammar(text, language);
    errors = result.combined;
  }
  // Fallback to spell check only
  else if (spellService.current?.checkText) {
    const result = await spellService.current.checkText(text, language);
    errors = result.errors;
  }
  
  return errors;
};
```

### 3. Context-Aware Integration
```typescript
// Adapt behavior based on editor context
const getCheckingStrategy = (editorContext: EditorContext) => {
  if (editorContext.isAdminPanel) {
    // Disable caching in admin for data consistency
    return { enableCache: false, realTimeCheck: true };
  }
  
  if (editorContext.isLongDocument) {
    // Use debounced checking for performance
    return { enableCache: true, debounceDelay: 2000 };
  }
  
  return { enableCache: true, debounceDelay: 500 };
};
```

This integration approach ensures robust, performant, and maintainable spell and grammar checking functionality!