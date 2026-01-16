/**
 * Service Integration Tests
 * Tests for cross-service interactions and dependency injection
 */

import { ServiceFactory } from '../../core/services/ServiceFactory';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('Service Integration', () => {
  let formatService: any;

  beforeEach(async () => {
    document.body.innerHTML = '<div class="editor-content"><p>Test content</p></div>';
    formatService = await ServiceFactory.getUnifiedFormatService();
    vi.clearAllMocks();
  });

  test('ServiceFactory provides consistent service instances', async () => {
    const textService1 = await ServiceFactory.getTextFormatService();
    const textService2 = await ServiceFactory.getTextFormatService();
    
    expect(textService1).toBe(textService2);
  });

  test('UnifiedFormatService integrates with ServiceFactory', async () => {
    const mockFormatService = {
      applyBold: vi.fn(),
      applyItalic: vi.fn(),
      applyUnderline: vi.fn(),
      handleSpace: vi.fn(),
      handleEnter: vi.fn(),
      getFormatState: vi.fn(() => ({})),
      insertText: vi.fn(),
      applyFontSize: vi.fn(),
      applyFontFamily: vi.fn(),
      applyTextAlign: vi.fn(),
      applyTextColor: vi.fn(),
      applyBackgroundColor: vi.fn(),
      applyBulletList: vi.fn(),
      applyNumberedList: vi.fn(),
      removeList: vi.fn(),
      applyLink: vi.fn(),
      editLink: vi.fn(),
      removeLink: vi.fn(),
      insertImage: vi.fn(),
      destroy: vi.fn()
    } as any;
    
    ServiceFactory.setUnifiedFormatService(mockFormatService);
    
    const service = await ServiceFactory.getUnifiedFormatService();
    service.applyBold();
    
    expect(mockFormatService.applyBold).toHaveBeenCalled();
  });

  test('Services handle cross-service communication', () => {
    // Test that formatService has font-related methods
    expect(formatService.applyFontSize).toBeDefined();
    expect(formatService.applyFontFamily).toBeDefined();
  });

  test('Service factory maintains interface compliance', async () => {
    const textService = await ServiceFactory.getTextFormatService();
    const fontService = ServiceFactory.getFontFormatService();
    const layoutService = ServiceFactory.getLayoutFormatService();
    
    expect(typeof textService.applyBold).toBe('function');
    expect(typeof fontService.applyFontSize).toBe('function');
    expect(typeof layoutService.applyTextAlign).toBe('function');
  });

  test('Services handle dependency injection correctly', () => {
    // Test that formatService has layout-related methods
    expect(formatService.applyTextAlign).toBeDefined();
    expect(formatService.applyTextColor).toBeDefined();
    expect(formatService.applyBackgroundColor).toBeDefined();
  });
});
