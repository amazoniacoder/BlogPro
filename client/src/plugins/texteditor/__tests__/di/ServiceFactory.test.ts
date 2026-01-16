/**
 * ServiceFactory Tests (DI-based)
 */

import { describe, it, expect, afterEach } from 'vitest';
import { ServiceFactory } from '../../core/services/ServiceFactory';

describe('ServiceFactory (DI-based)', () => {
  afterEach(async () => {
    await ServiceFactory.cleanup();
    ServiceFactory.reset();
  });

  describe('Unified Services', () => {
    it('should resolve UnifiedFormatService', async () => {
      const service = await ServiceFactory.getUnifiedFormatService();
      expect(service).toBeDefined();
      expect(typeof service.applyBold).toBe('function');
    });

    it('should resolve UnifiedSpellCheckService', async () => {
      const service = await ServiceFactory.getUnifiedSpellCheckService();
      expect(service).toBeDefined();
      expect(typeof service.checkText).toBe('function');
    });

    it('should resolve UnifiedTextAnalysisService', async () => {
      const service = await ServiceFactory.getUnifiedTextAnalysisService();
      expect(service).toBeDefined();
      expect(typeof service.analyzeText).toBe('function');
    });

    it('should return same singleton instance', async () => {
      const service1 = await ServiceFactory.getUnifiedFormatService();
      const service2 = await ServiceFactory.getUnifiedFormatService();
      expect(service1).toBe(service2);
    });
  });

  describe('Legacy Services', () => {
    it('should resolve legacy services', () => {
      const fontService = ServiceFactory.getFontFormatService();
      const layoutService = ServiceFactory.getLayoutFormatService();
      const listService = ServiceFactory.getListService();

      expect(fontService).toBeDefined();
      expect(layoutService).toBeDefined();
      expect(listService).toBeDefined();
    });

    it('should maintain backward compatibility', async () => {
      const textFormatService = await ServiceFactory.getTextFormatService();
      const spellCheckService = await ServiceFactory.getSpellCheckService();

      expect(textFormatService).toBeDefined();
      expect(spellCheckService).toBeDefined();
    });
  });

  describe('Lifecycle Management', () => {
    it('should cleanup all services', async () => {
      await ServiceFactory.getUnifiedFormatService();
      await ServiceFactory.getUnifiedSpellCheckService();

      await ServiceFactory.cleanup();
      
      // After cleanup, should create new instances
      const service1 = await ServiceFactory.getUnifiedFormatService();
      const service2 = await ServiceFactory.getUnifiedFormatService();
      expect(service1).toBe(service2); // Still singleton behavior
    });
  });

  describe('Testing Utilities', () => {
    it('should reset factory state', async () => {
      await ServiceFactory.getUnifiedFormatService();
      ServiceFactory.reset();
      
      // Should be able to get services again after reset
      const service = await ServiceFactory.getUnifiedFormatService();
      expect(service).toBeDefined();
    });
  });
});
