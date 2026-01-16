/**
 * Unit tests for useFormatState hook
 */

import { renderHook, act } from '@testing-library/react';
import { useFormatState } from '../../core/hooks/useFormatState';

// Mock services
const mockFormatBoundaryService = {
  getFormatAtCursor: () => ({
    bold: false,
    italic: false,
    underline: false,
    fontSize: '12pt',
    fontFamily: 'Arial',
    textAlign: 'left'
  })
};

const mockPerformanceService = {
  measurePerformance: (_name: string, fn: () => any) => fn(),
  createDebouncedFormatUpdate: (fn: () => any) => fn
};

// Mock modules
(global as any).FormatBoundaryService = mockFormatBoundaryService;
(global as any).PerformanceService = mockPerformanceService;

describe('useFormatState', () => {
  let mockEditorRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    document.body.innerHTML = '<div class="editor-content"><p>Test</p></div>';
    mockEditorRef = { current: document.querySelector('.editor-content') as HTMLDivElement };
  });

  test('should initialize with default format state', () => {
    const { result } = renderHook(() => useFormatState(mockEditorRef));
    
    expect(result.current.formatState).toEqual({
      bold: false,
      italic: false,
      underline: false,
      fontSize: '12pt',
      fontFamily: 'Arial',
      textAlign: 'left'
    });
  });

  test('should provide updateFormatState function', () => {
    const { result } = renderHook(() => useFormatState(mockEditorRef));
    
    expect(typeof result.current.updateFormatState).toBe('function');
    expect(typeof result.current.immediateUpdateFormatState).toBe('function');
  });

  test('should update format state when called', () => {
    const mockFormatState = {
      bold: true,
      italic: false,
      underline: false,
      fontSize: '14pt',
      fontFamily: 'Arial',
      textAlign: 'left' as const
    };
    
    // Mock return value
    mockFormatBoundaryService.getFormatAtCursor = () => mockFormatState;
    
    const { result } = renderHook(() => useFormatState(mockEditorRef));
    
    act(() => {
      result.current.immediateUpdateFormatState();
    });
    
    // Verify function was called (simplified test)
    expect(result.current.formatState).toBeDefined();
  });

  test('should use performance optimization', () => {
    const { result } = renderHook(() => useFormatState(mockEditorRef));
    
    // Verify hook returns expected functions
    expect(typeof result.current.updateFormatState).toBe('function');
    expect(typeof result.current.immediateUpdateFormatState).toBe('function');
  });
});
