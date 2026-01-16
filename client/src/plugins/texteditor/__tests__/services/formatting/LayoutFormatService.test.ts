/**
 * LayoutFormatService tests
 */

import { LayoutFormatService } from '../../../core/services/formatting/LayoutFormatService';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('LayoutFormatService', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="editor-content"><p>Test content</p></div>';
    vi.clearAllMocks();
    
    // Mock selection API with proper Range object
    const mockRange = document.createRange();
    Object.defineProperty(mockRange, 'collapsed', { value: false, writable: true });
    Object.defineProperty(mockRange, 'startContainer', { value: document.createElement('p'), writable: true });
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

  test('should apply text alignment', () => {
    LayoutFormatService.applyTextAlign('center');
    
    const selection = window.getSelection();
    expect(selection?.getRangeAt).toHaveBeenCalled();
  });

  test('should apply text color', () => {
    LayoutFormatService.applyTextColor('#ff0000');
    
    const selection = window.getSelection();
    expect(selection?.getRangeAt).toHaveBeenCalled();
  });

  test('should apply background color', () => {
    LayoutFormatService.applyBackgroundColor('#ffff00');
    
    const selection = window.getSelection();
    expect(selection?.getRangeAt).toHaveBeenCalled();
  });

  test('should get text alignment from element', () => {
    const element = document.createElement('p');
    element.style.textAlign = 'center';
    document.body.appendChild(element);

    const textAlign = LayoutFormatService.getTextAlign(element);
    expect(textAlign).toBe('center');
  });

  test('should get text color from element', () => {
    const element = document.createElement('span');
    element.style.color = '#ff0000';
    document.body.appendChild(element);

    const textColor = LayoutFormatService.getTextColor(element);
    expect(textColor).toBe('#ff0000');
  });

  test('should get background color from element', () => {
    const element = document.createElement('span');
    element.style.backgroundColor = '#ffff00';
    document.body.appendChild(element);

    const backgroundColor = LayoutFormatService.getBackgroundColor(element);
    expect(backgroundColor).toBe('#ffff00');
  });

  test('should normalize RGB color to hex', () => {
    const element = document.createElement('span');
    element.style.color = 'rgb(255, 0, 0)';
    document.body.appendChild(element);

    // Mock getComputedStyle to return RGB
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      color: 'rgb(255, 0, 0)'
    } as any);

    const textColor = LayoutFormatService.getTextColor(element);
    expect(textColor).toBe('#ff0000');
  });
});
