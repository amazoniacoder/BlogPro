/**
 * Service Registry
 * 
 * Defines all service registrations for the DI container.
 */

import { DIContainer } from './DIContainer';
import { UnifiedFormatService } from '../services/formatting/UnifiedFormatService';
import { UnifiedSpellCheckService } from '../services/spellcheck/UnifiedSpellCheckService';
import { UnifiedTextAnalysisService } from '../services/analysis/UnifiedTextAnalysisService';
import { HistoryService } from '../services/HistoryService';
import { PerformanceService } from '../services/ui/PerformanceService';
import { AutoSaveService } from '../services/AutoSaveService';

export class ServiceRegistry {
  static registerServices(container: DIContainer): void {
    // Format Service
    container.register('unifiedFormatService', {
      factory: () => new UnifiedFormatService(),
      singleton: true
    });

    // Spell Check Service
    container.register('unifiedSpellCheckService', {
      factory: async () => {
        const service = new UnifiedSpellCheckService();
        await service.initialize();
        return service;
      },
      singleton: true
    });

    // Text Analysis Service
    container.register('unifiedTextAnalysisService', {
      factory: () => ({
        analyzeText: (content: string, options?: any) => UnifiedTextAnalysisService.analyzeText(content, options),
        getWordCount: (content: string, options?: any) => UnifiedTextAnalysisService.getWordCount(content, options),
        getCharacterCount: (content: string, includeSpaces?: boolean, includeHtml?: boolean) => 
          UnifiedTextAnalysisService.getCharacterCount(content, includeSpaces, includeHtml),
        getReadingTime: (content: string, readingSpeed?: number) => 
          UnifiedTextAnalysisService.getReadingTime(content, readingSpeed),
        getParagraphCount: (content: string, includeHtml?: boolean) => 
          UnifiedTextAnalysisService.getParagraphCount(content, includeHtml),
        getSentenceCount: (content: string, options?: any) => 
          UnifiedTextAnalysisService.getSentenceCount(content, options),
        parseSentence: (sentence: string) => UnifiedTextAnalysisService.parseSentence(sentence),
        checkSyntax: (text: string) => UnifiedTextAnalysisService.checkSyntax(text),
        clearCache: () => UnifiedTextAnalysisService.clearCache(),
        getCacheStats: () => UnifiedTextAnalysisService.getCacheStats(),
        destroy: () => {}
      }),
      singleton: true
    });

    // History Service
    container.register('historyService', {
      factory: () => new HistoryService(),
      singleton: true
    });

    // Performance Service
    container.register('performanceService', {
      factory: () => new PerformanceService(),
      singleton: true
    });

    // Auto Save Service
    container.register('autoSaveService', {
      factory: () => new AutoSaveService(),
      singleton: true
    });
  }
}
