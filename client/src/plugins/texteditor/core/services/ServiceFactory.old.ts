/**
 * Service Factory
 * 
 * Centralized service factory for dependency injection and service management.
 */

// Unified services
import { UnifiedFormatService } from './formatting/UnifiedFormatService';
import { UnifiedTextAnalysisService } from './analysis/UnifiedTextAnalysisService';

// Consolidated services
import { UberFormatService } from './formatting/UberFormatService';
import { UberAnalysisService } from './analysis/UberAnalysisService';

// Existing services
import { FontFormatService } from './formatting/FontFormatService';
import { LayoutFormatService } from './formatting/LayoutFormatService';
import { ListService } from './ListService';
import { LinkService } from './media/LinkService';
import { MediaService } from './media/MediaService';
import { TextReplacementService } from './content/TextReplacementService';
import { DOMManipulationService } from './dom/DOMManipulationService';
import { SearchService } from './content/SearchService';
import { HistoryService } from './HistoryService';

import { PerformanceService } from './ui/PerformanceService';
import { PerformanceMonitor } from './monitoring/PerformanceMonitor';
import { PluginStatusService } from './PluginStatusService';
import { PerformanceCollector } from './monitoring/PerformanceCollector';
import { KeyboardNavigationService } from './accessibility/KeyboardNavigationService';
import { ScreenReaderService } from './accessibility/ScreenReaderService';
import { APMService } from './monitoring/APMService';

// Unified interfaces
import {
  IUnifiedFormatService,
  IUnifiedSpellCheckService,
  IUnifiedTextAnalysisService,
  IHistoryService,
  IGrammarCheckService,
  IAutoSaveService,
  IPerformanceService
} from './UnifiedServiceInterfaces';

// Legacy interfaces for backward compatibility
import {
  ITextReplacementService,
  ISearchService
} from './ServiceInterfaces';

// Re-export interfaces for convenience
export * from './ServiceInterfaces';

export class ServiceFactory {
  // Unified services
  private static unifiedFormatService: IUnifiedFormatService | null = null;
  private static unifiedSpellCheckService: IUnifiedSpellCheckService | null = null;
  private static unifiedTextAnalysisService: IUnifiedTextAnalysisService | null = null;
  
  // Consolidated services
  private static uberFormatService: IUnifiedFormatService | null = null;
  private static uberAnalysisService: IUnifiedTextAnalysisService | null = null;
  
  // Existing services
  private static fontFormatService = FontFormatService;
  private static layoutFormatService = LayoutFormatService;
  private static textReplacementService: ITextReplacementService = TextReplacementService;
  private static domManipulationService = DOMManipulationService;
  private static searchService: ISearchService = new SearchService();
  private static historyService: IHistoryService = new HistoryService();
  private static grammarCheckService: IGrammarCheckService | null = null;
  private static autoSaveService: IAutoSaveService | null = null;
  private static performanceService: IPerformanceService | null = null;
  private static pluginStatusService: PluginStatusService | null = null;
  private static performanceCollector: PerformanceCollector | null = null;
  private static keyboardNavigationService: KeyboardNavigationService | null = null;
  private static screenReaderService: ScreenReaderService | null = null;
  private static apmService: APMService | null = null;


  // Unified service getters
  
  static getUnifiedFormatService(): IUnifiedFormatService {
    if (!this.unifiedFormatService) {
      this.unifiedFormatService = new UnifiedFormatService();
    }
    return this.unifiedFormatService;
  }
  
  static async getUnifiedSpellCheckService(): Promise<IUnifiedSpellCheckService> {
    if (!this.unifiedSpellCheckService) {
      const { UnifiedSpellCheckService } = await import('./spellcheck/UnifiedSpellCheckService');
      const service = new UnifiedSpellCheckService();
      // Initialize the service to ensure it's ready
      if (service.initialize) {
        await service.initialize();
      }
      this.unifiedSpellCheckService = service;
    }
    return this.unifiedSpellCheckService;
  }
  
  static getUnifiedTextAnalysisService(): IUnifiedTextAnalysisService {
    if (!this.unifiedTextAnalysisService) {
      this.unifiedTextAnalysisService = {
        analyzeText: (content: string, options?: any) => UnifiedTextAnalysisService.analyzeText(content, options),
        getWordCount: (content: string, options?: any) => UnifiedTextAnalysisService.getWordCount(content, options),
        getCharacterCount: (content: string, includeSpaces?: boolean, includeHtml?: boolean) => UnifiedTextAnalysisService.getCharacterCount(content, includeSpaces, includeHtml),
        getReadingTime: (content: string, readingSpeed?: number) => UnifiedTextAnalysisService.getReadingTime(content, readingSpeed),
        getParagraphCount: (content: string, includeHtml?: boolean) => UnifiedTextAnalysisService.getParagraphCount(content, includeHtml),
        getSentenceCount: (content: string, options?: any) => UnifiedTextAnalysisService.getSentenceCount(content, options),
        parseSentence: (sentence: string) => UnifiedTextAnalysisService.parseSentence(sentence),
        checkSyntax: (text: string) => UnifiedTextAnalysisService.checkSyntax(text),
        clearCache: () => UnifiedTextAnalysisService.clearCache(),
        getCacheStats: () => UnifiedTextAnalysisService.getCacheStats(),
        destroy: () => {}
      };
    }
    return this.unifiedTextAnalysisService;
  }
  
  // Legacy method for backward compatibility
  static getTextFormatService(): IUnifiedFormatService {
    return this.getUnifiedFormatService();
  }

  static getFontFormatService() {
    return this.fontFormatService;
  }

  static getLayoutFormatService() {
    return this.layoutFormatService;
  }

  static getListService() {
    return ListService;
  }

  static getLinkService() {
    return LinkService;
  }

  static getMediaService() {
    return MediaService;
  }

  static getTextReplacementService(): ITextReplacementService {
    return this.textReplacementService;
  }

  static getDOMManipulationService() {
    return this.domManipulationService;
  }

  static async getSpellCheckService(): Promise<IUnifiedSpellCheckService> {
    return this.getUnifiedSpellCheckService();
  }

  static getSearchService(): ISearchService {
    return this.searchService;
  }

  static getHistoryService(): IHistoryService {
    return this.historyService;
  }

  static async getGrammarCheckService(): Promise<IGrammarCheckService> {
    if (!this.grammarCheckService) {
      const { GrammarCheckService } = await import('./GrammarCheckService');
      this.grammarCheckService = new GrammarCheckService() as unknown as IGrammarCheckService;
    }
    return this.grammarCheckService;
  }

  static async getAutoSaveService(): Promise<IAutoSaveService> {
    if (!this.autoSaveService) {
      const { AutoSaveService } = await import('./AutoSaveService');
      const service = new AutoSaveService();
      this.autoSaveService = {
        ...service,
        destroy: () => {}
      } as unknown as IAutoSaveService;
    }
    return this.autoSaveService;
  }

  static getPerformanceService(): IPerformanceService {
    if (!this.performanceService) {
      this.performanceService = new PerformanceService();
    }
    return this.performanceService;
  }

  static getPerformanceMonitor() {
    return PerformanceMonitor;
  }

  static getPluginStatusService(): PluginStatusService {
    if (!this.pluginStatusService) {
      this.pluginStatusService = PluginStatusService.getInstance();
    }
    return this.pluginStatusService;
  }

  static getPerformanceCollector(): PerformanceCollector {
    if (!this.performanceCollector) {
      this.performanceCollector = PerformanceCollector.getInstance();
    }
    return this.performanceCollector;
  }

  static getKeyboardNavigationService(): KeyboardNavigationService {
    if (!this.keyboardNavigationService) {
      this.keyboardNavigationService = KeyboardNavigationService.getInstance();
    }
    return this.keyboardNavigationService;
  }

  static getScreenReaderService(): ScreenReaderService {
    if (!this.screenReaderService) {
      this.screenReaderService = ScreenReaderService.getInstance();
    }
    return this.screenReaderService;
  }

  static getAPMService(): APMService | null {
    return APMService.getInstance();
  }

  static initializeAPM(config: any): APMService {
    this.apmService = APMService.initialize(config);
    return this.apmService;
  }

  // Consolidated service getters
  static getUberFormatService(): IUnifiedFormatService {
    if (!this.uberFormatService) {
      this.uberFormatService = new UberFormatService();
    }
    return this.uberFormatService;
  }

  static getUberAnalysisService(): IUnifiedTextAnalysisService {
    if (!this.uberAnalysisService) {
      this.uberAnalysisService = new UberAnalysisService();
    }
    return this.uberAnalysisService;
  }



  static getDictionaryService(): any {
    // Placeholder for DictionaryService - implement as needed
    return {
      initialize: () => Promise.resolve(),
      addWord: () => Promise.resolve(),
      destroy: () => {}
    };
  }

  static getLanguageDetectionService(): any {
    // Placeholder for LanguageDetectionService - implement as needed
    return {
      detectLanguage: (_text: string) => ({ language: 'ru', confidence: 0.8 }),
      destroy: () => {}
    };
  }

  // Service cleanup for memory leak prevention
  static cleanup(): void {
    // Dispose unified services
    this.unifiedFormatService?.destroy();
    this.unifiedSpellCheckService?.destroy();
    this.unifiedTextAnalysisService?.destroy();
    
    // Dispose other services
    this.historyService?.destroy?.();
    this.grammarCheckService?.destroy();
    this.autoSaveService?.destroy();
    this.performanceService?.destroy();
    this.pluginStatusService?.destroy();
    this.performanceCollector?.destroy();
    this.keyboardNavigationService?.destroy();
    this.screenReaderService?.destroy();
    this.apmService?.destroy();
    
    // Cleanup performance monitor
    PerformanceMonitor.destroy();
    
    // Dispose consolidated services
    this.uberFormatService?.destroy();
    this.uberAnalysisService?.destroy();
    
    // Reset singleton references
    this.unifiedFormatService = null;
    this.unifiedSpellCheckService = null;
    this.unifiedTextAnalysisService = null;
    this.uberFormatService = null;
    this.uberAnalysisService = null;
    this.grammarCheckService = null;
    this.autoSaveService = null;
    this.performanceService = null;
    this.pluginStatusService = null;
    this.performanceCollector = null;
    this.keyboardNavigationService = null;
    this.screenReaderService = null;
    this.apmService = null;

  }



  // For testing - allow service injection
  
  static setUnifiedFormatService(service: IUnifiedFormatService): void {
    this.unifiedFormatService = service;
  }
  
  static setUnifiedSpellCheckService(service: IUnifiedSpellCheckService): void {
    this.unifiedSpellCheckService = service;
  }
  
  static setUnifiedTextAnalysisService(service: IUnifiedTextAnalysisService): void {
    this.unifiedTextAnalysisService = service;
  }
  
  // Legacy method for backward compatibility
  static setTextFormatService(service: IUnifiedFormatService): void {
    this.setUnifiedFormatService(service);
  }

  static setFontFormatService(service: any): void {
    this.fontFormatService = service;
  }

  static setLayoutFormatService(service: any): void {
    this.layoutFormatService = service;
  }

  static setTextReplacementService(service: ITextReplacementService): void {
    this.textReplacementService = service;
  }

  static setDOMManipulationService(service: any): void {
    this.domManipulationService = service;
  }

  static setSpellCheckService(service: IUnifiedSpellCheckService): void {
    this.setUnifiedSpellCheckService(service);
  }

  static setSearchService(service: ISearchService): void {
    this.searchService = service;
  }

  static setHistoryService(service: IHistoryService): void {
    this.historyService = service;
  }

  static setGrammarCheckService(service: IGrammarCheckService): void {
    this.grammarCheckService = service;
  }

  static setAutoSaveService(service: IAutoSaveService): void {
    this.autoSaveService = service;
  }

  static setPerformanceService(service: IPerformanceService): void {
    this.performanceService = service;
  }
}
