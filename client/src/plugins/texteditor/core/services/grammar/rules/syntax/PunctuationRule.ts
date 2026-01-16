/**
 * Punctuation Rule
 * 
 * Checks comma placement, dash usage, and other punctuation patterns
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class PunctuationRule implements GrammarRule {
  readonly id = 'punctuation_rule';
  readonly type = 'punctuation' as const;
  readonly subtype = 'comma' as const;
  readonly severity = 'warning' as const;
  readonly description = 'Правила пунктуации';
  readonly explanation = 'Проверка запятых, тире и других знаков препинания';
  readonly examples = [
    { wrong: 'Он сказал что придёт', correct: 'Он сказал, что придёт' },
    { wrong: 'Мальчик который читает', correct: 'Мальчик, который читает' },
    { wrong: 'Москва столица России', correct: 'Москва — столица России' }
  ];
  readonly confidence = 0.8;
  readonly enabled = true;

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    const subordinateErrors = this.checkSubordinateClauses(text);
    errors.push(...subordinateErrors);
    
    const compoundErrors = this.checkCompoundSentences(text);
    errors.push(...compoundErrors);
    
    const dashErrors = this.checkDashUsage(text);
    errors.push(...dashErrors);
    
    return errors;
  }

  private checkSubordinateClauses(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Comma before subordinate conjunctions
    const subordinatePattern = /([а-яёА-ЯЁ]+)\s+(что|чтобы|когда|если|хотя|потому что|так как)\s+/g;
    let match;
    
    while ((match = subordinatePattern.exec(text)) !== null) {
      const beforeConjunction = match[1];
      const conjunction = match[2];
      
      // Check if comma is missing
      if (!beforeConjunction.endsWith(',')) {
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: `Перед союзом "${conjunction}" нужна запятая`,
          explanation: 'Перед подчинительными союзами ставится запятая',
          start: match.index + beforeConjunction.length,
          end: match.index + beforeConjunction.length + 1,
          text: ' ',
          suggestions: [', '],
          confidence: this.confidence,
          context: match[0]
        });
      }
    }
    
    return errors;
  }

  private checkCompoundSentences(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Comma before coordinating conjunctions
    const compoundPattern = /([а-яёА-ЯЁ]+)\s+(и|а|но|или|либо|да)\s+([а-яёА-ЯЁ]+)/g;
    let match;
    
    while ((match = compoundPattern.exec(text)) !== null) {
      const beforeConjunction = match[1];
      const conjunction = match[2];
      const afterConjunction = match[3];
      
      // Check if this looks like a compound sentence (both parts have verbs)
      if (this.looksLikeCompoundSentence(beforeConjunction, afterConjunction) && 
          !beforeConjunction.endsWith(',') && 
          conjunction !== 'и') { // 'и' doesn't always need comma
        
        errors.push({
          id: `${this.id}_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: this.subtype,
          severity: this.severity,
          message: `Перед союзом "${conjunction}" в сложном предложении нужна запятая`,
          explanation: 'В сложносочинённых предложениях перед союзами ставится запятая',
          start: match.index + beforeConjunction.length,
          end: match.index + beforeConjunction.length + 1,
          text: ' ',
          suggestions: [', '],
          confidence: this.confidence * 0.7, // Lower confidence for compound sentences
          context: match[0]
        });
      }
    }
    
    return errors;
  }

  private checkDashUsage(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Dash between subject and predicate (noun - noun pattern)
    // Specific patterns for apposition (like "Москвой - столицей")
    const appositionPattern = /([а-яё]+ой)\s+([а-яё]+ицей|[а-яё]+ом)/g;
    
    
    let match;
    while ((match = appositionPattern.exec(text)) !== null) {
      const word1 = match[1];
      const word2 = match[2];
      
      
      // Check if dash is missing between instrumental case nouns
      if (!match[0].includes('—') && !match[0].includes('-')) {
        
        const dashPosition = match.index + word1.length;
        
        errors.push({
          id: `${this.id}_apposition_${Date.now()}_${match.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: 'dash' as any,
          severity: this.severity,
          message: `Между "однородными членами" "${word1}" и "${word2}" нужно тире`,
          explanation: 'Между однородными членами предложения ставится тире',
          start: dashPosition,
          end: dashPosition + 1,
          text: ' ',
          suggestions: [' — '],
          confidence: this.confidence * 0.8,
          context: match[0]
        });
      }
    }
    
    // Check for dash before linking words (это, вот, так, значит)
    const linkingWordPattern = /([А-ЯЁ][а-яё]+|[а-яё]+)\s+(это|вот|так|значит)\s+([а-яё]+)/g;
    
    
    let linkMatch;
    while ((linkMatch = linkingWordPattern.exec(text)) !== null) {
      const subject = linkMatch[1];
      const linkingWord = linkMatch[2];
            
      // Check if dash is missing before linking word
      if (!linkMatch[0].includes('—') && !linkMatch[0].includes('-')) {
        
        const dashPosition = linkMatch.index + subject.length;
        
        errors.push({
          id: `${this.id}_linking_${Date.now()}_${linkMatch.index}`,
          ruleId: this.id,
          type: this.type,
          subtype: 'dash' as any,
          severity: this.severity,
          message: `Перед словом "${linkingWord}" нужно тире`,
          explanation: 'Перед словами "это", "вот", "так", "значит" в роли связки ставится тире',
          start: dashPosition,
          end: dashPosition + 1,
          text: ' ',
          suggestions: [' — '],
          confidence: this.confidence * 0.9,
          context: linkMatch[0]
        });
      }
    }
    
    // Original subject-predicate pattern (more restrictive now)
    const subjectPredicatePattern = /([А-ЯЁ][а-яё]+)\s+([а-яё]+а|[а-яё]+ица|[а-яё]+ород|[а-яё]+страна)(?:\s+[А-ЯЁ][а-яё]*)?[.!?\s]/g;
    let subjectMatch;
    
    
    while ((subjectMatch = subjectPredicatePattern.exec(text)) !== null) {
      const subject = subjectMatch[1];
      const predicate = subjectMatch[2];
      
      
      // Check if this looks like "Subject - Predicate" construction
      if (this.isSubjectPredicateConstruction(subject, predicate)) {
        const fullMatch = subjectMatch[0];
        const dashPosition = subjectMatch.index + subject.length;
        
        
        if (!fullMatch.includes('—') && !fullMatch.includes('-')) {
          errors.push({
            id: `${this.id}_${Date.now()}_${subjectMatch.index}`,
            ruleId: this.id,
            type: this.type,
            subtype: 'dash' as any,
            severity: this.severity,
            message: `Между подлежащим "${subject}" и сказуемым "${predicate}" нужно тире`,
            explanation: 'Между подлежащим и сказуемым, выраженными существительными, ставится тире',
            start: dashPosition,
            end: dashPosition + 1,
            text: ' ',
            suggestions: [' — '],
            confidence: this.confidence * 0.6, // Lower confidence for dash rules
            context: subjectMatch[0]
          });
        }
      }
    }
    
    return errors;
  }

  private looksLikeCompoundSentence(part1: string, part2: string): boolean {
    // Simple heuristic: check if both parts might contain verbs
    const verbEndings = ['ет', 'ит', 'ют', 'ят', 'ал', 'ил', 'ла', 'ло'];
    
    const hasVerb1 = verbEndings.some(ending => part1.toLowerCase().endsWith(ending));
    const hasVerb2 = verbEndings.some(ending => part2.toLowerCase().endsWith(ending));
    
    return hasVerb1 && hasVerb2;
  }

  private isSubjectPredicateConstruction(subject: string, predicate: string): boolean {
    
    // Check for specific known patterns first
    const knownPatterns = [
      { subject: 'Москва', predicate: 'столица' },
      { subject: 'Столица', predicate: 'россии' }, // Столица России
      { subject: 'Петербург', predicate: 'город' },
      { subject: 'Россия', predicate: 'страна' }
    ];
    
    const isKnownPattern = knownPatterns.some(pattern => 
      pattern.subject.toLowerCase() === subject.toLowerCase() && 
      pattern.predicate.toLowerCase() === predicate.toLowerCase()
    );
    
    if (isKnownPattern) {
      return true;
    }
    
    // Simple heuristic: subject is capitalized noun, predicate is noun
    const nounEndings = ['а', 'я', 'о', 'е', 'ь', 'ии', 'ы']; // Added ии for genitive
    const predicateEndings = ['а', 'я', 'о', 'е', 'ии', 'ы']; // Added ии for genitive
    
    const subjectIsNoun = nounEndings.some(ending => subject.toLowerCase().endsWith(ending)) ||
                         /[а-яё]+[^аеёиоуыэюя]$/.test(subject.toLowerCase());
    const predicateIsNoun = predicateEndings.some(ending => predicate.toLowerCase().endsWith(ending));
    
    
    return subjectIsNoun && predicateIsNoun;
  }
}
