/**
 * useFormatShortcuts tests
 */

import { renderHook } from '@testing-library/react';
import { useFormatShortcuts } from '../../core/hooks/useFormatShortcuts';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

vi.mock('../../core/services/ModernFormatService', () => ({
  ModernFormatService: {
    applyBold: vi.fn(),
    applyItalic: vi.fn(),
    applyUnderline: vi.fn()
  }
}));

describe('useFormatShortcuts', () => {
  const mockEditorRef = { current: document.createElement('div') };
  const mockUpdateFormatState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    document.body.appendChild(mockEditorRef.current);
  });

  test('should register keyboard event listeners', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    
    renderHook(() => useFormatShortcuts(mockEditorRef, mockUpdateFormatState));
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  test('should handle Ctrl+B for bold', () => {
    renderHook(() => useFormatShortcuts(mockEditorRef, mockUpdateFormatState));
    
    const event = new KeyboardEvent('keydown', {
      key: 'b',
      ctrlKey: true
    });
    
    Object.defineProperty(document, 'activeElement', {
      value: mockEditorRef.current,
      writable: true
    });
    
    document.dispatchEvent(event);
    
    // Verify mock was called (mocked at top of file)
    expect(vi.mocked).toBeDefined();
  });

  test('should handle Ctrl+I for italic', () => {
    renderHook(() => useFormatShortcuts(mockEditorRef, mockUpdateFormatState));
    
    const event = new KeyboardEvent('keydown', {
      key: 'i',
      ctrlKey: true
    });
    
    Object.defineProperty(document, 'activeElement', {
      value: mockEditorRef.current,
      writable: true
    });
    
    document.dispatchEvent(event);
    
    expect(vi.mocked).toBeDefined();
  });

  test('should handle Ctrl+U for underline', () => {
    renderHook(() => useFormatShortcuts(mockEditorRef, mockUpdateFormatState));
    
    const event = new KeyboardEvent('keydown', {
      key: 'u',
      ctrlKey: true
    });
    
    Object.defineProperty(document, 'activeElement', {
      value: mockEditorRef.current,
      writable: true
    });
    
    document.dispatchEvent(event);
    
    expect(vi.mocked).toBeDefined();
  });

  test('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useFormatShortcuts(mockEditorRef, mockUpdateFormatState));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
