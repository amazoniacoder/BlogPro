/**
 * Readability Rule
 * 
 * Checks sentence length and readability optimization
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class ReadabilityRule implements GrammarRule {
  readonly id = 'readability_rule';
  readonly type = 'style' as const;
  readonly subtype = 'completeness' as const;
  readonly severity = 'suggestion' as const;
  readonly description = 'Читаемость текста';
  readonly explanation = 'Рекомендации по улучшению читаемости';
  readonly examples = [
    { wrong: 'Очень длинное предложение...', correct: 'Разделите на короткие предложения' },
    { wrong: 'Сложные конструкции', correct: 'Упростите структуру' }
  ];
  readonly confidence = 0.6;
  readonly enabled = true;

  // Readability thresholds
  private readonly maxSentenceLength = 25; // words
  private readonly maxSentenceChars = 150; // characters
  private readonly maxComplexWords = 3; // complex words per sentence

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    const sentences = this.splitIntoSentences(text);
    
    for (const sentence of sentences) {
      errors.push(...this.checkSentenceLength(sentence));
      errors.push(...this.checkComplexity(sentence));
    }
    
    return errors;
  }

  private splitIntoSentences(text: string): Array<{text: string, start: number, end: number}> {
    const sentences: Array<{text: string, start: number, end: number}> = [];
    const sentenceRegex = /[.!?]+\s*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = sentenceRegex.exec(text)) !== null) {
      const sentenceText = text.substring(lastIndex, match.index + match[0].length).trim();
      if (sentenceText) {
        sentences.push({
          text: sentenceText,
          start: lastIndex,
          end: match.index + match[0].length
        });
      }
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex).trim();
      if (remaining) {
        sentences.push({
          text: remaining,
          start: lastIndex,
          end: text.length
        });
      }
    }
    
    return sentences;
  }

  private checkSentenceLength(sentence: {text: string, start: number, end: number}): GrammarError[] {
    const errors: GrammarError[] = [];
    const words = sentence.text.split(/\s+/).filter(word => word.length > 0);
    
    // Check word count
    if (words.length > this.maxSentenceLength) {
      errors.push({
        id: `${this.id}_length_${Date.now()}_${sentence.start}`,
        ruleId: this.id,
        type: this.type,
        subtype: this.subtype,
        severity: this.severity,
        message: `Предложение слишком длинное (${words.length} слов)`,
        explanation: `Рекомендуется не более ${this.maxSentenceLength} слов в предложении`,
        start: sentence.start,
        end: sentence.end,
        text: sentence.text,
        suggestions: ['Разделите на несколько предложений'],
        confidence: this.confidence,
        context: sentence.text.substring(0, 50) + '...'
      });
    }
    
    // Check character count
    if (sentence.text.length > this.maxSentenceChars) {
      errors.push({
        id: `${this.id}_chars_${Date.now()}_${sentence.start}`,
        ruleId: this.id,
        type: this.type,
        subtype: this.subtype,
        severity: this.severity,
        message: `Предложение слишком длинное (${sentence.text.length} символов)`,
        explanation: `Рекомендуется не более ${this.maxSentenceChars} символов`,
        start: sentence.start,
        end: sentence.end,
        text: sentence.text,
        suggestions: ['Упростите структуру предложения'],
        confidence: this.confidence,
        context: sentence.text.substring(0, 50) + '...'
      });
    }
    
    return errors;
  }

  private checkComplexity(sentence: {text: string, start: number, end: number}): GrammarError[] {
    const errors: GrammarError[] = [];
    const complexWords = this.findComplexWords(sentence.text);
    
    if (complexWords.length > this.maxComplexWords) {
      errors.push({
        id: `${this.id}_complex_${Date.now()}_${sentence.start}`,
        ruleId: this.id,
        type: this.type,
        subtype: this.subtype,
        severity: this.severity,
        message: `Много сложных слов в предложении (${complexWords.length})`,
        explanation: 'Рассмотрите использование более простых синонимов',
        start: sentence.start,
        end: sentence.end,
        text: sentence.text,
        suggestions: ['Замените сложные слова простыми синонимами'],
        confidence: this.confidence * 0.8,
        context: `Сложные слова: ${complexWords.join(', ')}`
      });
    }
    
    return errors;
  }

  private findComplexWords(text: string): string[] {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const complexWords: string[] = [];
    
    for (const word of words) {
      const cleanWord = word.replace(/[^\wа-яёА-ЯЁ]/g, '');
      
      // Consider word complex if:
      // 1. Very long (>12 characters)
      // 2. Contains many consonants in a row
      // 3. Has complex suffixes
      if (this.isComplexWord(cleanWord)) {
        complexWords.push(cleanWord);
      }
    }
    
    return complexWords;
  }

  private isComplexWord(word: string): boolean {
    if (word.length < 4) return false;
    
    // Very long words
    if (word.length > 12) return true;
    
    // Words with many consonants in a row
    if (/[бвгджзклмнпрстфхцчшщ]{4,}/i.test(word)) return true;
    
    // Complex suffixes
    if (/(ость|ение|ание|ство|тель|ность)$/i.test(word)) return true;
    
    return false;
  }
}
