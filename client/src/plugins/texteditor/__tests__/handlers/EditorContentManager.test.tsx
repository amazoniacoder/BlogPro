/**
 * EditorContentManager tests
 */

import { renderHook } from '@testing-library/react';
import { useEditorContentManager } from '../../core/components/handlers/EditorContentManager';
import { HistoryService } from '../../core/services/HistoryService';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('EditorContentManager', () => {
  const mockEditorRef = { current: document.createElement('div') };
  const mockOnChange = vi.fn();
  const mockSetContent = vi.fn();
  const mockSetError = vi.fn();
  const mockUpdateFormatState = vi.fn();
  const mockHistoryService = new HistoryService();
  const mockIsTypingRef = { current: false };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should handle input events', () => {
    const { result } = renderHook(() => 
      useEditorContentManager({
        editorRef: mockEditorRef,
        initialContent: '<p>Test</p>',
        onChange: mockOnChange,
        setContent: mockSetContent,
        setError: mockSetError,
        updateFormatState: mockUpdateFormatState,
        historyService: mockHistoryService,
        isTypingRef: mockIsTypingRef
      })
    );

    expect(result.current.handleInput).toBeDefined();
    expect(result.current.handleClick).toBeDefined();
  });

  test('should process input changes', () => {
    const { result } = renderHook(() => 
      useEditorContentManager({
        editorRef: mockEditorRef,
        initialContent: '<p>Test</p>',
        onChange: mockOnChange,
        setContent: mockSetContent,
        setError: mockSetError,
        updateFormatState: mockUpdateFormatState,
        historyService: mockHistoryService,
        isTypingRef: mockIsTypingRef
      })
    );

    mockEditorRef.current.innerHTML = '<p>New content</p>';
    const mockEvent = { 
      currentTarget: mockEditorRef.current,
      target: mockEditorRef.current 
    } as any;

    result.current.handleInput(mockEvent);
    expect(mockOnChange).toHaveBeenCalledWith('<p>New content</p>');
  });
});
