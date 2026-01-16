/**
 * FontFormatService tests
 */

import { FontFormatService } from '../../../core/services/formatting/FontFormatService';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('FontFormatService', () => {
  beforeEach(() => {
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

  test('should apply font size', () => {
    FontFormatService.applyFontSize('14pt');
    
    const selection = window.getSelection();
    expect(selection?.getRangeAt).toHaveBeenCalled();
  });

  test('should apply font family', () => {
    FontFormatService.applyFontFamily('Arial');
    
    const selection = window.getSelection();
    expect(selection?.getRangeAt).toHaveBeenCalled();
  });

  test('should get font size from element', () => {
    const element = document.createElement('span');
    element.style.fontSize = '14pt';
    document.body.appendChild(element);

    const fontSize = FontFormatService.getFontSize(element);
    expect(fontSize).toBe('14pt');
  });

  test('should get font family from element', () => {
    const element = document.createElement('span');
    element.style.fontFamily = 'Arial';
    document.body.appendChild(element);

    const fontFamily = FontFormatService.getFontFamily(element);
    expect(fontFamily).toBe('Arial');
  });

  test('should return default font size when none found', () => {
    const element = document.createElement('span');
    document.body.appendChild(element);

    const fontSize = FontFormatService.getFontSize(element);
    expect(fontSize).toBe('12pt');
  });

  test('should return default font family when none found', () => {
    const element = document.createElement('span');
    document.body.appendChild(element);

    const fontFamily = FontFormatService.getFontFamily(element);
    expect(fontFamily).toBe('Arial');
  });
});
