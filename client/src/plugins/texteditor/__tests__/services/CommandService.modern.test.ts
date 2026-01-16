/**
 * Modern CommandService tests
 * Tests aligned with actual command service architecture
 */

import { 
  FormatCommandImpl, 
  InsertCommandImpl, 
  DeleteCommandImpl, 
  ReplaceCommandImpl,
  CommandFactory 
} from '../../core/services/CommandService';


// Test globals
declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

// Mock services
vi.mock('../../core/services/ModernFormatService', () => ({
  ModernFormatService: {
    applyBold: vi.fn(),
    applyItalic: vi.fn(),
    applyUnderline: vi.fn(),
    getFormatState: vi.fn(() => ({ 
      bold: false, italic: false, underline: false, 
      fontSize: '12pt', fontFamily: 'Arial', textAlign: 'left',
      textColor: '#000000', backgroundColor: '#ffffff',
      listState: { isInList: false, listType: null, nestingLevel: 0 }
    }))
  }
}));

vi.mock('../../utils/selectionUtils', () => ({
  getSelectionState: vi.fn(() => ({
    start: 0,
    end: 0,
    isCollapsed: true,
    anchorNode: null,
    focusNode: null,
    direction: 'none' as const
  }))
}));

describe('CommandService', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="editor-content"><p>Test content</p></div>';
    vi.clearAllMocks();
    
    // Mock document methods that don't exist in test environment
    Object.defineProperty(document, 'queryCommandState', {
      value: vi.fn().mockReturnValue(false),
      writable: true
    });
    
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn().mockReturnValue(true),
      writable: true
    });
  });

  describe('FormatCommandImpl', () => {
    test('should create format command with proper properties', () => {
      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new FormatCommandImpl('bold', true, range);
      
      expect(command.type).toBe('format');
      expect(command.formatType).toBe('bold');
      expect(command.value).toBe(true);
      expect(command.range).toBe(range);
      expect(command.id).toBeDefined();
      expect(command.timestamp).toBeDefined();
    });

    test('should execute format command', async () => {
      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new FormatCommandImpl('bold', true, range);
      
      await command.execute();
      
      // Verify the command executed without errors
      expect(command.canUndo()).toBe(true);
    });

    test('should undo format command', async () => {
      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new FormatCommandImpl('bold', true, range);
      
      await command.execute();
      await command.undo();
      
      // Verify undo was successful
      expect(command.canUndo()).toBe(true);
    });

    test('should check if command can execute', () => {
      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new FormatCommandImpl('bold', true, range);
      
      expect(command.canExecute()).toBe(true);
    });

    test('should check if command can undo after execution', async () => {
      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new FormatCommandImpl('bold', true, range);
      
      expect(command.canUndo()).toBe(false); // Before execution
      
      await command.execute();
      
      expect(command.canUndo()).toBe(true); // After execution
    });
  });

  describe('InsertCommandImpl', () => {
    test('should create insert command with proper properties', () => {
      const command = new InsertCommandImpl('Hello', 5);
      
      expect(command.type).toBe('insert');
      expect(command.content).toBe('Hello');
      expect(command.position).toBe(5);
    });

    test('should execute insert command with modern DOM APIs', async () => {
      const mockRange = {
        deleteContents: vi.fn(),
        insertNode: vi.fn(),
        setStartAfter: vi.fn(),
        collapse: vi.fn()
      };

      const mockSelection = {
        rangeCount: 1,
        getRangeAt: () => mockRange,
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const command = new InsertCommandImpl('Hello', 0);
      
      await command.execute();
      
      expect(mockRange.deleteContents).toHaveBeenCalled();
      expect(mockRange.insertNode).toHaveBeenCalled();
      expect(mockRange.setStartAfter).toHaveBeenCalled();
      expect(mockRange.collapse).toHaveBeenCalledWith(true);
      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
      expect(mockSelection.addRange).toHaveBeenCalled();
    });

    test('should fallback to execCommand on error', async () => {
      const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);
      
      vi.spyOn(window, 'getSelection').mockImplementation(() => {
        throw new Error('Selection error');
      });

      const command = new InsertCommandImpl('Hello', 0);
      
      await command.execute();
      
      expect(execCommandSpy).toHaveBeenCalledWith('insertText', false, 'Hello');
    });

    test('should undo insert command', async () => {
      const textNode = document.createTextNode('Test Hello content');
      const mockRange = {
        setStart: vi.fn(),
        setEnd: vi.fn(),
        deleteContents: vi.fn()
      };

      const mockSelection = {
        anchorNode: textNode
      };

      vi.spyOn(document, 'createRange').mockReturnValue(mockRange as any);
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const command = new InsertCommandImpl('Hello', 5);
      
      await command.undo();
      
      expect(mockRange.setStart).toHaveBeenCalledWith(textNode, 5);
      expect(mockRange.setEnd).toHaveBeenCalledWith(textNode, 10); // 5 + 'Hello'.length
      expect(mockRange.deleteContents).toHaveBeenCalled();
    });

    test('should check if command can execute', () => {
      const command = new InsertCommandImpl('Hello', 0);
      expect(command.canExecute()).toBe(true);
      
      const emptyCommand = new InsertCommandImpl('', 0);
      expect(emptyCommand.canExecute()).toBe(false);
    });

    test('should always be able to undo', () => {
      const command = new InsertCommandImpl('Hello', 0);
      expect(command.canUndo()).toBe(true);
    });
  });

  describe('DeleteCommandImpl', () => {
    test('should create delete command with proper properties', () => {
      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new DeleteCommandImpl(range, 'Test');
      
      expect(command.type).toBe('delete');
      expect(command.range).toBe(range);
      expect(command.deletedContent).toBe('Test');
    });

    test('should execute delete command', async () => {
      const mockRange = {
        deleteContents: vi.fn()
      };

      const mockSelection = {
        rangeCount: 1,
        getRangeAt: () => mockRange
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new DeleteCommandImpl(range, 'Test');
      
      await command.execute();
      
      expect(mockRange.deleteContents).toHaveBeenCalled();
    });

    test('should undo delete command', async () => {
      const mockRange = {
        insertNode: vi.fn(),
        setStartAfter: vi.fn(),
        collapse: vi.fn()
      };

      const mockSelection = {
        rangeCount: 1,
        getRangeAt: () => mockRange,
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new DeleteCommandImpl(range, 'Test');
      
      await command.undo();
      
      expect(mockRange.insertNode).toHaveBeenCalled();
      expect(mockRange.setStartAfter).toHaveBeenCalled();
      expect(mockRange.collapse).toHaveBeenCalledWith(true);
      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
      expect(mockSelection.addRange).toHaveBeenCalled();
    });

    test('should check if command can execute', () => {
      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new DeleteCommandImpl(range, 'Test');
      expect(command.canExecute()).toBe(true);
      
      const emptyCommand = new DeleteCommandImpl(range, '');
      expect(emptyCommand.canExecute()).toBe(false);
    });
  });

  describe('ReplaceCommandImpl', () => {
    test('should create replace command with proper properties', () => {
      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new ReplaceCommandImpl(range, 'Old', 'New');
      
      expect(command.type).toBe('replace');
      expect(command.range).toBe(range);
      expect(command.oldContent).toBe('Old');
      expect(command.newContent).toBe('New');
    });

    test('should execute replace command', async () => {
      const mockRange = {
        deleteContents: vi.fn(),
        insertNode: vi.fn(),
        setStartAfter: vi.fn(),
        collapse: vi.fn()
      };

      const mockSelection = {
        rangeCount: 1,
        getRangeAt: () => mockRange,
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new ReplaceCommandImpl(range, 'Old', 'New');
      
      await command.execute();
      
      expect(mockRange.deleteContents).toHaveBeenCalled();
      expect(mockRange.insertNode).toHaveBeenCalled();
      expect(mockRange.setStartAfter).toHaveBeenCalled();
      expect(mockRange.collapse).toHaveBeenCalledWith(true);
    });

    test('should undo replace command', async () => {
      const mockRange = {
        setStart: vi.fn(),
        setEnd: vi.fn(),
        deleteContents: vi.fn(),
        insertNode: vi.fn(),
        setStartAfter: vi.fn(),
        collapse: vi.fn(),
        startContainer: document.createTextNode(''),
        startOffset: 10
      };

      const mockSelection = {
        rangeCount: 1,
        getRangeAt: () => mockRange,
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      };

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new ReplaceCommandImpl(range, 'Old', 'New');
      
      await command.undo();
      
      expect(mockRange.setStart).toHaveBeenCalled();
      expect(mockRange.setEnd).toHaveBeenCalled();
      expect(mockRange.deleteContents).toHaveBeenCalled();
      expect(mockRange.insertNode).toHaveBeenCalled();
    });

    test('should check if command can execute', () => {
      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = new ReplaceCommandImpl(range, 'Old', 'New');
      expect(command.canExecute()).toBe(true);
      
      const sameContentCommand = new ReplaceCommandImpl(range, 'Same', 'Same');
      expect(sameContentCommand.canExecute()).toBe(false);
    });
  });

  describe('CommandFactory', () => {
    test('should create format command', () => {
      const command = CommandFactory.createFormatCommand('bold', true);
      
      expect(command).toBeInstanceOf(FormatCommandImpl);
      expect(command.formatType).toBe('bold');
      expect(command.value).toBe(true);
      expect(command.range).toBeDefined();
    });

    test('should create format command with custom range', () => {
      const range = {
        start: 5,
        end: 10,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'forward' as const
      };

      const command = CommandFactory.createFormatCommand('italic', true, range);
      
      expect(command.range).toBe(range);
    });

    test('should create insert command', () => {
      const command = CommandFactory.createInsertCommand('Hello');
      
      expect(command).toBeInstanceOf(InsertCommandImpl);
      expect(command.content).toBe('Hello');
      expect(command.position).toBeDefined();
    });

    test('should create insert command with custom position', () => {
      const command = CommandFactory.createInsertCommand('Hello', 5);
      
      expect(command.position).toBe(5);
    });

    test('should create delete command', () => {
      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = CommandFactory.createDeleteCommand(range, 'Test');
      
      expect(command).toBeInstanceOf(DeleteCommandImpl);
      expect(command.range).toBe(range);
      expect(command.deletedContent).toBe('Test');
    });

    test('should create replace command', () => {
      const range = {
        start: 0,
        end: 4,
        isCollapsed: false,
        anchorNode: null,
        focusNode: null,
        direction: 'none' as const
      };

      const command = CommandFactory.createReplaceCommand(range, 'Old', 'New');
      
      expect(command).toBeInstanceOf(ReplaceCommandImpl);
      expect(command.range).toBe(range);
      expect(command.oldContent).toBe('Old');
      expect(command.newContent).toBe('New');
    });
  });

  describe('Command Base Functionality', () => {
    test('should generate unique IDs for commands', () => {
      const command1 = new FormatCommandImpl('bold', true, {
        start: 0, end: 0, isCollapsed: true, anchorNode: null, focusNode: null, direction: 'none'
      });
      const command2 = new FormatCommandImpl('italic', true, {
        start: 0, end: 0, isCollapsed: true, anchorNode: null, focusNode: null, direction: 'none'
      });
      
      expect(command1.id).not.toBe(command2.id);
      expect(command1.id).toMatch(/^cmd_\d+_[a-z0-9]+$/);
    });

    test('should set timestamp on command creation', () => {
      const beforeTime = Date.now();
      const command = new FormatCommandImpl('bold', true, {
        start: 0, end: 0, isCollapsed: true, anchorNode: null, focusNode: null, direction: 'none'
      });
      const afterTime = Date.now();
      
      expect(command.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(command.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });
});
