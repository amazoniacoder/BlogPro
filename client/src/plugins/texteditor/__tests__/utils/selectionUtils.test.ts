/**
 * selectionUtils tests
 * Tests for enhanced selection management utilities
 */

import {
  getCurrentSelection,
  getSelectionState,
  getSelectionDirection,
  setCursorPosition,
  setSelectionRange,
  getSelectionBounds,
  isSelectionInElement,
  getSelectionText,
  clearSelection
} from '../../shared/utils/selectionUtils';

// Test globals
declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('selectionUtils', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="editor-content"><p>Test content for selection</p></div>';
  });

  describe('getCurrentSelection', () => {
    test('should return selection info when selection exists', () => {
      const p = document.querySelector('p')!;
      const textNode = p.firstChild!;
      
      const mockRange = {
        startContainer: textNode,
        endContainer: textNode,
        startOffset: 0,
        endOffset: 4,
        toString: () => 'Test'
      };

      const mockSelection = {
        rangeCount: 1,
        isCollapsed: false,
        getRangeAt: () => mockRange
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = getCurrentSelection();

      expect(result).toBeTruthy();
      expect(result?.isCollapsed).toBe(false);
      expect(result?.text).toBe('Test');
      expect(result?.startOffset).toBe(0);
      expect(result?.endOffset).toBe(4);
    });

    test('should return null when no selection exists', () => {
      vi.spyOn(window, 'getSelection').mockReturnValue(null);

      const result = getCurrentSelection();

      expect(result).toBeNull();
    });

    test('should return null when selection has no ranges', () => {
      const mockSelection = {
        rangeCount: 0
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = getCurrentSelection();

      expect(result).toBeNull();
    });

    test('should handle errors gracefully', () => {
      vi.spyOn(window, 'getSelection').mockImplementation(() => {
        throw new Error('Selection error');
      });

      const result = getCurrentSelection();

      expect(result).toBeNull();
    });
  });

  describe('getSelectionState', () => {
    test('should convert selection to SelectionState', () => {
      const p = document.querySelector('p')!;
      const textNode = p.firstChild!;
      
      const mockRange = {
        startOffset: 0,
        endOffset: 4
      };

      const mockSelection = {
        rangeCount: 1,
        isCollapsed: false,
        anchorNode: textNode,
        focusNode: textNode,
        anchorOffset: 0,
        focusOffset: 4,
        getRangeAt: () => mockRange
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = getSelectionState();

      expect(result).toBeTruthy();
      expect(result?.start).toBe(0);
      expect(result?.end).toBe(4);
      expect(result?.isCollapsed).toBe(false);
      expect(result?.anchorNode).toBe(textNode);
      expect(result?.focusNode).toBe(textNode);
    });

    test('should handle errors gracefully', () => {
      vi.spyOn(window, 'getSelection').mockImplementation(() => {
        throw new Error('Selection error');
      });

      const result = getSelectionState();

      expect(result).toBeNull();
    });
  });

  describe('getSelectionDirection', () => {
    test('should return none for collapsed selection', () => {
      const mockSelection = {
        isCollapsed: true
      };

      const result = getSelectionDirection(mockSelection as any);

      expect(result).toBe('none');
    });

    test('should return forward for forward selection', () => {
      const textNode = document.createTextNode('test');
      
      const mockSelection = {
        isCollapsed: false,
        anchorNode: textNode,
        focusNode: textNode,
        anchorOffset: 0,
        focusOffset: 4
      };

      // Mock compareDocumentPosition to return 0 (same node)
      vi.spyOn(textNode, 'compareDocumentPosition').mockReturnValue(0);

      const result = getSelectionDirection(mockSelection as any);

      expect(result).toBe('forward');
    });

    test('should return backward for backward selection', () => {
      const textNode = document.createTextNode('test');
      
      const mockSelection = {
        isCollapsed: false,
        anchorNode: textNode,
        focusNode: textNode,
        anchorOffset: 4,
        focusOffset: 0
      };

      // Mock compareDocumentPosition to return 0 (same node)
      vi.spyOn(textNode, 'compareDocumentPosition').mockReturnValue(0);

      const result = getSelectionDirection(mockSelection as any);

      expect(result).toBe('backward');
    });
  });

  describe('setCursorPosition', () => {
    test('should set cursor position successfully', () => {
      const p = document.querySelector('p')!;
      const textNode = p.firstChild!;
      
      const mockRange = {
        setStart: vi.fn(),
        collapse: vi.fn()
      };

      const mockSelection = {
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      };

      vi.spyOn(document, 'createRange').mockReturnValue(mockRange as any);
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = setCursorPosition(textNode, 2);

      expect(result).toBe(true);
      expect(mockRange.setStart).toHaveBeenCalledWith(textNode, 2);
      expect(mockRange.collapse).toHaveBeenCalledWith(true);
      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
      expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
    });

    test('should validate offset bounds for text node', () => {
      const textNode = document.createTextNode('test');
      
      const mockRange = {
        setStart: vi.fn(),
        collapse: vi.fn()
      };

      const mockSelection = {
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      };

      vi.spyOn(document, 'createRange').mockReturnValue(mockRange as any);
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      // Try to set position beyond text length
      setCursorPosition(textNode, 10);

      // Should clamp to text length (4)
      expect(mockRange.setStart).toHaveBeenCalledWith(textNode, 4);
    });

    test('should return false when no selection available', () => {
      vi.spyOn(window, 'getSelection').mockReturnValue(null);

      const result = setCursorPosition(document.createTextNode('test'), 0);

      expect(result).toBe(false);
    });

    test('should handle errors gracefully', () => {
      vi.spyOn(window, 'getSelection').mockImplementation(() => {
        throw new Error('Selection error');
      });

      const result = setCursorPosition(document.createTextNode('test'), 0);

      expect(result).toBe(false);
    });
  });

  describe('setSelectionRange', () => {
    test('should set selection range successfully', () => {
      const textNode = document.createTextNode('test content');
      
      const mockRange = {
        setStart: vi.fn(),
        setEnd: vi.fn()
      };

      const mockSelection = {
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      };

      vi.spyOn(document, 'createRange').mockReturnValue(mockRange as any);
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = setSelectionRange(textNode, 0, textNode, 4);

      expect(result).toBe(true);
      expect(mockRange.setStart).toHaveBeenCalledWith(textNode, 0);
      expect(mockRange.setEnd).toHaveBeenCalledWith(textNode, 4);
      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
      expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
    });

    test('should validate offset bounds', () => {
      const textNode = document.createTextNode('test');
      
      const mockRange = {
        setStart: vi.fn(),
        setEnd: vi.fn()
      };

      const mockSelection = {
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      };

      vi.spyOn(document, 'createRange').mockReturnValue(mockRange as any);
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      // Try to set range beyond text bounds
      setSelectionRange(textNode, -1, textNode, 10);

      // Should clamp to valid bounds
      expect(mockRange.setStart).toHaveBeenCalledWith(textNode, 0);
      expect(mockRange.setEnd).toHaveBeenCalledWith(textNode, 4);
    });

    test('should return false on error', () => {
      vi.spyOn(window, 'getSelection').mockImplementation(() => {
        throw new Error('Selection error');
      });

      const result = setSelectionRange(
        document.createTextNode('test'), 0,
        document.createTextNode('test'), 4
      );

      expect(result).toBe(false);
    });
  });

  describe('getSelectionBounds', () => {
    test('should return selection bounds', () => {
      const mockRect = {
        top: 10,
        left: 20,
        width: 100,
        height: 20
      };

      const mockRange = {
        getBoundingClientRect: () => mockRect
      };

      const mockSelection = {
        rangeCount: 1,
        getRangeAt: () => mockRange
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = getSelectionBounds();

      expect(result).toEqual({
        top: 10,
        left: 20,
        width: 100,
        height: 20
      });
    });

    test('should return null when no selection', () => {
      vi.spyOn(window, 'getSelection').mockReturnValue(null);

      const result = getSelectionBounds();

      expect(result).toBeNull();
    });
  });

  describe('isSelectionInElement', () => {
    test('should return true when selection is in element', () => {
      const container = document.querySelector('.editor-content')!;
      const textNode = container.querySelector('p')!.firstChild!;
      
      const mockRange = {
        commonAncestorContainer: textNode
      };

      const mockSelection = {
        rangeCount: 1,
        getRangeAt: () => mockRange
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = isSelectionInElement(container);

      expect(result).toBe(true);
    });

    test('should return false when selection is outside element', () => {
      const container = document.createElement('div');
      const outsideNode = document.createTextNode('outside');
      
      const mockRange = {
        commonAncestorContainer: outsideNode
      };

      const mockSelection = {
        rangeCount: 1,
        getRangeAt: () => mockRange
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = isSelectionInElement(container);

      expect(result).toBe(false);
    });
  });

  describe('getSelectionText', () => {
    test('should return selected text', () => {
      const mockSelection = {
        toString: () => 'selected text'
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = getSelectionText();

      expect(result).toBe('selected text');
    });

    test('should return empty string when no selection', () => {
      vi.spyOn(window, 'getSelection').mockReturnValue(null);

      const result = getSelectionText();

      expect(result).toBe('');
    });

    test('should handle errors gracefully', () => {
      vi.spyOn(window, 'getSelection').mockImplementation(() => {
        throw new Error('Selection error');
      });

      const result = getSelectionText();

      expect(result).toBe('');
    });
  });

  describe('clearSelection', () => {
    test('should clear selection', () => {
      const mockSelection = {
        removeAllRanges: vi.fn()
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      clearSelection();

      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
    });

    test('should handle null selection gracefully', () => {
      vi.spyOn(window, 'getSelection').mockReturnValue(null);

      // Should not throw
      expect(() => clearSelection()).not.toThrow();
    });

    test('should handle errors gracefully', () => {
      vi.spyOn(window, 'getSelection').mockImplementation(() => {
        throw new Error('Selection error');
      });

      // Should not throw
      expect(() => clearSelection()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should work with mocked DOM elements', () => {
      const p = document.querySelector('p')!;
      
      // Test with mocked selection
      const mockSelection = {
        rangeCount: 1,
        isCollapsed: false,
        getRangeAt: () => ({
          startOffset: 0,
          endOffset: 4,
          toString: () => 'Test'
        }),
        anchorNode: p.firstChild,
        focusNode: p.firstChild
      };
      
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);
      
      const selectionInfo = getCurrentSelection();
      expect(selectionInfo?.text).toBe('Test');
      
      const selectionState = getSelectionState();
      expect(selectionState?.start).toBe(0);
      expect(selectionState?.end).toBe(4);
    });
  });
});
