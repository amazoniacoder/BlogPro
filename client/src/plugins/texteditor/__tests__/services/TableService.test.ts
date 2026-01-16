import { describe, test, expect, beforeEach, vi } from 'vitest';
import { TableService, TableConfig } from '../../core/services/TableService';

// Mock DOM environment
const mockRange = {
  deleteContents: vi.fn(),
  insertNode: vi.fn(),
  setStartAfter: vi.fn(),
  collapse: vi.fn()
};

const mockSelection = {
  rangeCount: 1,
  getRangeAt: vi.fn(() => mockRange),
  removeAllRanges: vi.fn(),
  addRange: vi.fn()
};

Object.defineProperty(window, 'getSelection', {
  writable: true,
  value: vi.fn(() => mockSelection)
});

// Mock document methods
Object.defineProperty(document, 'createElement', {
  writable: true,
  value: vi.fn((tagName: string) => {
    const element = {
      tagName: tagName.toUpperCase(),
      className: '',
      style: {},
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
      addEventListener: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      closest: vi.fn(),
      focus: vi.fn(),
      textContent: '',
      innerHTML: '',
      contentEditable: '',
      parentNode: { insertBefore: vi.fn() },
      nextSibling: null,
      cells: [],
      rows: [],
      remove: vi.fn(),
      dispatchEvent: vi.fn()
    };
    return element as any;
  })
});

Object.defineProperty(document, 'createTextNode', {
  writable: true,
  value: vi.fn((text: string) => ({ textContent: text, nodeType: 3 }))
});

Object.defineProperty(document, 'createRange', {
  writable: true,
  value: vi.fn(() => ({
    selectNodeContents: vi.fn()
  }))
});

Object.defineProperty(document, 'getElementById', {
  writable: true,
  value: vi.fn(() => null)
});

Object.defineProperty(document, 'head', {
  writable: true,
  value: { appendChild: vi.fn() }
});

describe('TableService', () => {
  const defaultConfig: TableConfig = {
    rows: 3,
    columns: 3,
    hasHeader: true,
    borderStyle: 'solid',
    alignment: 'left'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('insertTable', () => {
    test('executes without errors when selection is available', () => {
      expect(() => {
        TableService.insertTable(defaultConfig);
      }).not.toThrow();
    });

    test('handles missing selection gracefully', () => {
      vi.mocked(window.getSelection).mockReturnValue(null);

      expect(() => {
        TableService.insertTable(defaultConfig);
      }).not.toThrow();
    });

    test('handles no range gracefully', () => {
      vi.mocked(window.getSelection).mockReturnValue({
        rangeCount: 0,
        getRangeAt: vi.fn(),
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      } as any);

      expect(() => {
        TableService.insertTable(defaultConfig);
      }).not.toThrow();
    });

    test('processes table configuration correctly', () => {
      const customConfig = {
        rows: 4,
        columns: 2,
        hasHeader: false,
        borderStyle: 'dashed' as const,
        alignment: 'center' as const
      };

      expect(() => {
        TableService.insertTable(customConfig);
      }).not.toThrow();
    });

    test('works with different table configurations', () => {
      const configs = [
        { ...defaultConfig, hasHeader: false },
        { ...defaultConfig, borderStyle: 'dashed' as const },
        { ...defaultConfig, alignment: 'center' as const },
        { ...defaultConfig, rows: 5, columns: 4 }
      ];

      configs.forEach(config => {
        expect(() => {
          TableService.insertTable(config);
        }).not.toThrow();
      });
    });
  });

  describe('initializeExistingTables', () => {
    test('initializes existing tables with event listeners', () => {
      const mockCell1 = { addEventListener: vi.fn() };
      const mockCell2 = { addEventListener: vi.fn() };
      
      const mockTable = {
        querySelectorAll: vi.fn(() => [mockCell1, mockCell2]),
        addEventListener: vi.fn()
      };

      const mockEditor = {
        querySelectorAll: vi.fn(() => [mockTable])
      };

      TableService.initializeExistingTables(mockEditor as any);

      expect(mockEditor.querySelectorAll).toHaveBeenCalledWith('table.editor-table, table[data-component-type="table"]');
      expect(mockCell1.addEventListener).toHaveBeenCalled();
      expect(mockCell2.addEventListener).toHaveBeenCalled();
      expect(mockTable.addEventListener).toHaveBeenCalled();
    });

    test('handles no existing tables', () => {
      const mockEditor = {
        querySelectorAll: vi.fn(() => [])
      };

      expect(() => {
        TableService.initializeExistingTables(mockEditor as any);
      }).not.toThrow();
    });
  });

  describe('addRow', () => {
    test('adds row after reference row', () => {
      const mockReferenceRow = {
        cells: [{}, {}, {}], // 3 columns
        parentNode: {
          insertBefore: vi.fn()
        },
        nextSibling: {}
      };

      const mockTable = {
        closest: vi.fn(() => ({ dispatchEvent: vi.fn() }))
      };

      TableService.addRow(mockTable as any, 'after', mockReferenceRow as any);

      expect(mockReferenceRow.parentNode.insertBefore).toHaveBeenCalled();
    });

    test('adds row before reference row', () => {
      const mockReferenceRow = {
        cells: [{}, {}], // 2 columns
        parentNode: {
          insertBefore: vi.fn()
        }
      };

      const mockTable = {
        closest: vi.fn(() => ({ dispatchEvent: vi.fn() }))
      };

      TableService.addRow(mockTable as any, 'before', mockReferenceRow as any);

      expect(mockReferenceRow.parentNode.insertBefore).toHaveBeenCalled();
    });
  });

  describe('addColumn', () => {
    test('adds column to all rows', () => {
      const mockRows = [
        {
          cells: [{}, {}],
          insertBefore: vi.fn(),
          appendChild: vi.fn()
        },
        {
          cells: [{}, {}],
          insertBefore: vi.fn(),
          appendChild: vi.fn()
        }
      ];

      const mockTable = {
        querySelectorAll: vi.fn(() => mockRows),
        querySelector: vi.fn(() => null), // No header
        closest: vi.fn(() => ({ dispatchEvent: vi.fn() }))
      };

      TableService.addColumn(mockTable as any, 'after', 1);

      expect(mockTable.querySelectorAll).toHaveBeenCalledWith('tr');
      mockRows.forEach(row => {
        expect(row.appendChild).toHaveBeenCalled();
      });
    });

    test('handles header rows correctly', () => {
      const mockRows = [
        {
          cells: [{}, {}],
          insertBefore: vi.fn(),
          appendChild: vi.fn()
        }
      ];

      const mockTable = {
        querySelectorAll: vi.fn(() => mockRows),
        querySelector: vi.fn(() => ({})), // Has header
        closest: vi.fn(() => ({ dispatchEvent: vi.fn() }))
      };

      expect(() => {
        TableService.addColumn(mockTable as any, 'after', 1);
      }).not.toThrow();
    });
  });

  describe('deleteRow', () => {
    test('deletes row when table has multiple rows', () => {
      const mockTable = {
        rows: { length: 3 }, // Multiple rows
        dispatchEvent: vi.fn(),
        closest: vi.fn(() => ({ dispatchEvent: vi.fn() }))
      };
      
      const mockRow = {
        closest: vi.fn(() => mockTable),
        remove: vi.fn()
      };

      TableService.deleteRow(mockRow as any);

      expect(mockRow.remove).toHaveBeenCalled();
    });

    test('does not delete row when table has only one row', () => {
      const mockTable = {
        rows: { length: 1 }, // Only one row
        dispatchEvent: vi.fn(),
        closest: vi.fn(() => ({ dispatchEvent: vi.fn() }))
      };
      
      const mockRow = {
        closest: vi.fn(() => mockTable),
        remove: vi.fn()
      };

      TableService.deleteRow(mockRow as any);

      expect(mockRow.remove).not.toHaveBeenCalled();
    });
  });

  describe('deleteColumn', () => {
    test('deletes column when table has multiple columns', () => {
      const mockRows = [
        {
          cells: [
            { remove: vi.fn() },
            { remove: vi.fn() },
            { remove: vi.fn() }
          ]
        },
        {
          cells: [
            { remove: vi.fn() },
            { remove: vi.fn() },
            { remove: vi.fn() }
          ]
        }
      ];

      const mockTable = {
        rows: [{ cells: { length: 3 } }], // Multiple columns
        querySelectorAll: vi.fn(() => mockRows),
        closest: vi.fn(() => ({ dispatchEvent: vi.fn() }))
      };

      TableService.deleteColumn(mockTable as any, 1);

      mockRows.forEach(row => {
        expect(row.cells[1].remove).toHaveBeenCalled();
      });
    });

    test('does not delete column when table has only one column', () => {
      const mockRows = [
        {
          cells: [{ remove: vi.fn() }]
        }
      ];

      const mockTable = {
        rows: [{ cells: { length: 1 } }], // Only one column
        querySelectorAll: vi.fn(() => mockRows),
        closest: vi.fn(() => ({ dispatchEvent: vi.fn() }))
      };

      TableService.deleteColumn(mockTable as any, 0);

      expect(mockRows[0].cells[0].remove).not.toHaveBeenCalled();
    });
  });

  describe('Cell Navigation and Content Management', () => {
    test('handles cell event listeners setup', () => {
      const mockCell = {
        addEventListener: vi.fn()
      };

      // Access private method through service
      (TableService as any).addCellEventListeners(mockCell);

      // Verify event listeners are added
      expect(mockCell.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockCell.addEventListener).toHaveBeenCalledWith('input', expect.any(Function));
      expect(mockCell.addEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
    });

    test('handles content selection in cells', () => {
      const mockRange = {
        selectNodeContents: vi.fn()
      };

      const mockSelection = {
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      };

      vi.mocked(document.createRange).mockReturnValue(mockRange as any);
      vi.mocked(window.getSelection).mockReturnValue(mockSelection as any);

      const mockCell = {};

      // Access private method
      (TableService as any).selectCellContent(mockCell);

      expect(mockRange.selectNodeContents).toHaveBeenCalledWith(mockCell);
      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
      expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
    });

    test('handles missing selection gracefully in cell content selection', () => {
      vi.mocked(window.getSelection).mockReturnValue(null);

      const mockCell = {};

      expect(() => {
        (TableService as any).selectCellContent(mockCell);
      }).not.toThrow();
    });

    test('triggers content change events', () => {
      const mockEditor = {
        dispatchEvent: vi.fn()
      };

      const mockElement = {
        closest: vi.fn(() => mockEditor)
      };

      (TableService as any).triggerContentChange(mockElement);

      expect(mockElement.closest).toHaveBeenCalledWith('[contenteditable="true"]');
      expect(mockEditor.dispatchEvent).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('handles missing parent node in row operations', () => {
      const mockReferenceRow = {
        cells: [{}],
        parentNode: null // Missing parent
      };

      const mockTable = {
        closest: vi.fn(() => ({ dispatchEvent: vi.fn() }))
      };

      expect(() => {
        TableService.addRow(mockTable as any, 'after', mockReferenceRow as any);
      }).not.toThrow();
    });

    test('handles missing table in cell navigation', () => {
      const mockCell = {
        closest: vi.fn(() => null) // No table found
      };

      expect(() => {
        (TableService as any).moveToNextCell(mockCell, 'next');
      }).not.toThrow();
    });

    test('handles missing cells in table operations', () => {
      const mockTable = {
        rows: [],
        querySelectorAll: vi.fn(() => []),
        closest: vi.fn(() => ({ dispatchEvent: vi.fn() }))
      };

      expect(() => {
        TableService.deleteColumn(mockTable as any, 0);
      }).not.toThrow();
    });
  });

  describe('Table Configuration Support', () => {
    test('supports all border styles', () => {
      const borderStyles: Array<'none' | 'solid' | 'dashed'> = ['none', 'solid', 'dashed'];
      
      borderStyles.forEach(borderStyle => {
        const config = { ...defaultConfig, borderStyle };
        expect(() => {
          TableService.insertTable(config);
        }).not.toThrow();
      });
    });

    test('supports all alignment options', () => {
      const alignments: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];
      
      alignments.forEach(alignment => {
        const config = { ...defaultConfig, alignment };
        expect(() => {
          TableService.insertTable(config);
        }).not.toThrow();
      });
    });

    test('supports tables with and without headers', () => {
      const headerConfigs = [
        { ...defaultConfig, hasHeader: true },
        { ...defaultConfig, hasHeader: false }
      ];
      
      headerConfigs.forEach(config => {
        expect(() => {
          TableService.insertTable(config);
        }).not.toThrow();
      });
    });

    test('supports different table sizes', () => {
      const sizeConfigs = [
        { ...defaultConfig, rows: 1, columns: 1 },
        { ...defaultConfig, rows: 5, columns: 3 },
        { ...defaultConfig, rows: 10, columns: 8 }
      ];
      
      sizeConfigs.forEach(config => {
        expect(() => {
          TableService.insertTable(config);
        }).not.toThrow();
      });
    });
  });

  describe('Service Integration', () => {
    test('integrates with editor initialization', () => {
      const mockEditor = {
        querySelectorAll: vi.fn(() => [])
      };

      expect(() => {
        TableService.initializeExistingTables(mockEditor as any);
      }).not.toThrow();

      expect(mockEditor.querySelectorAll).toHaveBeenCalledWith('table.editor-table, table[data-component-type="table"]');
    });

    test('handles table operations consistently', () => {
      const operations = [
        () => TableService.insertTable(defaultConfig),
        () => TableService.initializeExistingTables(document.body),
        () => {
          const mockTable = { closest: vi.fn(() => ({ dispatchEvent: vi.fn() })) };
          const mockRow = { cells: [{}], parentNode: { insertBefore: vi.fn() } };
          TableService.addRow(mockTable as any, 'after', mockRow as any);
        }
      ];

      operations.forEach(operation => {
        expect(() => operation()).not.toThrow();
      });
    });
  });
});
