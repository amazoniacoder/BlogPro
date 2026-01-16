/**
 * Direct Speech Rule
 * 
 * Checks quotation marks and punctuation in direct speech
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class DirectSpeechRule implements GrammarRule {
  readonly id = 'direct_speech_rule';
  readonly type = 'punctuation' as const;
  readonly subtype = 'quotes' as const;
  readonly severity = 'error' as const;
  readonly description = 'Правила оформления прямой речи';
  readonly explanation = 'Прямая речь должна быть правильно оформлена кавычками и знаками препинания';
  readonly examples = [
    { wrong: 'Он сказал Я приду', correct: 'Он сказал: «Я приду»' },
    { wrong: '"Привет" сказал он', correct: '«Привет», — сказал он' },
    { wrong: 'Мама спросила: Ты дома?', correct: 'Мама спросила: «Ты дома?»' }
  ];
  readonly confidence = 0.85;
  readonly enabled = true;

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    errors.push(...this.checkMissingQuotes(text));
    errors.push(...this.checkQuoteStyle(text));
    errors.push(...this.checkPunctuationInQuotes(text));
    
    return errors;
  }

  private checkMissingQuotes(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Pattern: "said/asked: Word" without quotes
    const speechPattern = /(сказал|говорил|спросил|ответил|крикнул|шепнул):\s+([А-ЯЁ][а-яё\s]+[.!?])/g;
    let match;
    
    while ((match = speechPattern.exec(text)) !== null) {
      const verb = match[1];
      const speech = match[2];
      
      // Check if speech is not in quotes
      if (!speech.startsWith('«') && !speech.startsWith('"')) {
        const speechStart = match.index + verb.length + 2; // +2 for ": "
        
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: 'Прямая речь должна быть заключена в кавычки',
          explanation: 'После слов автора прямая речь оформляется кавычками',
          start: speechStart,
          end: speechStart + speech.length,
          text: speech,
          suggestions: [`«${speech}»`],
          confidence: this.confidence,
          context: match[0]
        });
      }
    }
    
    return errors;
  }

  private checkQuoteStyle(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Check for English-style quotes instead of Russian «»
    const englishQuotesPattern = /"([^"]+)"/g;
    let match;
    
    while ((match = englishQuotesPattern.exec(text)) !== null) {
      const quotedText = match[1];
      
      errors.push({
        id: `${this.id}_${Date.now()}_${match.index}`,
        ruleId: this.id,
        type: this.type,
        subtype: this.subtype,
        severity: 'warning' as const,
        message: 'Рекомендуется использовать русские кавычки «»',
        explanation: 'В русском языке принято использовать кавычки-ёлочки',
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        suggestions: [`«${quotedText}»`],
        confidence: this.confidence,
        context: match[0]
      });
    }
    
    return errors;
  }

  private checkPunctuationInQuotes(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Pattern: "Speech", — said he (correct Russian style)
    const russianQuotesPattern = /«([^»]+)»([,.]?)\s*—?\s*(сказал|говорил|спросил|ответил)/g;
    let match;
    
    while ((match = russianQuotesPattern.exec(text)) !== null) {
      const speech = match[1];
      const punctuation = match[2];
      const verb = match[3];
      
      // Check if comma and dash are missing after quotes
      if (!punctuation && !text.substring(match.index + match[0].length - verb.length - 1, match.index + match[0].length - verb.length).includes('—')) {
        const quoteEnd = match.index + speech.length + 1; // +1 for closing quote
        
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: 'После прямой речи перед словами автора нужна запятая и тире',
          explanation: 'Прямая речь отделяется от слов автора запятой и тире',
          start: quoteEnd,
          end: quoteEnd + 1,
          text: ' ',
          suggestions: [', — '],
          confidence: this.confidence,
          context: match[0]
        });
      }
    }
    
    return errors;
  }
}
