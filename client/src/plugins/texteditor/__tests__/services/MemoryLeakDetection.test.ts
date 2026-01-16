/**
 * Memory leak detection tests for service cleanup
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

describe('Memory Leak Detection', () => {
  beforeEach(() => {
    // Reset ServiceFactory state
    ServiceFactory.cleanup();
  });

  afterEach(() => {
    // Cleanup after each test
    ServiceFactory.cleanup();
  });

  test('should cleanup all singleton services', () => {
    // Initialize services
    const formatService = ServiceFactory.getUnifiedFormatService();
    const spellCheckService = ServiceFactory.getUnifiedSpellCheckService();
    const textAnalysisService = ServiceFactory.getUnifiedTextAnalysisService();

    expect(formatService).toBeDefined();
    expect(spellCheckService).toBeDefined();
    expect(textAnalysisService).toBeDefined();

    // Cleanup
    ServiceFactory.cleanup();

    // Verify new instances are created after cleanup
    const newFormatService = ServiceFactory.getUnifiedFormatService();
    expect(newFormatService).not.toBe(formatService);
  });

  test('should call destroy on all services during cleanup', () => {
    const mockDestroy = vi.fn();
    
    // Mock service with destroy method
    const mockService = {
      destroy: mockDestroy,
      applyBold: vi.fn(),
      getFormatState: vi.fn()
    };

    ServiceFactory.setUnifiedFormatService(mockService as any);
    ServiceFactory.cleanup();

    expect(mockDestroy).toHaveBeenCalled();
  });

  test('should handle cleanup when services are not initialized', () => {
    // Should not throw when cleaning up uninitialized services
    expect(() => ServiceFactory.cleanup()).not.toThrow();
  });
});
