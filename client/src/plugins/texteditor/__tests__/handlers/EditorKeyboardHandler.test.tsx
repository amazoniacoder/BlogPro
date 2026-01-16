/**
 * EditorKeyboardHandler tests
 */

import { renderHook } from '@testing-library/react';
import { useEditorKeyboardHandler } from '../../core/components/handlers/EditorKeyboardHandler';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('EditorKeyboardHandler', () => {
  const mockEditorRef = { current: document.createElement('div') };
  const mockOnChange = vi.fn();
  const mockSetContent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '<div class="editor-content"></div>';
  });

  test('should handle keyboard events', () => {
    const { result } = renderHook(() => 
      useEditorKeyboardHandler({
        editorRef: mockEditorRef,
        onChange: mockOnChange,
        setContent: mockSetContent
      })
    );

    expect(result.current.handleKeyDown).toBeDefined();
    expect(typeof result.current.handleKeyDown).toBe('function');
  });

  test('should process space key events', () => {
    const { result } = renderHook(() => 
      useEditorKeyboardHandler({
        editorRef: mockEditorRef,
        onChange: mockOnChange,
        setContent: mockSetContent
      })
    );

    const mockEvent = {
      key: ' ',
      preventDefault: vi.fn(),
      target: mockEditorRef.current
    } as any;

    // Test that handler can be called without throwing
    expect(() => result.current.handleKeyDown(mockEvent)).not.toThrow();
  });

  test('should process enter key events', () => {
    const { result } = renderHook(() => 
      useEditorKeyboardHandler({
        editorRef: mockEditorRef,
        onChange: mockOnChange,
        setContent: mockSetContent
      })
    );

    const mockEvent = {
      key: 'Enter',
      preventDefault: vi.fn(),
      target: mockEditorRef.current
    } as any;

    // Test that handler can be called without throwing
    expect(() => result.current.handleKeyDown(mockEvent)).not.toThrow();
  });
});
