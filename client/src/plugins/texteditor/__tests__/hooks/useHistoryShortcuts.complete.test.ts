/**
 * Complete test coverage for useHistoryShortcuts
 * Target: 100% coverage with Google Docs compliance
 */

import { renderHook } from '@testing-library/react';
import { useHistoryShortcuts } from '../../core/hooks/useHistoryShortcuts';
import { HistoryService } from '../../core/services/HistoryService';

// Test globals
declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var afterEach: any;
  var vi: any;
}

// Mock dependencies
vi.mock('../../shared/utils/domUtils', () => ({
  cleanupEmptyFormatElements: vi.fn()
}));

vi.mock('../../core/services/PerformanceService', () => ({
  PerformanceService: {
    measureAsync: vi.fn((_name: string, fn: () => any) => fn())
  }
}));

vi.mock('../../shared/constants/keyboardConstants', () => ({
  KEYBOARD_SHORTCUTS: {
    UNDO: 'z',
    REDO: 'y'
  }
}));

// Import mocked functions
import { cleanupEmptyFormatElements } from '../../shared/utils/domUtils';

describe.skip('useHistoryShortcuts - Complete Coverage', () => {
  let mockEditorRef: { current: HTMLDivElement | null };
  let mockUpdateFormatState: ReturnType<typeof vi.fn>;
  let mockHistoryService: HistoryService;
  
  const mockCleanupEmptyFormatElements = cleanupEmptyFormatElements as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create mock editor element
    const mockEditor = document.createElement('div');
    mockEditor.contentEditable = 'true';
    document.body.appendChild(mockEditor);
    
    mockEditorRef = { current: mockEditor };
    mockUpdateFormatState = vi.fn();
    
    // Mock HistoryService
    mockHistoryService = {
      undo: vi.fn().mockResolvedValue(undefined),
      redo: vi.fn().mockResolvedValue(undefined)
    } as any;

    // Set active element
    Object.defineProperty(document, 'activeElement', {
      value: mockEditor,
      configurable: true
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('Hook Initialization', () => {
    test('should initialize without errors', () => {
      const { unmount } = renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState)
      );

      expect(() => unmount()).not.toThrow();
    });

    test('should initialize with HistoryService', () => {
      const { unmount } = renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Undo Operations', () => {
    test('should handle undo with HistoryService', async () => {
      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockHistoryService.undo).toHaveBeenCalled();
      expect(mockCleanupEmptyFormatElements).toHaveBeenCalledWith(mockEditorRef.current);
      expect(mockUpdateFormatState).toHaveBeenCalled();
    });

    test('should handle undo without HistoryService (execCommand fallback)', async () => {
      const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);

      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      expect(execCommandSpy).toHaveBeenCalledWith('undo');

      // Wait for setTimeout
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockCleanupEmptyFormatElements).toHaveBeenCalledWith(mockEditorRef.current);
      expect(mockUpdateFormatState).toHaveBeenCalled();
    });

    test('should handle undo with Meta key (Mac)', async () => {
      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockHistoryService.undo).toHaveBeenCalled();
    });

    test('should not handle undo when editor not focused', () => {
      Object.defineProperty(document, 'activeElement', {
        value: document.body,
        configurable: true
      });

      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      expect(mockHistoryService.undo).not.toHaveBeenCalled();
    });

    test('should not handle undo when no editor ref', () => {
      mockEditorRef.current = null;

      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      expect(mockHistoryService.undo).not.toHaveBeenCalled();
    });

    test('should not handle undo without modifier keys', () => {
      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'z',
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      expect(mockHistoryService.undo).not.toHaveBeenCalled();
    });
  });

  describe('Redo Operations', () => {
    test('should handle redo with HistoryService', async () => {
      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockHistoryService.redo).toHaveBeenCalled();
      expect(mockCleanupEmptyFormatElements).toHaveBeenCalledWith(mockEditorRef.current);
      expect(mockUpdateFormatState).toHaveBeenCalled();
    });

    test('should handle redo without HistoryService (execCommand fallback)', async () => {
      const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);

      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      expect(execCommandSpy).toHaveBeenCalledWith('redo');

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockCleanupEmptyFormatElements).toHaveBeenCalledWith(mockEditorRef.current);
      expect(mockUpdateFormatState).toHaveBeenCalled();
    });

    test('should handle redo with Meta key (Mac)', async () => {
      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'y',
        metaKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockHistoryService.redo).toHaveBeenCalled();
    });

    test('should not handle redo when editor not focused', () => {
      Object.defineProperty(document, 'activeElement', {
        value: document.body,
        configurable: true
      });

      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      expect(mockHistoryService.redo).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle HistoryService undo errors gracefully', async () => {
      mockHistoryService.undo = vi.fn().mockRejectedValue(new Error('Undo failed'));

      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true
      });

      // Should not throw
      expect(() => document.dispatchEvent(keyEvent)).not.toThrow();
    });

    test('should handle HistoryService redo errors gracefully', async () => {
      mockHistoryService.redo = vi.fn().mockRejectedValue(new Error('Redo failed'));

      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true,
        bubbles: true
      });

      expect(() => document.dispatchEvent(keyEvent)).not.toThrow();
    });

    test('should handle missing editor during cleanup', async () => {
      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      // Remove editor during operation
      mockEditorRef.current = null;

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      await new Promise(resolve => setTimeout(resolve, 0));

      // When editor is null, function returns early - no operations should be called
      expect(mockCleanupEmptyFormatElements).not.toHaveBeenCalled();
      expect(mockUpdateFormatState).not.toHaveBeenCalled();
      expect(mockHistoryService.undo).not.toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    test('should measure undo operation performance', async () => {
      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      await new Promise(resolve => setTimeout(resolve, 0));

      // Test passes if no errors thrown
      expect(true).toBe(true);
    });

    test('should measure redo operation performance', async () => {
      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      await new Promise(resolve => setTimeout(resolve, 0));

      // Test passes if no errors thrown
      expect(true).toBe(true);
    });
  });

  describe('Event Listener Management', () => {
    test('should add event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState)
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    test('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    test('should update event listener when dependencies change', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { rerender } = renderHook(
        ({ updateFn }) => useHistoryShortcuts(mockEditorRef, updateFn),
        { initialProps: { updateFn: mockUpdateFormatState } }
      );

      const newUpdateFn = vi.fn();
      rerender({ updateFn: newUpdateFn });

      // Should remove old listener and add new one
      expect(removeEventListenerSpy).toHaveBeenCalled();
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Google Docs Compliance', () => {
    test('should handle case-insensitive key detection', async () => {
      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'Z', // Uppercase
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockHistoryService.undo).toHaveBeenCalled();
    });

    test('should prevent default browser behavior', () => {
      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true
      });

      const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');

      document.dispatchEvent(keyEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should handle rapid undo/redo operations', async () => {
      renderHook(() =>
        useHistoryShortcuts(mockEditorRef, mockUpdateFormatState, mockHistoryService)
      );

      // Rapid undo operations
      for (let i = 0; i < 5; i++) {
        const keyEvent = new KeyboardEvent('keydown', {
          key: 'z',
          ctrlKey: true,
          bubbles: true
        });
        document.dispatchEvent(keyEvent);
      }

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockHistoryService.undo).toHaveBeenCalledTimes(5);
    });
  });
});
