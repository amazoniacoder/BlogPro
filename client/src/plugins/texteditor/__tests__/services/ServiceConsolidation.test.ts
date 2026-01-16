/**
 * Service consolidation tests
 */

import { ServiceFactory } from '../../core/services/ServiceFactory';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
}

describe('Service Consolidation', () => {
  beforeEach(() => {
    ServiceFactory.cleanup();
    document.body.innerHTML = '<div class="editor-content"><p>Test content</p></div>';
  });

  describe('UnifiedFormatService', () => {
    test('should provide all formatting functionality', async () => {
      const service = await ServiceFactory.getUnifiedFormatService();
      
      expect(service.applyBold).toBeDefined();
      expect(service.applyFontSize).toBeDefined();
      expect(service.applyTextAlign).toBeDefined();
      expect(service.getFormatState).toBeDefined();
    });

    test('should be singleton', async () => {
      const service1 = await ServiceFactory.getUnifiedFormatService();
      const service2 = await ServiceFactory.getUnifiedFormatService();
      expect(service1).toBe(service2);
    });

    test('should handle format state detection', async () => {
      const service = await ServiceFactory.getUnifiedFormatService();
      const formatState = service.getFormatState();
      
      expect(formatState).toBeDefined();
      expect(typeof formatState.bold).toBe('boolean');
      expect(typeof formatState.italic).toBe('boolean');
    });
  });

  describe('UnifiedTextAnalysisService', () => {
    test('should provide all analysis functionality', async () => {
      const service = await ServiceFactory.getUnifiedTextAnalysisService();
      
      expect(service.analyzeText).toBeDefined();
      expect(service.getWordCount).toBeDefined();
      expect(service.getCharacterCount).toBeDefined();
      expect(service.clearCache).toBeDefined();
    });

    test('should analyze text correctly', async () => {
      const service = await ServiceFactory.getUnifiedTextAnalysisService();
      const text = 'Hello world. This is a test.';
      
      const wordCount = service.getWordCount(text);
      const charCount = service.getCharacterCount(text);
      const sentenceCount = service.getSentenceCount(text);
      
      expect(wordCount).toBe(6);
      expect(charCount).toBe(28);
      expect(sentenceCount).toBe(2);
    });

    test('should cache analysis results', async () => {
      const service = await ServiceFactory.getUnifiedTextAnalysisService();
      const text = 'Test content';
      
      service.analyzeText(text);
      const stats = service.getCacheStats();
      
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.maxSize).toBe(100);
    });
  });

  describe('Service Integration', () => {
    test('should cleanup consolidated services', async () => {
      const formatService = await ServiceFactory.getUnifiedFormatService();
      const analysisService = await ServiceFactory.getUnifiedTextAnalysisService();
      
      expect(formatService).toBeDefined();
      expect(analysisService).toBeDefined();
      
      await ServiceFactory.cleanup();
      
      // Should create new instances after cleanup
      const newFormatService = await ServiceFactory.getUnifiedFormatService();
      expect(newFormatService).not.toBe(formatService);
    });
  });
});
