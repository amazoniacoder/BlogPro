/**
 * Verb Conjugation Rule
 * 
 * Checks correct verb conjugation patterns for 1st and 2nd conjugation
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class VerbConjugationRule implements GrammarRule {
  readonly id = 'verb_conjugation';
  readonly type = 'syntax' as const;
  readonly subtype = 'verb_aspect' as const;
  readonly severity = 'error' as const;
  readonly description = 'Правописание глагольных окончаний';
  readonly explanation = 'Глаголы должны иметь правильные окончания согласно спряжению';
  readonly examples = [
    { wrong: 'он читаит', correct: 'он читает' },
    { wrong: 'они говорют', correct: 'они говорят' },
    { wrong: 'ты пишишь', correct: 'ты пишешь' }
  ];
  readonly confidence = 0.85;
  readonly enabled = true;



  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    const words = this.tokenize(text);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const conjugationError = this.checkVerbConjugation(word);
      if (conjugationError) {
        errors.push(conjugationError);
      }
    }
    
    return errors;
  }

  private tokenize(text: string): Array<{text: string, start: number, end: number}> {
    const words: Array<{text: string, start: number, end: number}> = [];
    const regex = /[а-яёА-ЯЁ]+/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      words.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    return words;
  }

  private checkVerbConjugation(word: {text: string, start: number, end: number}): GrammarError | null {
    const lowerWord = word.text.toLowerCase();
    
    // Check for common conjugation errors
    const firstConjErrors = this.checkFirstConjugationErrors(lowerWord);
    if (firstConjErrors) {
      return this.createError(word, firstConjErrors.message, firstConjErrors.suggestion);
    }
    
    const secondConjErrors = this.checkSecondConjugationErrors(lowerWord);
    if (secondConjErrors) {
      return this.createError(word, secondConjErrors.message, secondConjErrors.suggestion);
    }
    
    return null;
  }

  private checkFirstConjugationErrors(word: string): {message: string, suggestion: string} | null {
    // Common first conjugation errors
    const patterns = [
      { wrong: /([а-я]+)аит$/, correct: '$1ает', message: 'В 1-м спряжении 3-е лицо ед.ч. имеет окончание -ет' },
      { wrong: /([а-я]+)аят$/, correct: '$1ают', message: 'В 1-м спряжении 3-е лицо мн.ч. имеет окончание -ют/-ут' },
      { wrong: /([а-я]+)еит$/, correct: '$1еет', message: 'В 1-м спряжении 3-е лицо ед.ч. имеет окончание -ет' }
    ];
    
    for (const pattern of patterns) {
      if (pattern.wrong.test(word)) {
        return {
          message: pattern.message,
          suggestion: word.replace(pattern.wrong, pattern.correct)
        };
      }
    }
    
    return null;
  }

  private checkSecondConjugationErrors(word: string): {message: string, suggestion: string} | null {
    // Common second conjugation errors
    const patterns = [
      { wrong: /([а-я]+)ет$/, correct: '$1ит', message: 'Во 2-м спряжении 3-е лицо ед.ч. имеет окончание -ит', stems: ['говор', 'люб', 'уч'] },
      { wrong: /([а-я]+)ют$/, correct: '$1ят', message: 'Во 2-м спряжении 3-е лицо мн.ч. имеет окончание -ят/-ат', stems: ['говор', 'люб', 'уч'] },
      { wrong: /([а-я]+)ешь$/, correct: '$1ишь', message: 'Во 2-м спряжении 2-е лицо ед.ч. имеет окончание -ишь', stems: ['говор', 'люб', 'уч'] }
    ];
    
    for (const pattern of patterns) {
      if (pattern.wrong.test(word)) {
        // Check if word stem matches second conjugation
        const stem = word.replace(pattern.wrong, '$1');
        if (pattern.stems && pattern.stems.some(s => stem.includes(s))) {
          return {
            message: pattern.message,
            suggestion: word.replace(pattern.wrong, pattern.correct)
          };
        }
      }
    }
    
    return null;
  }

  private createError(
    word: {text: string, start: number, end: number},
    message: string,
    suggestion: string
  ): GrammarError {
    return {
      id: `${this.id}_${Date.now()}_${word.start}`,
      ruleId: this.id,
      type: this.type,
      subtype: this.subtype,
      severity: this.severity,
      message: `Ошибка в окончании глагола "${word.text}": ${message}`,
      explanation: this.explanation,
      start: word.start,
      end: word.end,
      text: word.text,
      suggestions: [suggestion],
      confidence: this.confidence,
      context: word.text
    };
  }
}
