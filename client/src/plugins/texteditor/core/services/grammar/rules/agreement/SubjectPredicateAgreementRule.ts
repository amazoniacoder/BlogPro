/**
 * Subject-Predicate Agreement Rule
 * 
 * Checks agreement between subject and predicate in number and person
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class SubjectPredicateAgreementRule implements GrammarRule {
  readonly id = 'subject_predicate_agreement';
  readonly type = 'agreement' as const;
  readonly subtype = 'subject_verb' as const;
  readonly severity = 'error' as const;
  readonly description = 'Согласование подлежащего и сказуемого';
  readonly explanation = 'Подлежащее и сказуемое должны согласоваться в числе и лице';
  readonly examples = [
    { wrong: 'Мальчик играют', correct: 'Мальчик играет' },
    { wrong: 'Дети играет', correct: 'Дети играют' },
    { wrong: 'Я играет', correct: 'Я играю' }
  ];
  readonly confidence = 0.75;
  readonly enabled = true;

  // Common subject-verb patterns
  private readonly subjectPatterns = {
    singular: ['мальчик', 'девочка', 'человек', 'ребёнок', 'учитель', 'студент'],
    plural: ['мальчики', 'девочки', 'люди', 'дети', 'учителя', 'студенты']
  };

  private readonly verbPatterns = {
    singular: {
      third: ['играет', 'читает', 'пишет', 'говорит', 'идёт', 'делает'],
      first: ['играю', 'читаю', 'пишу', 'говорю', 'иду', 'делаю'],
      second: ['играешь', 'читаешь', 'пишешь', 'говоришь', 'идёшь', 'делаешь']
    },
    plural: {
      third: ['играют', 'читают', 'пишут', 'говорят', 'идут', 'делают'],
      first: ['играем', 'читаем', 'пишем', 'говорим', 'идём', 'делаем'],
      second: ['играете', 'читаете', 'пишете', 'говорите', 'идёте', 'делаете']
    }
  };

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    const sentences = this.splitIntoSentences(text);
    
    for (const sentence of sentences) {
      const subjectVerbPairs = this.findSubjectVerbPairs(sentence);
      
      for (const pair of subjectVerbPairs) {
        const agreementError = this.checkSubjectVerbAgreement(pair, sentence);
        if (agreementError) {
          errors.push(agreementError);
        }
      }
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
    
    // Add remaining text as last sentence
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

  private findSubjectVerbPairs(sentence: {text: string, start: number}): Array<{
    subject: string,
    verb: string,
    subjectPos: number,
    verbPos: number
  }> {
    const pairs: Array<{subject: string, verb: string, subjectPos: number, verbPos: number}> = [];
    const words = sentence.text.toLowerCase().split(/\s+/);
    
    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i];
      const word2 = words[i + 1];
      
      // Check if word1 is subject and word2 is verb
      if (this.isSubject(word1) && this.isVerb(word2)) {
        pairs.push({
          subject: word1,
          verb: word2,
          subjectPos: sentence.start + sentence.text.toLowerCase().indexOf(word1),
          verbPos: sentence.start + sentence.text.toLowerCase().indexOf(word2)
        });
      }
    }
    
    return pairs;
  }

  private isSubject(word: string): boolean {
    return this.subjectPatterns.singular.includes(word) || 
           this.subjectPatterns.plural.includes(word) ||
           ['я', 'ты', 'он', 'она', 'оно', 'мы', 'вы', 'они'].includes(word);
  }

  private isVerb(word: string): boolean {
    return this.verbPatterns.singular.third.includes(word) ||
           this.verbPatterns.singular.first.includes(word) ||
           this.verbPatterns.singular.second.includes(word) ||
           this.verbPatterns.plural.third.includes(word) ||
           this.verbPatterns.plural.first.includes(word) ||
           this.verbPatterns.plural.second.includes(word);
  }

  private checkSubjectVerbAgreement(
    pair: {subject: string, verb: string, subjectPos: number, verbPos: number},
    sentence: {text: string, start: number}
  ): GrammarError | null {
    const subjectNumber = this.getSubjectNumber(pair.subject);
    const verbNumber = this.getVerbNumber(pair.verb);
    
    if (subjectNumber && verbNumber && subjectNumber !== verbNumber) {
      const correctVerb = this.getCorrectVerbForm(pair.subject, pair.verb);
      
      return {
        id: `${this.id}_${Date.now()}_${pair.subjectPos}`,
        ruleId: this.id,
        type: this.type,
        subtype: this.subtype,
        severity: this.severity,
        message: `Подлежащее "${pair.subject}" не согласуется со сказуемым "${pair.verb}"`,
        explanation: `Подлежащее в ${subjectNumber === 'singular' ? 'единственном' : 'множественном'} числе требует сказуемого в том же числе`,
        start: pair.subjectPos,
        end: pair.verbPos + pair.verb.length,
        text: `${pair.subject} ${pair.verb}`,
        suggestions: correctVerb ? [`${pair.subject} ${correctVerb}`] : [],
        confidence: this.confidence,
        context: sentence.text
      };
    }
    
    return null;
  }

  private getSubjectNumber(subject: string): 'singular' | 'plural' | null {
    if (this.subjectPatterns.singular.includes(subject) || 
        ['я', 'ты', 'он', 'она', 'оно'].includes(subject)) {
      return 'singular';
    }
    if (this.subjectPatterns.plural.includes(subject) || 
        ['мы', 'вы', 'они'].includes(subject)) {
      return 'plural';
    }
    return null;
  }

  private getVerbNumber(verb: string): 'singular' | 'plural' | null {
    if (this.verbPatterns.singular.third.includes(verb) ||
        this.verbPatterns.singular.first.includes(verb) ||
        this.verbPatterns.singular.second.includes(verb)) {
      return 'singular';
    }
    if (this.verbPatterns.plural.third.includes(verb) ||
        this.verbPatterns.plural.first.includes(verb) ||
        this.verbPatterns.plural.second.includes(verb)) {
      return 'plural';
    }
    return null;
  }

  private getCorrectVerbForm(subject: string, incorrectVerb: string): string | null {
    const subjectNumber = this.getSubjectNumber(subject);
    if (!subjectNumber) return null;
    
    // Simple correction mapping
    const corrections: Record<string, string> = {
      'играют': 'играет',
      'играет': 'играют',
      'читают': 'читает',
      'читает': 'читают',
      'пишут': 'пишет',
      'пишет': 'пишут'
    };
    
    return corrections[incorrectVerb] || null;
  }
}
