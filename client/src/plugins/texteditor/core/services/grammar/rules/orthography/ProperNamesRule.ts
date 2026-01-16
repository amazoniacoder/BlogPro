/**
 * Proper Names Rule
 * 
 * Checks capitalization of proper names using algorithmic patterns
 */

import { GrammarRule, GrammarError } from '../../../../types/LanguageTypes';

export class ProperNamesRule implements GrammarRule {
  readonly id = 'proper_names_rule';
  readonly type = 'orthography' as const;
  readonly subtype = 'capitalization' as const;
  readonly severity = 'error' as const;
  readonly description = 'Правописание собственных имён';
  readonly explanation = 'Собственные имена пишутся с заглавной буквы';
  readonly examples = [
    { wrong: 'москва столица россии', correct: 'Москва столица России' },
    { wrong: 'иван петров', correct: 'Иван Петров' },
    { wrong: 'река волга', correct: 'река Волга' }
  ];
  readonly confidence = 0.85;
  readonly enabled = true;

  check(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Check for country names
    errors.push(...this.checkCountryNames(text));
    
    // Check for city names
    errors.push(...this.checkCityNames(text));
    
    // Check for personal names
    errors.push(...this.checkPersonalNames(text));
    
    // Check for geographic names
    errors.push(...this.checkGeographicNames(text));
    
    return errors;
  }

  private checkCountryNames(text: string): GrammarError[] {
    const errors: GrammarError[] = [];   

    
    // Common country name patterns (algorithmic detection)
    const countryPatterns = [
      // Specific country names (all cases) - removed word boundaries to match before punctuation
      /(россии|россия|россией|россию)(?=[\s.,!?;:]|$)/gi,
      // Cities that should be capitalized
      /(москвой|москва|москве|москву|москвы)(?=[\s.,!?;:]|$)/gi,
      // Other countries
      /(герман[ия]+|итал[ия]+|франц[ия]+|испан[ия]+|польш[а]+|чех[ия]+)(?=[\s.,!?;:]|$)/gi,
      // Countries ending in -ия (like Россия, Германия, Италия)
      /([а-я]+ия)(?=[\s.,!?;:]|$)/g,
      // Countries ending in -ан (like Афганистан, Пакистан)
      /([а-я]+стан)(?=[\s.,!?;:]|$)/g
    ];
    
    countryPatterns.forEach((pattern) => {
      pattern.lastIndex = 0; // Reset regex state
      let match;
      let matchFound = false;
      while ((match = pattern.exec(text)) !== null) {
        matchFound = true;
        const word = match[1];
        
        
        // Check if it's lowercase and looks like a country
        if (this.isLowercaseCountry(word)) {
          const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
          
          errors.push({
            id: `${this.id}_country_${Date.now()}_${match.index}`,
            ruleId: this.id,
            type: this.type,
            subtype: this.subtype,
            severity: this.severity,
            message: `Название страны "${word}" должно писаться с заглавной буквы`,
            explanation: 'Названия стран пишутся с заглавной буквы',
            start: match.index,
            end: match.index + word.length,
            text: word,
            suggestions: [capitalizedWord],
            confidence: this.confidence,
            context: match[0]
          });
        }
      }
      
      // Debug: Show if no matches found for this pattern
      if (!matchFound) {
        // Test specific words manually
        const testWords = ['россии', 'москвой'];
        testWords.forEach(testWord => {
          pattern.test(testWord);
          pattern.lastIndex = 0; // Reset after test
        });
      }
    });
    
    return errors;
  }

  private checkCityNames(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // City name patterns
    const cityPatterns = [
      // Cities ending in -ск, -град, -бург
      /\b([а-я]+(?:ск|град|бург))\b/g,
      // Common city names
      /\b(москв[а]+|петербург|киев|минск|варшав[а]+|прага|берлин|париж|лондон|рим)\b/gi
    ];
    
    cityPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const word = match[1];
        
        if (this.isLowercaseCity(word)) {
          const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
          
          errors.push({
            id: `${this.id}_city_${Date.now()}_${match.index}`,
            ruleId: this.id,
            type: this.type,
            subtype: this.subtype,
            severity: this.severity,
            message: `Название города "${word}" должно писаться с заглавной буквы`,
            explanation: 'Названия городов пишутся с заглавной буквы',
            start: match.index,
            end: match.index + word.length,
            text: word,
            suggestions: [capitalizedWord],
            confidence: this.confidence,
            context: match[0]
          });
        }
      }
    });
    
    return errors;
  }

  private checkPersonalNames(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Personal name patterns (after common titles or in name-like contexts)
    const nameContexts = [
      // After titles
      /\b(?:господин|госпожа|товарищ|доктор|профессор|президент)\s+([а-я]+)\b/g,
      // Patronymic patterns (ending in -ович, -евич, -овна, -евна)
      /\b([а-я]+(?:ович|евич|овна|евна))\b/g,
      // Common first names patterns
      /\b([а-я]+(?:ан|ин|ий|ей|ай|ол|ил|ел|ав|ав|ев|ов))\s+([а-я]+(?:ов|ев|ин|ын|ский|цкий))\b/g
    ];
    
    nameContexts.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        // Check each captured group for lowercase names
        for (let i = 1; i < match.length; i++) {
          const word = match[i];
          if (word && this.isLowercaseName(word)) {
            const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
            
            errors.push({
              id: `${this.id}_name_${Date.now()}_${match.index}_${i}`,
              ruleId: this.id,
              type: this.type,
              subtype: this.subtype,
              severity: this.severity,
              message: `Имя собственное "${word}" должно писаться с заглавной буквы`,
              explanation: 'Имена, фамилии и отчества пишутся с заглавной буквы',
              start: match.index + match[0].indexOf(word),
              end: match.index + match[0].indexOf(word) + word.length,
              text: word,
              suggestions: [capitalizedWord],
              confidence: this.confidence * 0.8, // Lower confidence for names
              context: match[0]
            });
          }
        }
      }
    });
    
    return errors;
  }

  private checkGeographicNames(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Geographic features with common prefixes
    const geoPatterns = [
      // Rivers, seas, mountains with prefixes
      /\b(?:река|море|озеро|гора|хребет|остров)\s+([а-я]+)\b/g,
      // Geographic names ending in specific suffixes
      /\b([а-я]+(?:ское|ский|ская|цкое|цкий|цкая))\s+(?:море|озеро|поле|плато)\b/g
    ];
    
    geoPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const word = match[1];
        
        if (this.isLowercaseGeographic(word)) {
          const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
          
          errors.push({
            id: `${this.id}_geo_${Date.now()}_${match.index}`,
            ruleId: this.id,
            type: this.type,
            subtype: this.subtype,
            severity: this.severity,
            message: `Географическое название "${word}" должно писаться с заглавной буквы`,
            explanation: 'Названия географических объектов пишутся с заглавной буквы',
            start: match.index + match[0].indexOf(word),
            end: match.index + match[0].indexOf(word) + word.length,
            text: word,
            suggestions: [capitalizedWord],
            confidence: this.confidence * 0.7,
            context: match[0]
          });
        }
      }
    });
    
    return errors;
  }

  private isLowercaseCountry(word: string): boolean {
    
    // Check if word starts with lowercase and matches country patterns
    if (word.charAt(0) === word.charAt(0).toUpperCase()) {
      return false;
    }
    
    // Country-specific patterns
    const countryIndicators = [
      /^россии$/i,  // россии (genitive case)
      /^россия$/i,  // россия (nominative)
      /^россией$/i, // россией (instrumental)
      /^россию$/i,  // россию (accusative)
      /^москвой$/i, // москвой (instrumental)
      /^москва$/i,  // москва (nominative)
      /^москве$/i,  // москве (prepositional)
      /^москву$/i,  // москву (accusative)
      /^москвы$/i,  // москвы (genitive)
      /^герман[ия]+$/i,
      /^франц[ия]+$/i,
      /^итал[ия]+$/i,
      /^испан[ия]+$/i,
      /^польш[а]+$/i,
      /.*стан$/i, // Countries ending in -стан
      /.*ия$/i    // Countries ending in -ия
    ];
    
    const isCountry = countryIndicators.some(pattern => pattern.test(word));
    return isCountry;
  }

  private isLowercaseCity(word: string): boolean {
    if (word.charAt(0) === word.charAt(0).toUpperCase()) return false;
    
    const cityIndicators = [
      /^москв[а]+$/i,
      /^петербург$/i,
      /.*град$/i,  // Cities ending in -град
      /.*ск$/i,    // Cities ending in -ск
      /.*бург$/i   // Cities ending in -бург
    ];
    
    return cityIndicators.some(pattern => pattern.test(word));
  }

  private isLowercaseName(word: string): boolean {
    if (word.charAt(0) === word.charAt(0).toUpperCase()) return false;
    
    // Name patterns (patronymics, surnames)
    const nameIndicators = [
      /.*ович$/i,
      /.*евич$/i,
      /.*овна$/i,
      /.*евна$/i,
      /.*ов$/i,
      /.*ев$/i,
      /.*ин$/i,
      /.*ын$/i,
      /.*ский$/i,
      /.*цкий$/i
    ];
    
    return nameIndicators.some(pattern => pattern.test(word));
  }

  private isLowercaseGeographic(word: string): boolean {
    if (word.charAt(0) === word.charAt(0).toUpperCase()) return false;
    
    const geoIndicators = [
      /.*ское$/i,
      /.*ский$/i,
      /.*ская$/i,
      /.*цкое$/i,
      /.*цкий$/i,
      /.*цкая$/i
    ];
    
    return geoIndicators.some(pattern => pattern.test(word));
  }
}
