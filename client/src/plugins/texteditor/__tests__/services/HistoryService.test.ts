/**
 * Unit tests for HistoryService
 */

import { HistoryService } from '../../core/services/HistoryService';
import { FormatCommandImpl } from '../../core/services/CommandService';

// Test globals
declare global {
  var describe: any;
  var it: any;
  var expect: any;
  var beforeEach: any;
}

describe('HistoryService', () => {
  let historyService: HistoryService;
  let mockCommand: FormatCommandImpl;

  beforeEach(() => {
    historyService = new HistoryService({ maxSize: 5, mergeInterval: 100 });
    
    mockCommand = {
      id: 'test-command',
      type: 'format',
      timestamp: Date.now(),
      formatType: 'bold',
      value: true,
      range: {
        start: 0,
        end: 0,
        isCollapsed: true,
        anchorNode: null,
        focusNode: null,
        direction: 'none'
      },
      execute: async () => {},
      undo: async () => {},
      canExecute: () => true,
      canUndo: () => true
    } as any;
  });

  describe('execute', () => {
    it('should execute command and add to history', async () => {
      await historyService.execute(mockCommand);
      
      expect(historyService.canUndo()).toBe(true);
    });

    it('should throw error if command cannot execute', async () => {
      mockCommand.canExecute = () => false;
      
      await expect(historyService.execute(mockCommand)).rejects.toThrow();
    });
  });

  describe('undo', () => {
    it('should undo last command', async () => {
      await historyService.execute(mockCommand);
      
      const result = await historyService.undo();
      
      expect(result).toBe(true);
      expect(historyService.canUndo()).toBe(false);
    });

    it('should return false if cannot undo', async () => {
      const result = await historyService.undo();
      
      expect(result).toBe(false);
    });
  });

  describe('redo', () => {
    it('should redo command after undo', async () => {
      await historyService.execute(mockCommand);
      await historyService.undo();
      
      const result = await historyService.redo();
      
      expect(result).toBe(true);
    });

    it('should return false if cannot redo', async () => {
      const result = await historyService.redo();
      
      expect(result).toBe(false);
    });
  });

  describe('history management', () => {
    it('should maintain max size limit', async () => {
      // Execute 6 commands (max is 5)
      for (let i = 0; i < 6; i++) {
        const cmd = {
          ...mockCommand,
          id: `cmd-${i}`,
          execute: async () => {},
          undo: async () => {},
          canExecute: () => true,
          canUndo: () => true
        };
        await historyService.execute(cmd);
      }
      
      const history = historyService.getHistory();
      expect(history.length).toBe(5);
    });

    it('should clear history', async () => {
      await historyService.execute(mockCommand);
      
      historyService.clear();
      
      expect(historyService.canUndo()).toBe(false);
      expect(historyService.getHistory().length).toBe(0);
    });
  });
});
