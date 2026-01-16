/**
 * ServiceFactory consolidated tests
 * Tests the updated ServiceFactory with unified services
 */

import { ServiceFactory } from '../../core/services/ServiceFactory';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var afterEach: any;
  var vi: any;
}

// Mock unified services
vi.mock('../../core/services/formatting/UnifiedFormatService', () => ({
  UnifiedFormatService: vi.fn().mockImplementation(() => ({
    applyBold: vi.fn(),
    applyItalic: vi.fn(),
    applyUnderline: vi.fn(),
    handleSpace: vi.fn(),
    handleEnter: vi.fn(),
    getFormatState: vi.fn(),
    insertText: vi.fn()
  }))
}));

vi.mock('../../core/services/spellcheck/UnifiedSpellCheckService', () => ({
  UnifiedSpellCheckService: vi.fn().mockImplementation(() => ({
    checkText: vi.fn(),
    getSuggestions: vi.fn(),
    enableSpellCheck: vi.fn(),
    disableSpellCheck: vi.fn(),
    isWordCorrect: vi.fn(),
    batchCheck: vi.fn()
  }))
}));

vi.mock('../../core/services/analysis/UnifiedTextAnalysisService', () => ({
  UnifiedTextAnalysisService: vi.fn().mockImplementation(() => ({
    analyzeText: vi.fn(),
    getWordCount: vi.fn(),
    checkSyntax: vi.fn()
  }))
}));

vi.mock('../../core/services/GrammarCheckService', () => ({
  GrammarCheckService: vi.fn().mockImplementation(() => ({
    checkGrammar: vi.fn()
  }))
}));

vi.mock('../../core/services/ui/AutoSaveService', () => ({
  AutoSaveService: vi.fn().mockImplementation(() => ({
    updateContent: vi.fn(),
    manualSave: vi.fn()
  }))
}));

vi.mock('../../core/services/ui/PerformanceService', () => ({
  PerformanceService: vi.fn().mockImplementation(() => ({
    measurePerformance: vi.fn()
  }))
}));

describe('ServiceFactory (Consolidated)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Unified Service Getters', () => {
    test('should provide UnifiedFormatService', async () => {
      const service = await ServiceFactory.getUnifiedFormatService();
      
      expect(service).toBeDefined();
      expect(service.applyBold).toBeDefined();
      expect(service.handleSpace).toBeDefined();
      expect(service.getFormatState).toBeDefined();
    });

    test('should provide singleton UnifiedFormatService', async () => {
      const service1 = await ServiceFactory.getUnifiedFormatService();
      const service2 = await ServiceFactory.getUnifiedFormatService();
      
      expect(service1).toBe(service2);
    });

    test('should provide UnifiedSpellCheckService', async () => {
      const service = await ServiceFactory.getUnifiedSpellCheckService();
      
      expect(service).toBeDefined();
      expect(service.checkText).toBeDefined();
      expect(service.isWordCorrect).toBeDefined();
      expect(service.batchCheck).toBeDefined();
    });

    test('should provide singleton UnifiedSpellCheckService', async () => {
      const service1 = await ServiceFactory.getUnifiedSpellCheckService();
      const service2 = await ServiceFactory.getUnifiedSpellCheckService();
      
      expect(service1).toBe(service2);
    });

    test('should provide UnifiedTextAnalysisService', async () => {
      const service = await ServiceFactory.getUnifiedTextAnalysisService();
      
      expect(service).toBeDefined();
      expect(service.analyzeText).toBeDefined();
      expect(service.checkSyntax).toBeDefined();
    });

    test('should provide singleton UnifiedTextAnalysisService', async () => {
      const service1 = await ServiceFactory.getUnifiedTextAnalysisService();
      const service2 = await ServiceFactory.getUnifiedTextAnalysisService();
      
      expect(service1).toBe(service2);
    });
  });

  describe('Legacy Compatibility', () => {
    test('should provide legacy TextFormatService method', async () => {
      const service = await ServiceFactory.getTextFormatService();
      
      expect(service).toBeDefined();
      expect(service.applyBold).toBeDefined();
      expect(service.applyItalic).toBeDefined();
      expect(service.applyUnderline).toBeDefined();
    });

    test('should provide legacy SpellCheckService method', async () => {
      const service = await ServiceFactory.getSpellCheckService();
      
      expect(service).toBeDefined();
      expect(service.checkText).toBeDefined();
      expect(service.getSuggestions).toBeDefined();
    });

    test('should return same instance for legacy and new methods', async () => {
      const legacyFormat = await ServiceFactory.getTextFormatService();
      const newFormat = await ServiceFactory.getUnifiedFormatService();
      
      expect(legacyFormat).toBe(newFormat);
      
      const legacySpell = await ServiceFactory.getSpellCheckService();
      const newSpell = await ServiceFactory.getUnifiedSpellCheckService();
      
      expect(legacySpell).toBe(newSpell);
    });
  });

  describe('Existing Services', () => {
    test('should provide FontFormatService', () => {
      const service = ServiceFactory.getFontFormatService();
      
      expect(service).toBeDefined();
    });

    test('should provide LayoutFormatService', () => {
      const service = ServiceFactory.getLayoutFormatService();
      
      expect(service).toBeDefined();
    });

    test('should provide DOMManipulationService', () => {
      const service = ServiceFactory.getDOMManipulationService();
      
      expect(service).toBeDefined();
    });

    test('should provide HistoryService', () => {
      const service = ServiceFactory.getHistoryService();
      
      expect(service).toBeDefined();
    });

    test('should provide SearchService', () => {
      const service = ServiceFactory.getSearchService();
      
      expect(service).toBeDefined();
    });

    test('should provide TextReplacementService', () => {
      const service = ServiceFactory.getTextReplacementService();
      
      expect(service).toBeDefined();
    });
  });

  describe('Converted Singleton Services', () => {


    test('should provide AutoSaveService without singleton pattern', async () => {
      const service = await ServiceFactory.getAutoSaveService();
      
      expect(service).toBeDefined();
      expect(service.updateContent).toBeDefined();
      expect(service.manualSave).toBeDefined();
    });

    test('should provide singleton AutoSaveService', async () => {
      const service1 = await ServiceFactory.getAutoSaveService();
      const service2 = await ServiceFactory.getAutoSaveService();
      
      expect(service1).toBe(service2);
    });

    test('should provide PerformanceService', () => {
      const service = ServiceFactory.getPerformanceService();
      
      expect(service).toBeDefined();
    });

    test('should provide singleton PerformanceService', () => {
      const service1 = ServiceFactory.getPerformanceService();
      const service2 = ServiceFactory.getPerformanceService();
      
      expect(service1).toBe(service2);
    });
  });

  describe('Service Injection for Testing', () => {
    test('should allow UnifiedFormatService injection', async () => {
      const mockService = {
        applyBold: vi.fn(),
        applyItalic: vi.fn(),
        applyUnderline: vi.fn(),
        handleSpace: vi.fn(),
        handleEnter: vi.fn(),
        getFormatState: vi.fn(),
        insertText: vi.fn()
      } as any;
      
      ServiceFactory.setUnifiedFormatService(mockService);
      const service = await ServiceFactory.getUnifiedFormatService();
      
      expect(service).toBe(mockService);
    });

    test('should allow UnifiedSpellCheckService injection', async () => {
      const mockService = {
        checkText: vi.fn(),
        getSuggestions: vi.fn(),
        enableSpellCheck: vi.fn(),
        disableSpellCheck: vi.fn(),
        isWordCorrect: vi.fn(),
        batchCheck: vi.fn()
      } as any;
      
      ServiceFactory.setUnifiedSpellCheckService(mockService);
      const service = await ServiceFactory.getUnifiedSpellCheckService();
      
      expect(service).toBe(mockService);
    });

    test('should allow UnifiedTextAnalysisService injection', async () => {
      const mockService = {
        analyzeText: vi.fn(),
        getWordCount: vi.fn(),
        checkSyntax: vi.fn()
      } as any;
      
      ServiceFactory.setUnifiedTextAnalysisService(mockService);
      const service = await ServiceFactory.getUnifiedTextAnalysisService();
      
      expect(service).toBe(mockService);
    });

    test('should allow legacy service injection', async () => {
      const mockService = {
        applyBold: vi.fn(),
        applyItalic: vi.fn(),
        applyUnderline: vi.fn()
      } as any;
      
      ServiceFactory.setTextFormatService(mockService);
      const service = await ServiceFactory.getTextFormatService();
      
      expect(service).toBe(mockService);
    });
  });

  describe('Service Dependencies', () => {
    test('should handle service dependencies correctly', async () => {
      // Test that services can be retrieved without circular dependencies
      const formatService = await ServiceFactory.getUnifiedFormatService();
      const spellService = await ServiceFactory.getUnifiedSpellCheckService();
      const analysisService = await ServiceFactory.getUnifiedTextAnalysisService();
      const autoSaveService = await ServiceFactory.getAutoSaveService();
      
      expect(formatService).toBeDefined();
      expect(spellService).toBeDefined();
      expect(analysisService).toBeDefined();
      expect(autoSaveService).toBeDefined();
    });
  });
});
