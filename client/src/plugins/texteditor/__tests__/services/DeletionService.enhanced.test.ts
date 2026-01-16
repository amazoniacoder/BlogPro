/**
 * Enhanced DeletionService tests
 * Tests aligned with actual service architecture and logic
 */

import { DeletionService } from '../../core/services/DeletionService';

// Test globals
declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

// Mock dependencies
vi.mock('../../utils/selectionUtils', () => ({
  getSelectionState: vi.fn()
}));

vi.mock('../../services/FormatBoundaryService', () => ({
  FormatBoundaryService: {
    isAtFormatBoundary: vi.fn().mockReturnValue(false)
  }
}));

vi.mock('../../utils/domUtils', () => ({
  cleanupEmptyFormatElements: vi.fn()
}));

describe('DeletionService', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="editor-content"><p>Test content</p></div>';
    vi.clearAllMocks();
  });

  describe('handleBackspace', () => {
    test('should return default result when no selection', () => {
      vi.spyOn(window, 'getSelection').mockReturnValue(null);

      const result = DeletionService.handleBackspace();

      expect(result).toEqual({
        shouldResetFormat: false,
        deletedContent: '',
        newCursorPosition: 0
      });
    });

    test('should handle selection deletion', () => {
      const mockRange = {
        toString: () => 'selected text',
        deleteContents: vi.fn(),
        startOffset: 5,
        cloneContents: vi.fn(() => {
          const fragment = document.createDocumentFragment();
          fragment.appendChild(document.createTextNode('selected text'));
          return fragment;
        })
      };

      const mockSelection = {
        isCollapsed: false,
        getRangeAt: () => mockRange
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = DeletionService.handleBackspace();

      expect(result.shouldResetFormat).toBe(true); // Contains space
      expect(result.deletedContent).toBe('selected text');
      expect(result.newCursorPosition).toBe(5);
      expect(mockRange.deleteContents).toHaveBeenCalled();
    });

    test('should handle single character backspace at format boundary', () => {
      const textNode = document.createTextNode('test');
      const strongElement = document.createElement('strong');
      const prevTextNode = document.createTextNode('prev ');
      
      strongElement.appendChild(textNode);
      
      const mockRange = {
        startContainer: textNode,
        startOffset: 0
      };

      const mockSelection = {
        isCollapsed: true,
        getRangeAt: () => mockRange
      };

      // Mock DOM structure
      Object.defineProperty(textNode, 'parentElement', {
        value: strongElement,
        configurable: true
      });
      Object.defineProperty(strongElement, 'previousSibling', {
        value: prevTextNode,
        configurable: true
      });
      Object.defineProperty(prevTextNode, 'nodeType', {
        value: Node.TEXT_NODE,
        configurable: true
      });
      Object.defineProperty(prevTextNode, 'textContent', {
        value: 'prev ',
        writable: true,
        configurable: true
      });

      // Mock strongElement.matches
      strongElement.matches = vi.fn().mockReturnValue(true);

      // Mock selection with proper methods
      const mockSelectionWithMethods = {
        ...mockSelection,
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      };
      
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelectionWithMethods as any);

      const result = DeletionService.handleBackspace();

      expect(result.shouldResetFormat).toBe(true);
      expect(result.deletedContent).toBe(' ');
      expect(prevTextNode.textContent).toBe('prev');
    });

    test('should handle normal backspace', () => {
      const textNode = document.createTextNode('test');
      
      const mockRange = {
        startContainer: textNode,
        startOffset: 2
      };

      const mockSelection = {
        isCollapsed: true,
        getRangeAt: () => mockRange
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = DeletionService.handleBackspace();

      expect(result.shouldResetFormat).toBe(false);
      expect(result.deletedContent).toBe('');
      expect(result.newCursorPosition).toBe(1);
    });
  });

  describe('handleDelete', () => {
    test('should return default result when no selection', () => {
      vi.spyOn(window, 'getSelection').mockReturnValue(null);

      const result = DeletionService.handleDelete();

      expect(result).toEqual({
        shouldResetFormat: false,
        deletedContent: '',
        newCursorPosition: 0
      });
    });

    test('should handle selection deletion', () => {
      const mockRange = {
        toString: () => 'selected',
        deleteContents: vi.fn(),
        startOffset: 0,
        cloneContents: vi.fn(() => {
          const fragment = document.createDocumentFragment();
          fragment.appendChild(document.createTextNode('selected'));
          return fragment;
        })
      };

      const mockSelection = {
        isCollapsed: false,
        getRangeAt: () => mockRange
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = DeletionService.handleDelete();

      expect(result.shouldResetFormat).toBe(false); // No space in 'selected'
      expect(result.deletedContent).toBe('selected');
      expect(result.newCursorPosition).toBe(0);
      expect(mockRange.deleteContents).toHaveBeenCalled();
    });

    test('should handle single character delete', () => {
      const textNode = document.createTextNode('test');
      
      const mockRange = {
        startContainer: textNode,
        startOffset: 2
      };

      const mockSelection = {
        isCollapsed: true,
        getRangeAt: () => mockRange
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = DeletionService.handleDelete();

      expect(result.shouldResetFormat).toBe(false);
      expect(result.deletedContent).toBe('');
      expect(result.newCursorPosition).toBe(2);
    });
  });

  describe('isDeletingAcrossFormatBoundary', () => {
    test('should detect boundary crossing with different containers', () => {
      const startNode = document.createTextNode('start');
      const endNode = document.createTextNode('end');
      
      const mockRange = {
        startContainer: startNode,
        endContainer: endNode,
        cloneContents: () => document.createDocumentFragment()
      };

      const result = DeletionService['isDeletingAcrossFormatBoundary'](mockRange as any);

      expect(result).toBe(true);
    });

    test('should detect boundary crossing with format elements', () => {
      const container = document.createElement('div');
      
      const mockRange = {
        startContainer: container,
        endContainer: container,
        cloneContents: () => {
          const fragment = document.createDocumentFragment();
          const strong = document.createElement('strong');
          strong.textContent = 'bold';
          fragment.appendChild(strong);
          return fragment;
        }
      };

      const result = DeletionService['isDeletingAcrossFormatBoundary'](mockRange as any);

      expect(result).toBe(true);
    });

    test('should return false for simple text deletion', () => {
      const textNode = document.createTextNode('simple text');
      
      const mockRange = {
        startContainer: textNode,
        endContainer: textNode,
        cloneContents: () => {
          const fragment = document.createDocumentFragment();
          fragment.appendChild(document.createTextNode('text'));
          return fragment;
        }
      };

      const result = DeletionService['isDeletingAcrossFormatBoundary'](mockRange as any);

      expect(result).toBe(false);
    });
  });

  describe('shouldResetFormat', () => {
    test('should reset format when deleting across boundary', () => {
      const context = {
        isAtFormatBoundary: false,
        isInFormattedElement: true,
        isDeletingAcrossBoundary: true,
        deletedText: 'text'
      };

      const result = DeletionService.shouldResetFormat(context);

      expect(result).toBe(true);
    });

    test('should reset format when deleted text contains spaces', () => {
      const context = {
        isAtFormatBoundary: false,
        isInFormattedElement: true,
        isDeletingAcrossBoundary: false,
        deletedText: 'hello world'
      };

      const result = DeletionService.shouldResetFormat(context);

      expect(result).toBe(true);
    });

    test('should reset format when at format boundary', () => {
      const context = {
        isAtFormatBoundary: true,
        isInFormattedElement: true,
        isDeletingAcrossBoundary: false,
        deletedText: 'text'
      };

      const result = DeletionService.shouldResetFormat(context);

      expect(result).toBe(true);
    });

    test('should not reset format for simple character deletion', () => {
      const context = {
        isAtFormatBoundary: false,
        isInFormattedElement: true,
        isDeletingAcrossBoundary: false,
        deletedText: 'a'
      };

      const result = DeletionService.shouldResetFormat(context);

      expect(result).toBe(false);
    });
  });

  describe('getDeletionContext', () => {
    test('should create deletion context with format boundary detection', () => {
      const mockAnchorNode = document.createElement('strong');
      const mockSelection = {
        anchorNode: mockAnchorNode
      };

      mockAnchorNode.matches = vi.fn().mockReturnValue(true);
      
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = DeletionService.getDeletionContext('hello world');

      expect(result.isInFormattedElement).toBe(false); // Mock doesn't have parentElement
      expect(result.isDeletingAcrossBoundary).toBe(true); // Contains space
      expect(result.deletedText).toBe('hello world');
    });

    test('should handle null selection state', () => {
      vi.spyOn(window, 'getSelection').mockReturnValue(null);

      const result = DeletionService.getDeletionContext('text');

      expect(result.isInFormattedElement).toBe(false);
      expect(result.isDeletingAcrossBoundary).toBe(true); // 'text' length > 1 is false, but contains no space
      expect(result.deletedText).toBe('text');
    });

    test('should detect boundary crossing for multi-character deletion', () => {
      vi.spyOn(window, 'getSelection').mockReturnValue({ anchorNode: null });

      const result = DeletionService.getDeletionContext('multiple');

      expect(result.isDeletingAcrossBoundary).toBe(true); // Length > 1
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty selection range', () => {
      const mockRange = {
        toString: () => '',
        deleteContents: vi.fn(),
        startOffset: 0,
        cloneContents: vi.fn(() => document.createDocumentFragment())
      };

      const mockSelection = {
        isCollapsed: false,
        getRangeAt: () => mockRange
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = DeletionService.handleBackspace();

      expect(result.shouldResetFormat).toBe(false); // Empty text
      expect(result.deletedContent).toBe('');
    });

    test('should handle deletion at start of formatted element without previous sibling', () => {
      const textNode = document.createTextNode('test');
      const strongElement = document.createElement('strong');
      strongElement.appendChild(textNode);
      
      const mockRange = {
        startContainer: textNode,
        startOffset: 0
      };

      const mockSelection = {
        isCollapsed: true,
        getRangeAt: () => mockRange
      };

      // Mock DOM structure without previous sibling
      Object.defineProperty(textNode, 'parentElement', {
        value: strongElement,
        configurable: true
      });
      Object.defineProperty(strongElement, 'previousSibling', {
        value: null,
        configurable: true
      });

      strongElement.matches = vi.fn().mockReturnValue(true);

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const result = DeletionService.handleBackspace();

      expect(result.shouldResetFormat).toBe(false);
      expect(result.newCursorPosition).toBe(0); // Math.max(0, 0 - 1) = 0
    });
  });
});
