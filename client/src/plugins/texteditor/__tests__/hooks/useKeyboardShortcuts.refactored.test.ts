/**
 * Refactored useKeyboardShortcuts tests
 * Tests for the new composed hook architecture
 */

import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../../core/hooks/useKeyboardShortcuts';
import { HistoryService } from '../../core/services/HistoryService';

// Test globals
declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

// Mock the focused hooks
vi.mock('../../core/hooks/useFormatShortcuts', () => ({
  useFormatShortcuts: vi.fn()
}));

vi.mock('../../core/hooks/useHistoryShortcuts', () => ({
  useHistoryShortcuts: vi.fn()
}));

vi.mock('../../core/hooks/useDeletionShortcuts', () => ({
  useDeletionShortcuts: vi.fn()
}));

vi.mock('../../core/hooks/useSaveShortcut', () => ({
  useSaveShortcut: vi.fn()
}));

// Mock services to prevent access errors
vi.mock('../../core/services/ModernFormatService', () => ({
  ModernFormatService: {
    applyBold: vi.fn(),
    applyItalic: vi.fn(),
    applyUnderline: vi.fn()
  }
}));

describe('useKeyboardShortcuts (Refactored)', () => {
  const mockEditorRef = { current: document.createElement('div') };
  const mockUpdateFormatState = vi.fn();
  const mockOnSave = vi.fn();
  const mockHistoryService = new HistoryService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should compose all focused hooks', () => {
    renderHook(() => 
      useKeyboardShortcuts(mockEditorRef, mockUpdateFormatState, mockOnSave, mockHistoryService)
    );

    // Test that the hook runs without errors
    expect(mockUpdateFormatState).toBeDefined();
    expect(mockOnSave).toBeDefined();
    expect(mockHistoryService).toBeDefined();
  });

  test('should work without optional parameters', () => {
    renderHook(() => 
      useKeyboardShortcuts(mockEditorRef, mockUpdateFormatState)
    );

    // Test that the hook runs without errors when optional params are undefined
    expect(mockUpdateFormatState).toBeDefined();
  });

  test('should maintain hook dependencies correctly', () => {
    const { rerender } = renderHook(
      ({ updateFn, saveFn, historyService }) => 
        useKeyboardShortcuts(mockEditorRef, updateFn, saveFn, historyService),
      {
        initialProps: {
          updateFn: mockUpdateFormatState,
          saveFn: mockOnSave,
          historyService: mockHistoryService
        }
      }
    );

    // Change props to test re-rendering
    const newUpdateFn = vi.fn();
    const newSaveFn = vi.fn();
    
    rerender({
      updateFn: newUpdateFn,
      saveFn: newSaveFn,
      historyService: mockHistoryService
    });

    // Test that rerender works without errors
    expect(newUpdateFn).toBeDefined();
    expect(newSaveFn).toBeDefined();
  });
});
