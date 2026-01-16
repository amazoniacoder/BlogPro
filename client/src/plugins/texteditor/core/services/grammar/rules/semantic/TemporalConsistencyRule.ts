/**
 * Temporal Consistency Rule
 * 
 * Checks consistency of tenses and temporal expressions
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class TemporalConsistencyRule implements GrammarRule {
  readonly id = 'temporal_consistency_rule';
  readonly type = 'style' as const;
  readonly subtype = 'style_consistency' as const;
  readonly severity = 'suggestion' as const;
  readonly description = 'Согласованность времён';
  readonly explanation = 'Проверка последовательности временных форм';
  readonly examples = [
    { wrong: 'Вчера я иду в магазин', correct: 'Вчера я шёл в магазин' },
    { wrong: 'Завтра он работал', correct: 'Завтра он будет работать' },
    { wrong: 'Сейчас мы были дома', correct: 'Сейчас мы дома' }
  ];
  readonly confidence = 0.7;
  readonly enabled = true;

  // Temporal indicators
  private readonly pastIndicators = ['вчера', 'позавчера', 'недавно', 'раньше', 'прежде'];
  private readonly presentIndicators = ['сейчас', 'теперь', 'в данный момент', 'сегодня'];
  private readonly futureIndicators = ['завтра', 'послезавтра', 'скоро', 'потом', 'позже'];

  // Verb tense patterns
  private readonly pastVerbs = /([а-яё]+)(ал|ил|ел|ла|ло|ли)(\s|$)/gi;
  private readonly presentVerbs = /([а-яё]+)(ю|ешь|ет|ем|ете|ут|ют|ишь|ит|им|ите|ат|ят)(\s|$)/gi;


  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    const sentences = this.splitIntoSentences(text);
    
    for (const sentence of sentences) {
      errors.push(...this.checkTemporalConsistency(sentence));
    }
    
    return errors;
  }

  private splitIntoSentences(text: string): Array<{text: string, start: number}> {
    const sentences: Array<{text: string, start: number}> = [];
    const sentenceRegex = /[.!?]+\s*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = sentenceRegex.exec(text)) !== null) {
      const sentenceText = text.substring(lastIndex, match.index + match[0].length).trim();
      if (sentenceText) {
        sentences.push({
          text: sentenceText,
          start: lastIndex
        });
      }
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex).trim();
      if (remaining) {
        sentences.push({
          text: remaining,
          start: lastIndex
        });
      }
    }
    
    return sentences;
  }

  private checkTemporalConsistency(sentence: {text: string, start: number}): GrammarError[] {
    const errors: GrammarError[] = [];
    const lowerText = sentence.text.toLowerCase();
    
    // Check past indicators with non-past verbs
    for (const indicator of this.pastIndicators) {
      if (lowerText.includes(indicator)) {
        const presentMatch = this.presentVerbs.exec(sentence.text);
        if (presentMatch) {
          errors.push(this.createTemporalError(
            sentence,
            presentMatch,
            `Временной указатель "${indicator}" не согласуется с настоящим временем глагола`,
            'Используйте прошедшее время глагола'
          ));
        }
      }
    }
    
    // Check future indicators with past verbs
    for (const indicator of this.futureIndicators) {
      if (lowerText.includes(indicator)) {
        const pastMatch = this.pastVerbs.exec(sentence.text);
        if (pastMatch) {
          errors.push(this.createTemporalError(
            sentence,
            pastMatch,
            `Временной указатель "${indicator}" не согласуется с прошедшим временем глагола`,
            'Используйте будущее время глагола'
          ));
        }
      }
    }
    
    // Check present indicators with past verbs
    for (const indicator of this.presentIndicators) {
      if (lowerText.includes(indicator)) {
        const pastMatch = this.pastVerbs.exec(sentence.text);
        if (pastMatch) {
          errors.push(this.createTemporalError(
            sentence,
            pastMatch,
            `Временной указатель "${indicator}" не согласуется с прошедшим временем глагола`,
            'Используйте настоящее время глагола'
          ));
        }
      }
    }
    
    return errors;
  }

  private createTemporalError(
    sentence: {text: string, start: number},
    verbMatch: RegExpExecArray,
    message: string,
    suggestion: string
  ): GrammarError {
    return {
      id: `${this.id}_${Date.now()}_${sentence.start}`,
      ruleId: this.id,
      type: this.type,
      subtype: this.subtype,
      severity: this.severity,
      message,
      explanation: suggestion,
      start: sentence.start + verbMatch.index!,
      end: sentence.start + verbMatch.index! + verbMatch[0].length,
      text: verbMatch[0],
      suggestions: [suggestion],
      confidence: this.confidence,
      context: sentence.text
    };
  }
}
