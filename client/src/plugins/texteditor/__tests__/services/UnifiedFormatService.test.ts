/**
 * UnifiedFormatService tests
 * Tests the consolidated formatting service functionality
 */

import { UnifiedFormatService } from '../../core/services/formatting/UnifiedFormatService';
import { ServiceFactory } from '../../core/services/ServiceFactory';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var afterEach: any;
  var vi: any;
}

// Mock ServiceFactory
vi.mock('../../core/services/ServiceFactory', () => ({
  ServiceFactory: {
    getFontFormatService: vi.fn(() => ({
      applyFontSize: vi.fn(),
      applyFontFamily: vi.fn(),
      getFontSize: vi.fn(() => '12pt'),
      getFontFamily: vi.fn(() => 'Arial')
    })),
    getLayoutFormatService: vi.fn(() => ({
      applyTextAlign: vi.fn(),
      applyTextColor: vi.fn(),
      applyBackgroundColor: vi.fn(),
      getTextAlign: vi.fn(() => 'left'),
      getTextColor: vi.fn(() => '#000000'),
      getBackgroundColor: vi.fn(() => '#ffffff')
    })),
    getListService: vi.fn(() => ({
      createBulletList: vi.fn(),
      createNumberedList: vi.fn(),
      removeList: vi.fn(),
      increaseNesting: vi.fn(),
      decreaseNesting: vi.fn()
    })),
    getLinkService: vi.fn(() => ({
      applyLink: vi.fn(),
      editLink: vi.fn(),
      removeLink: vi.fn()
    })),
    getMediaService: vi.fn(() => ({
      insertImage: vi.fn()
    })),
    getDOMManipulationService: vi.fn(() => ({
      wrapSelection: vi.fn(() => true),
      hasFormattingInHierarchy: vi.fn(() => false),
      hasStyleProperty: vi.fn(() => false),
      createFormattedTextNode: vi.fn(() => document.createTextNode('test')),
      insertNodeAtSelection: vi.fn(() => true)
    }))
  }
}));

describe('UnifiedFormatService', () => {
  let service: UnifiedFormatService;
  let mockSelection: any;
  let mockRange: any;

  beforeEach(() => {
    service = new UnifiedFormatService();
    
    // Mock DOM selection
    mockRange = {
      collapsed: false,
      startContainer: document.createTextNode('test'),
      insertNode: vi.fn(),
      setStartAfter: vi.fn(),
      collapse: vi.fn()
    };
    
    mockSelection = {
      rangeCount: 1,
      getRangeAt: vi.fn(() => mockRange),
      removeAllRanges: vi.fn(),
      addRange: vi.fn()
    };
    
    Object.defineProperty(window, 'getSelection', {
      value: vi.fn(() => mockSelection),
      writable: true
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Text Formatting', () => {
    test('should apply bold formatting to selection', () => {
      service.applyBold();
      
      expect(ServiceFactory.getDOMManipulationService().wrapSelection).toHaveBeenCalledWith('strong');
    });

    test('should apply italic formatting to selection', () => {
      service.applyItalic();
      
      expect(ServiceFactory.getDOMManipulationService().wrapSelection).toHaveBeenCalledWith('em');
    });

    test('should apply underline formatting to selection', () => {
      service.applyUnderline();
      
      expect(ServiceFactory.getDOMManipulationService().wrapSelection).toHaveBeenCalledWith('u');
    });

    test('should handle collapsed selection for bold', () => {
      mockRange.collapsed = true;
      
      service.applyBold();
      
      expect(mockRange.insertNode).toHaveBeenCalled();
    });
  });

  describe('Cursor Management', () => {
    test('should handle space key in formatting context', () => {
      const textNode = document.createTextNode('test');
      const strongElement = document.createElement('strong');
      strongElement.appendChild(textNode);
      
      mockRange.startContainer = textNode;
      mockRange.startOffset = 4; // End of text
      
      Object.defineProperty(textNode, 'parentElement', {
        value: strongElement,
        writable: true
      });
      
      Object.defineProperty(textNode, 'textContent', {
        value: 'test',
        writable: true
      });
      
      const result = service.handleSpace();
      
      expect(result).toBe(true);
    });

    test('should handle enter key to create new paragraph', () => {
      const textNode = document.createTextNode('test');
      const paragraph = document.createElement('p');
      const container = document.createElement('div');
      
      paragraph.appendChild(textNode);
      container.appendChild(paragraph);
      
      mockRange.startContainer = textNode;
      
      Object.defineProperty(textNode, 'parentElement', {
        value: paragraph,
        writable: true
      });
      
      paragraph.closest = vi.fn(() => paragraph);
      Object.defineProperty(paragraph, 'parentNode', {
        value: container,
        writable: true
      });
      
      container.insertBefore = vi.fn();
      
      const result = service.handleEnter();
      
      expect(result).toBe(true);
      expect(container.insertBefore).toHaveBeenCalled();
    });
  });

  describe('Format State', () => {
    test('should return default format state when no selection', () => {
      Object.defineProperty(window, 'getSelection', {
        value: vi.fn(() => null),
        writable: true
      });
      
      const formatState = service.getFormatState();
      
      expect(formatState).toEqual({
        bold: false,
        italic: false,
        underline: false,
        fontSize: '12pt',
        fontFamily: 'Arial',
        textAlign: 'left',
        textColor: '#000000',
        backgroundColor: '#ffffff',
        listState: { isInList: false, listType: null, nestingLevel: 0 }
      });
    });

    test('should detect formatting from DOM hierarchy', () => {
      const textNode = document.createTextNode('test');
      const strongElement = document.createElement('strong');
      strongElement.appendChild(textNode);
      
      mockRange.startContainer = textNode;
      
      ServiceFactory.getDOMManipulationService().hasFormattingInHierarchy = vi.fn()
        .mockReturnValueOnce(true)  // bold
        .mockReturnValueOnce(false) // italic
        .mockReturnValueOnce(false); // underline
      
      const formatState = service.getFormatState();
      
      expect(formatState.bold).toBe(true);
      expect(formatState.italic).toBe(false);
      expect(formatState.underline).toBe(false);
    });
  });

  describe('Font Formatting Delegation', () => {
    test('should delegate font size application', () => {
      service.applyFontSize('14pt');
      
      expect(ServiceFactory.getFontFormatService().applyFontSize).toHaveBeenCalledWith('14pt');
    });

    test('should delegate font family application', () => {
      service.applyFontFamily('Helvetica');
      
      expect(ServiceFactory.getFontFormatService().applyFontFamily).toHaveBeenCalledWith('Helvetica');
    });
  });

  describe('Layout Formatting Delegation', () => {
    test('should delegate text alignment', () => {
      service.applyTextAlign('center');
      
      expect(ServiceFactory.getLayoutFormatService().applyTextAlign).toHaveBeenCalledWith('center');
    });

    test('should delegate text color', () => {
      service.applyTextColor('#ff0000');
      
      expect(ServiceFactory.getLayoutFormatService().applyTextColor).toHaveBeenCalledWith('#ff0000');
    });

    test('should delegate background color', () => {
      service.applyBackgroundColor('#00ff00');
      
      expect(ServiceFactory.getLayoutFormatService().applyBackgroundColor).toHaveBeenCalledWith('#00ff00');
    });
  });

  describe('List Operations Delegation', () => {
    test('should delegate bullet list creation', () => {
      service.applyBulletList();
      
      expect(ServiceFactory.getListService().createBulletList).toHaveBeenCalled();
    });

    test('should delegate numbered list creation', () => {
      service.applyNumberedList();
      
      expect(ServiceFactory.getListService().createNumberedList).toHaveBeenCalled();
    });

    test('should delegate list removal', () => {
      service.removeList();
      
      expect(ServiceFactory.getListService().removeList).toHaveBeenCalled();
    });
  });

  describe('Link Operations Delegation', () => {
    test('should delegate link application', () => {
      const linkData = { url: 'https://example.com', text: 'Example' };
      service.applyLink(linkData);
      
      expect(ServiceFactory.getLinkService().applyLink).toHaveBeenCalledWith(linkData);
    });

    test('should delegate link editing', () => {
      const linkData = { url: 'https://updated.com', text: 'Updated' };
      service.editLink(linkData);
      
      expect(ServiceFactory.getLinkService().editLink).toHaveBeenCalledWith(linkData);
    });

    test('should delegate link removal', () => {
      service.removeLink();
      
      expect(ServiceFactory.getLinkService().removeLink).toHaveBeenCalled();
    });
  });

  describe('Media Operations Delegation', () => {
    test('should delegate image insertion', () => {
      const imageData = { src: 'image.jpg', alt: 'Test image' };
      service.insertImage(imageData);
      
      expect(ServiceFactory.getMediaService().insertImage).toHaveBeenCalledWith(imageData);
    });
  });

  describe('Text Insertion', () => {
    test('should skip space insertion (handled by cursor management)', () => {
      service.insertText(' ');
      
      expect(ServiceFactory.getDOMManipulationService().createFormattedTextNode).not.toHaveBeenCalled();
    });

    test('should insert formatted text', () => {
      ServiceFactory.getDOMManipulationService().hasFormattingInHierarchy = vi.fn()
        .mockReturnValueOnce(true)  // bold
        .mockReturnValueOnce(false) // italic
        .mockReturnValueOnce(false); // underline
      
      service.insertText('Hello');
      
      expect(ServiceFactory.getDOMManipulationService().createFormattedTextNode).toHaveBeenCalledWith(
        'Hello',
        { bold: true, italic: false, underline: false }
      );
      expect(ServiceFactory.getDOMManipulationService().insertNodeAtSelection).toHaveBeenCalled();
    });
  });
});
