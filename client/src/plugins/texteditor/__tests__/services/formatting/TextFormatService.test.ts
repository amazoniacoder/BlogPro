/**
 * TextFormatService tests (Legacy - now part of UnifiedFormatService)
 * 
 * Note: TextFormatService functionality is now consolidated into UnifiedFormatService.
 * These tests verify the legacy service still works for backward compatibility.
 */

import { ServiceFactory } from '../../../core/services/ServiceFactory';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('TextFormatService (Legacy via ServiceFactory)', () => {
  let textFormatService: any;

  beforeEach(() => {
    textFormatService = ServiceFactory.getTextFormatService();
    document.body.innerHTML = '<div class="editor-content"><p>Test content</p></div>';
    vi.clearAllMocks();
    
    // Mock selection API with proper Range object
    const mockRange = document.createRange();
    Object.defineProperty(mockRange, 'collapsed', { value: false, writable: true });
    Object.defineProperty(mockRange, 'surroundContents', { value: vi.fn(), writable: true });
    Object.defineProperty(mockRange, 'extractContents', { value: vi.fn().mockReturnValue(document.createDocumentFragment()), writable: true });
    Object.defineProperty(mockRange, 'insertNode', { value: vi.fn(), writable: true });
    Object.defineProperty(mockRange, 'deleteContents', { value: vi.fn(), writable: true });

    const mockSelection = {
      rangeCount: 1,
      getRangeAt: vi.fn().mockReturnValue(mockRange),
      removeAllRanges: vi.fn(),
      addRange: vi.fn()
    };

    vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);
  });

  test('should apply bold formatting via unified service', () => {
    textFormatService.applyBold();
    
    const selection = window.getSelection();
    expect(selection?.getRangeAt).toHaveBeenCalled();
  });

  test('should apply italic formatting via unified service', () => {
    textFormatService.applyItalic();
    
    const selection = window.getSelection();
    expect(selection?.getRangeAt).toHaveBeenCalled();
  });

  test('should apply underline formatting via unified service', () => {
    textFormatService.applyUnderline();
    
    const selection = window.getSelection();
    expect(selection?.getRangeAt).toHaveBeenCalled();
  });

  test('should have unified service methods available', () => {
    expect(textFormatService.applyBold).toBeDefined();
    expect(textFormatService.applyItalic).toBeDefined();
    expect(textFormatService.applyUnderline).toBeDefined();
    expect(textFormatService.handleSpace).toBeDefined(); // New unified method
    expect(textFormatService.getFormatState).toBeDefined(); // New unified method
  });

  test('should be same instance as unified format service', () => {
    const unifiedService = ServiceFactory.getUnifiedFormatService();
    expect(textFormatService).toBe(unifiedService);
  });
});
