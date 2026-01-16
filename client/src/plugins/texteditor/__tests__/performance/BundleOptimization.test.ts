/**
 * Bundle optimization tests
 */

import { ServiceFactory } from '../../core/services/ServiceFactory';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('Bundle Optimization', () => {
  beforeEach(() => {
    ServiceFactory.cleanup();
  });

  test('should lazy load spell check service', async () => {
    const spellCheckService = await ServiceFactory.getUnifiedSpellCheckService();
    expect(spellCheckService).toBeDefined();
    expect(typeof spellCheckService.checkText).toBe('function');
  });



  test('should lazy load auto save service', async () => {
    const autoSaveService = await ServiceFactory.getAutoSaveService();
    expect(autoSaveService).toBeDefined();
    expect(typeof autoSaveService.updateContent).toBe('function');
  });

  test('should handle service loading errors gracefully', async () => {
    // Mock import failure
    const originalImport = (global as any).import;
    (global as any).import = vi.fn().mockRejectedValue(new Error('Import failed'));

    try {
      await ServiceFactory.getUnifiedSpellCheckService();
    } catch (error) {
      expect((error as Error).message).toBe('Import failed');
    }

    // Restore original import
    (global as any).import = originalImport;
  });
});
