/**
 * ServiceFactory tests (Updated for Consolidated Architecture)
 */

import { ServiceFactory } from '../../core/services/ServiceFactory';
import { FontFormatService } from '../../core/services/formatting/FontFormatService';
import { LayoutFormatService } from '../../core/services/formatting/LayoutFormatService';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('ServiceFactory (Consolidated Architecture)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unified Services', () => {
    test('should provide UnifiedFormatService', async () => {
      const service = await ServiceFactory.getUnifiedFormatService();
      expect(service).toBeDefined();
      expect(service.applyBold).toBeDefined();
      expect(service.handleSpace).toBeDefined();
      expect(service.getFormatState).toBeDefined();
    });

    test('should provide UnifiedSpellCheckService', async () => {
      const service = await ServiceFactory.getUnifiedSpellCheckService();
      expect(service).toBeDefined();
      expect(service.checkText).toBeDefined();
      expect(service.isWordCorrect).toBeDefined();
    });

    test('should provide UnifiedTextAnalysisService', async () => {
      const service = await ServiceFactory.getUnifiedTextAnalysisService();
      expect(service).toBeDefined();
      expect(service.analyzeText).toBeDefined();
      expect(service.getWordCount).toBeDefined();
    });

    test('should provide singleton unified services', async () => {
      const service1 = await ServiceFactory.getUnifiedFormatService();
      const service2 = await ServiceFactory.getUnifiedFormatService();
      expect(service1).toBe(service2);
    });
  });

  describe('Legacy Compatibility', () => {
    test('should provide TextFormatService (legacy)', async () => {
      const service = await ServiceFactory.getTextFormatService();
      expect(service).toBeDefined();
      expect(service.applyBold).toBeDefined();
    });

    test('should return same instance for legacy and new methods', async () => {
      const legacyService = await ServiceFactory.getTextFormatService();
      const newService = await ServiceFactory.getUnifiedFormatService();
      expect(legacyService).toBe(newService);
    });
  });

  describe('Existing Services', () => {
    test('should provide FontFormatService', () => {
      const service = ServiceFactory.getFontFormatService();
      expect(service).toBe(FontFormatService);
    });

    test('should provide LayoutFormatService', () => {
      const service = ServiceFactory.getLayoutFormatService();
      expect(service).toBe(LayoutFormatService);
    });

    test('should provide AutoSaveService', async () => {
      const service = await ServiceFactory.getAutoSaveService();
      expect(service).toBeDefined();
      expect(service.updateContent).toBeDefined();
    });
  });

  describe('Service Injection', () => {
    test('should allow unified format service injection', async () => {
      const mockService = {
        applyBold: vi.fn(),
        applyItalic: vi.fn(),
        applyUnderline: vi.fn(),
        handleSpace: vi.fn(),
        getFormatState: vi.fn()
      };

      ServiceFactory.setUnifiedFormatService(mockService as any);
      const service = await ServiceFactory.getUnifiedFormatService();
      
      expect(service).toBe(mockService);
    });

    test('should allow unified spell check service injection', async () => {
      const mockService = {
        checkText: vi.fn(),
        getSuggestions: vi.fn(),
        isWordCorrect: vi.fn()
      };

      ServiceFactory.setUnifiedSpellCheckService(mockService as any);
      const service = await ServiceFactory.getUnifiedSpellCheckService();
      
      expect(service).toBe(mockService);
    });

    test('should allow legacy service injection', async () => {
      const mockService = {
        applyBold: vi.fn(),
        applyItalic: vi.fn(),
        applyUnderline: vi.fn()
      };

      ServiceFactory.setTextFormatService(mockService as any);
      const service = await ServiceFactory.getTextFormatService();
      
      expect(service).toBe(mockService);
    });
  });
});
