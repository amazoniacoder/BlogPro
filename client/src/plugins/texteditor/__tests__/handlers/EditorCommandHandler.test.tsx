/**
 * EditorCommandHandler tests
 */

import { renderHook } from '@testing-library/react';
import { useEditorCommandHandler } from '../../core/components/handlers/EditorCommandHandler';
import { HistoryService } from '../../core/services/HistoryService';

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

describe('EditorCommandHandler', () => {
  const mockEditorRef = { current: document.createElement('div') };
  const mockHistoryService = new HistoryService();
  const mockUpdateFormatState = vi.fn();
  const mockOnChange = vi.fn();
  const mockOnSave = vi.fn();
  const mockSetContent = vi.fn();
  const mockSetError = vi.fn();
  const mockSetIsLoading = vi.fn();
  const mockSetIsFullscreen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should handle command execution', () => {
    const { result } = renderHook(() => 
      useEditorCommandHandler({
        editorRef: mockEditorRef,
        historyService: mockHistoryService,
        updateFormatState: mockUpdateFormatState,
        onChange: mockOnChange,
        onSave: mockOnSave,
        setContent: mockSetContent,
        setError: mockSetError,
        setIsLoading: mockSetIsLoading,
        setIsFullscreen: mockSetIsFullscreen,
        isFullscreen: false
      })
    );

    expect(result.current.execCommand).toBeDefined();
    expect(result.current.handleSave).toBeDefined();
  });

  test('should execute format commands', () => {
    const { result } = renderHook(() => 
      useEditorCommandHandler({
        editorRef: mockEditorRef,
        historyService: mockHistoryService,
        updateFormatState: mockUpdateFormatState,
        onChange: mockOnChange,
        onSave: mockOnSave,
        setContent: mockSetContent,
        setError: mockSetError,
        setIsLoading: mockSetIsLoading,
        setIsFullscreen: mockSetIsFullscreen,
        isFullscreen: false
      })
    );

    // Test that execCommand function exists and can be called
    expect(() => result.current.execCommand('bold')).not.toThrow();
  });
});
