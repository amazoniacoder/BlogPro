/**
 * EditorPasteHandler tests
 */

import { renderHook } from '@testing-library/react';
import { useEditorPasteHandler } from '../../core/components/handlers/EditorPasteHandler';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('EditorPasteHandler', () => {
  const mockEditorRef = { current: document.createElement('div') };
  const mockUpdateFormatState = vi.fn();
  const mockOnChange = vi.fn();
  const mockSetContent = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should handle paste events', () => {
    const { result } = renderHook(() => 
      useEditorPasteHandler({
        updateFormatState: mockUpdateFormatState,
        onChange: mockOnChange,
        setContent: mockSetContent,
        setError: mockSetError,
        editorRef: mockEditorRef
      })
    );

    expect(result.current.handlePaste).toBeDefined();
    expect(typeof result.current.handlePaste).toBe('function');
  });

  test('should process clipboard data', () => {
    const { result } = renderHook(() => 
      useEditorPasteHandler({
        updateFormatState: mockUpdateFormatState,
        onChange: mockOnChange,
        setContent: mockSetContent,
        setError: mockSetError,
        editorRef: mockEditorRef
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
      clipboardData: {
        getData: vi.fn().mockReturnValue('<p>Test content</p>')
      }
    } as any;

    result.current.handlePaste(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });
});
