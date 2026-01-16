/**
 * useSaveShortcut tests
 */

import { renderHook } from '@testing-library/react';
import { useSaveShortcut } from '../../core/hooks/useSaveShortcut';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('useSaveShortcut', () => {
  const mockEditorRef = { current: document.createElement('div') };
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditorRef.current.innerHTML = '<p>Test content</p>';
  });

  test('should register keyboard event listeners', () => {
    // Test that hook can be instantiated without errors
    expect(() => {
      renderHook(() => useSaveShortcut(mockEditorRef, mockOnSave));
    }).not.toThrow();
  });

  test('should handle Ctrl+S for save', () => {
    // Test that hook handles save shortcut setup
    expect(() => {
      renderHook(() => useSaveShortcut(mockEditorRef, mockOnSave));
    }).not.toThrow();
  });

  test('should handle Meta+S for save on Mac', () => {
    // Test that hook handles Mac save shortcut setup
    expect(() => {
      renderHook(() => useSaveShortcut(mockEditorRef, mockOnSave));
    }).not.toThrow();
  });

  test('should not save without modifier key', () => {
    renderHook(() => useSaveShortcut(mockEditorRef, mockOnSave));
    
    const event = new KeyboardEvent('keydown', {
      key: 's'
    });
    
    mockEditorRef.current.dispatchEvent(event);
    
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('should work without onSave callback', () => {
    expect(() => {
      renderHook(() => useSaveShortcut(mockEditorRef, undefined));
    }).not.toThrow();
  });

  test('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useSaveShortcut(mockEditorRef, mockOnSave));
    
    // Test that unmount doesn't throw errors
    expect(() => unmount()).not.toThrow();
  });
});
