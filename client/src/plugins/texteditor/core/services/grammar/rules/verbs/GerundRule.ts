/**
 * Gerund Rule (Деепричастие)
 * 
 * Checks gerund formation and usage patterns
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class GerundRule implements GrammarRule {
  readonly id = 'gerund_rule';
  readonly type = 'syntax' as const;
  readonly subtype = 'verb_aspect' as const;
  readonly severity = 'warning' as const;
  readonly description = 'Правописание деепричастий';
  readonly explanation = 'Деепричастия должны правильно образовываться от глаголов';
  readonly examples = [
    { wrong: 'читавши книгу', correct: 'читая книгу' },
    { wrong: 'написая письмо', correct: 'написав письмо' },
    { wrong: 'идучи домой', correct: 'идя домой' }
  ];
  readonly confidence = 0.75;
  readonly enabled = true;



  // Common gerund formation errors
  private readonly commonErrors = [
    {
      wrong: /([а-я]+)авши$/,
      correct: '$1ав',
      message: 'Деепричастие совершенного вида образуется с суффиксом -в'
    },
    {
      wrong: /([а-я]+)ивши$/,
      correct: '$1ив',
      message: 'Деепричастие совершенного вида образуется с суффиксом -в'
    },
    {
      wrong: /([а-я]+)учи$/,
      correct: '$1я',
      message: 'Деепричастие несовершенного вида образуется с суффиксом -я'
    }
  ];

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    const words = this.tokenize(text);
    
    for (const word of words) {
      const gerundError = this.checkGerundFormation(word);
      if (gerundError) {
        errors.push(gerundError);
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

  private checkGerundFormation(word: {text: string, start: number, end: number}): GrammarError | null {
    const lowerWord = word.text.toLowerCase();
    
    // Check for common gerund formation errors
    for (const error of this.commonErrors) {
      if (error.wrong.test(lowerWord)) {
        const correction = lowerWord.replace(error.wrong, error.correct);
        
        return {
          id: `${this.id}_${Date.now()}_${word.start}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: `Ошибка в образовании деепричастия "${word.text}": ${error.message}`,
          explanation: this.explanation,
          start: word.start,
          end: word.end,
          text: word.text,
          suggestions: [correction],
          confidence: this.confidence,
          context: word.text
        };
      }
    }
    
    // Check for archaic gerund forms
    const archaicForms = [
      { pattern: /([а-я]+)учи$/, message: 'Форма на -учи устарела, используйте -я' },
      { pattern: /([а-я]+)ючи$/, message: 'Форма на -ючи устарела, используйте -я' }
    ];
    
    for (const archaic of archaicForms) {
      if (archaic.pattern.test(lowerWord)) {
        const stem = lowerWord.replace(archaic.pattern, '$1');
        const modernForm = stem + 'я';
        
        return {
          id: `${this.id}_${Date.now()}_${word.start}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: 'warning' as const,
          message: `Устаревшая форма деепричастия "${word.text}": ${archaic.message}`,
          explanation: 'Рекомендуется использовать современные формы деепричастий',
          start: word.start,
          end: word.end,
          text: word.text,
          suggestions: [modernForm],
          confidence: this.confidence,
          context: word.text
        };
      }
    }
    
    return null;
  }
}
