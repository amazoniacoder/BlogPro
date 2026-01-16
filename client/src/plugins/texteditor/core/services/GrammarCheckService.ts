/**
 * Grammar Check Service
 * 
 * Main service for Russian grammar checking, using composition instead of inheritance
 */

import { ServiceFactory } from './ServiceFactory';
import { GrammarEngine } from './grammar/GrammarEngine';

import { GrammarResult, GrammarError, GrammarRule } from '../types/LanguageTypes';
import { Language } from '../types/spellCheckTypes';

export class GrammarCheckService {
  private spellCheckService: any;
  private grammarEngine: GrammarEngine;
  private isGrammarEnabled = false; // Grammar check disabled

  constructor() {
    this.initializeServices();
    this.grammarEngine = new GrammarEngine();

  }

  private async initializeServices() {
    this.spellCheckService = await ServiceFactory.getSpellCheckService();
  }

  /**
   * Check text for both spelling and grammar errors
   */
  async checkTextWithGrammar(text: string, language: Language = 'ru'): Promise<{
    spelling: any;
    grammar: GrammarResult;
    combined: any[];
  }> {

    
    // Ensure spell check service is initialized
    if (!this.spellCheckService) {
      await this.initializeServices();
    }
    
    // Run spell check (existing functionality)
    const spellingResult = await this.spellCheckService.checkText(text, language);
    
    // Grammar check disabled - return empty results
    const grammarResult = this.getEmptyGrammarResult();

    // Combine results
    const combinedErrors = [
      ...spellingResult.errors.map((error: any) => ({
        ...error,
        type: 'spelling' as const,
        source: 'spell-check'
      })),
      ...grammarResult.errors.map(error => ({
        ...error,
        source: 'grammar-check'
      }))
    ].sort((a, b) => a.start - b.start);



    return {
      spelling: spellingResult,
      grammar: grammarResult,
      combined: combinedErrors
    };
  }

  /**
   * Check only grammar (without spelling)
   */
  async checkGrammar(_text: string): Promise<GrammarResult> {
    // Grammar check disabled - return empty results
    return this.getEmptyGrammarResult();
  }

  /**
   * Add custom grammar rule
   */
  addGrammarRule(rule: GrammarRule): void {
    this.grammarEngine.addRule(rule);

  }

  /**
   * Update existing grammar rule
   */
  updateGrammarRule(ruleId: string, rule: GrammarRule): void {
    this.grammarEngine.updateRule(ruleId, rule);

  }

  /**
   * Enable/disable grammar checking
   */
  setGrammarEnabled(enabled: boolean): void {
    this.isGrammarEnabled = enabled;

  }

  /**
   * Get grammar checking status
   */
  isGrammarCheckingEnabled(): boolean {
    return this.isGrammarEnabled;
  }

  /**
   * Get all available grammar rules
   */
  getGrammarRules(): GrammarRule[] {
    return this.grammarEngine.getAllRules();
  }

  /**
   * Get grammar rules by type
   */
  getGrammarRulesByType(type: string): GrammarRule[] {
    return this.grammarEngine.getRulesByType(type);
  }

  /**
   * Get grammar engine performance statistics
   */
  getGrammarPerformanceStats(): Map<string, {average: number, max: number, count: number}> {
    return this.grammarEngine.getPerformanceStats();
  }

  /**
   * Learn from grammar correction
   */
  learnGrammarCorrection(original: string, corrected: string, ruleId?: string): void {
    // This will be implemented in Phase 4 with ML integration

    
    // For now, just log the correction for future analysis
    this.logCorrection('grammar', original, corrected, ruleId);
  }

  /**
   * Get grammar suggestions for specific error
   */
  getGrammarSuggestions(error: GrammarError): string[] {
    // Return existing suggestions or generate new ones
    if (error.suggestions && error.suggestions.length > 0) {
      return error.suggestions;
    }

    // Basic suggestion generation based on error type
    switch (error.subtype) {
      case 'capitalization':
        return [error.text.charAt(0).toUpperCase() + error.text.slice(1)];
      case 'comma':
        return [error.text.replace(/(\w+)\s+(что|чтобы)/, '$1, $2')];
      default:
        return [];
    }
  }

  /**
   * Get empty grammar result
   */
  private getEmptyGrammarResult(): GrammarResult {
    return {
      errors: [],
      suggestions: [],
      confidence: 1.0,
      processedAt: new Date(),
      language: 'ru',
      statistics: {
        totalRulesChecked: 0,
        errorsFound: 0,
        warningsFound: 0,
        suggestionsFound: 0
      }
    };
  }

  /**
   * Log correction for future analysis
   */
  private logCorrection(type: 'spelling' | 'grammar', original: string, corrected: string, ruleId?: string): void {
    const correction = {
      type,
      original,
      corrected,
      ruleId,
      timestamp: Date.now(),
      language: 'ru'
    };

    // Store in localStorage for now (will be moved to server in Phase 4)
    const corrections = JSON.parse(localStorage.getItem('grammar_corrections') || '[]');
    corrections.push(correction);
    
    // Keep only last 1000 corrections
    if (corrections.length > 1000) {
      corrections.splice(0, corrections.length - 1000);
    }
    
    localStorage.setItem('grammar_corrections', JSON.stringify(corrections));
  }



  /**
   * Get correction statistics
   */
  getCorrectionStats(): {
    total: number;
    byType: Record<string, number>;
    byRule: Record<string, number>;
    recent: any[];
  } {
    const corrections = JSON.parse(localStorage.getItem('grammar_corrections') || '[]');
    
    const byType: Record<string, number> = {};
    const byRule: Record<string, number> = {};
    
    corrections.forEach((correction: any) => {
      byType[correction.type] = (byType[correction.type] || 0) + 1;
      if (correction.ruleId) {
        byRule[correction.ruleId] = (byRule[correction.ruleId] || 0) + 1;
      }
    });

    return {
      total: corrections.length,
      byType,
      byRule,
      recent: corrections.slice(-10) // Last 10 corrections
    };
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    // Cleanup any resources if needed
  }
}
