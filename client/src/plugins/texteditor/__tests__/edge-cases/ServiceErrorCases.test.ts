/**
 * Service Error Cases Tests
 * Tests for error handling in service layer
 */

import { HistoryService } from '../../core/services/HistoryService';
import { ServiceFactory } from '../../core/services/ServiceFactory';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('Service Error Cases', () => {
  let formatService: any;

  beforeEach(() => {
    document.body.innerHTML = '<div class="editor-content"><p>Test content</p></div>';
    formatService = ServiceFactory.getUnifiedFormatService();
    vi.clearAllMocks();
  });

  test('UnifiedFormatService handles null selection', () => {
    vi.spyOn(window, 'getSelection').mockReturnValue(null);
    
    expect(() => {
      formatService.applyBold();
    }).not.toThrow();
  });

  test('UnifiedFormatService handles invalid range', () => {
    const mockSelection = {
      rangeCount: 0,
      getRangeAt: vi.fn(),
      removeAllRanges: vi.fn(),
      addRange: vi.fn()
    };
    
    vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);
    
    expect(() => {
      formatService.applyItalic();
    }).not.toThrow();
  });

  test('HistoryService handles empty content', () => {
    const historyService = new HistoryService();
    
    expect(() => {
      historyService.saveState('');
    }).not.toThrow();
  });

  test('HistoryService handles invalid undo', () => {
    const historyService = new HistoryService();
    
    expect(() => {
      historyService.undoContent();
    }).not.toThrow();
  });

  test('UnifiedFormatService handles malformed DOM', () => {
    document.body.innerHTML = '<div>Invalid structure</div>';
    
    expect(() => {
      formatService.getFormatState();
    }).not.toThrow();
  });
});
