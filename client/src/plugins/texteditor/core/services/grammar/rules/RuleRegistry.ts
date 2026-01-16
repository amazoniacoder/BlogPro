/**
 * Rule Registry
 * 
 * Central registry for all grammar rules with priority management.
 */

import { GrammarRule } from '../../../types/LanguageTypes';
import { ShipyashchieRule } from './orthography/ShipyashchieRule';
import { SoftSignRule } from './orthography/SoftSignRule';
import { DoubleConsonantsRule } from './orthography/DoubleConsonantsRule';
import { PrefixRule } from './orthography/PrefixRule';
import { ProperNamesRule } from './orthography/ProperNamesRule';
import { PoPrefixRule } from './PoPrefixRule';

export class RuleRegistry {
  private rules: Map<string, GrammarRule> = new Map();
  
  private initialized = false;

  constructor() {
    // Rules will be loaded lazily
  }
  
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.registerDefaultRules();
      this.initialized = true;
    }
  }
  
  private async registerDefaultRules(): Promise<void> {
    // Phase 1: Foundation Rules
    this.register(new ShipyashchieRule());
    this.register(new SoftSignRule());
    this.register(new DoubleConsonantsRule());
    this.register(new PrefixRule());
    this.register(new ProperNamesRule());
    this.register(new PoPrefixRule());
    
    // Phase 2: Agreement Rules
    const { NounAdjectiveAgreementRule } = await import('./agreement/NounAdjectiveAgreementRule');
    const { SubjectPredicateAgreementRule } = await import('./agreement/SubjectPredicateAgreementRule');
    this.register(new NounAdjectiveAgreementRule());
    this.register(new SubjectPredicateAgreementRule());
    
    // Phase 3: Verb System Rules
    const { VerbConjugationRule } = await import('./verbs/VerbConjugationRule');
    const { ParticipleRule } = await import('./verbs/ParticipleRule');
    const { GerundRule } = await import('./verbs/GerundRule');
    this.register(new VerbConjugationRule());
    this.register(new ParticipleRule());
    this.register(new GerundRule());
    
    // Phase 4: Syntax Rules
    const { PunctuationRule } = await import('./syntax/PunctuationRule');
    const { DirectSpeechRule } = await import('./syntax/DirectSpeechRule');
    const { ComplexSentenceRule } = await import('./syntax/ComplexSentenceRule');
    this.register(new PunctuationRule());
    this.register(new DirectSpeechRule());
    this.register(new ComplexSentenceRule());
    
    // Phase 5: Advanced Rules
    const { RedundancyRule } = await import('./style/RedundancyRule');
    const { WordOrderRule } = await import('./style/WordOrderRule');
    const { TemporalConsistencyRule } = await import('./semantic/TemporalConsistencyRule');
    const { ReadabilityRule } = await import('./semantic/ReadabilityRule');
    this.register(new RedundancyRule());
    this.register(new WordOrderRule());
    this.register(new TemporalConsistencyRule());
    this.register(new ReadabilityRule());
  }
  
  register(rule: GrammarRule): void {
    this.rules.set(rule.id, rule);
  }
  
  unregister(ruleId: string): void {
    this.rules.delete(ruleId);
  }
  
  getRule(ruleId: string): GrammarRule | undefined {
    return this.rules.get(ruleId);
  }
  
  async getAllRules(): Promise<GrammarRule[]> {
    await this.ensureInitialized();
    return Array.from(this.rules.values());
  }
  
  async getEnabledRules(): Promise<GrammarRule[]> {
    const allRules = await this.getAllRules();
    return allRules.filter(rule => rule.enabled);
  }
  
  async getRulesByType(type: string): Promise<GrammarRule[]> {
    const allRules = await this.getAllRules();
    return allRules.filter(rule => rule.type === type);
  }
  
  enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      (rule as any).enabled = true;
    }
  }
  
  disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      (rule as any).enabled = false;
    }
  }
}
