import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TableEditService } from '../services/TableEditService';
import './TableEditor.css';

interface TableEditorProps {
  onCommand: (command: string, data?: any) => void;
  disabled?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

interface TableData {
  rows: number;
  columns: number;
  hasHeader: boolean;
  borderStyle: 'none' | 'solid' | 'dashed';
  alignment: 'left' | 'center' | 'right';
}

const TableEditor: React.FC<TableEditorProps> = ({ onCommand, disabled = false, onClose, isModal = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tableData, setTableData] = useState<TableData>({
    rows: 3,
    columns: 3,
    hasHeader: true,
    borderStyle: 'solid',
    alignment: 'left'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTable, setEditingTable] = useState<HTMLTableElement | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // Save selection before opening dialog
  const handleToggle = useCallback(() => {
    // Check if mobile and dispatch modal event
    if (window.innerWidth <= 768 && !isModal) {
      document.dispatchEvent(new CustomEvent('openPluginModal', {
        detail: { plugin: 'table-editor' }
      }));
      return;
    }
    
    if (!isOpen) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        try {
          savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
        } catch (error) {
          savedSelectionRef.current = selection.getRangeAt(0);
        }
      }
      
      // Calculate panel position
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPanelPosition({
          top: rect.bottom + 4,
          left: rect.right - 320
        });
      }
    }
    setIsOpen(!isOpen);
    setError(null);
  }, [isOpen]);

  // Handle table creation or editing
  const handleCreateTable = useCallback(async () => {
    if (tableData.rows < 1 || tableData.columns < 1) {
      setError('Table must have at least 1 row and 1 column');
      return;
    }

    if (tableData.rows > 20 || tableData.columns > 10) {
      setError('Maximum table size is 20 rows × 10 columns');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      if (isEditMode && editingTable) {
        // Edit existing table
        TableEditService.updateTableStructure(editingTable, tableData);
      } else {
        // Create new table
        // Restore selection before inserting table
        if (savedSelectionRef.current) {
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(savedSelectionRef.current);
          }
        }

        // Create table data
        const tableConfig = {
          rows: tableData.rows,
          columns: tableData.columns,
          hasHeader: tableData.hasHeader,
          borderStyle: tableData.borderStyle,
          alignment: tableData.alignment
        };

        // Execute table insertion command
        onCommand('insertTable', tableConfig);
      }

      // Reset and close
      setTableData({
        rows: 3,
        columns: 3,
        hasHeader: true,
        borderStyle: 'solid',
        alignment: 'left'
      });
      setIsOpen(false);
      setIsEditMode(false);
      setEditingTable(null);

      // Focus back to editor
      setTimeout(() => {
        const editor = document.querySelector('.editor-content') as HTMLElement;
        if (editor) {
          editor.focus();
        }
      }, 100);

    } catch (error) {
      console.error('Table operation failed:', error);
      setError('Failed to process table. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [tableData, onCommand, isEditMode, editingTable]);

  // Handle quick table insertion (grid selector)
  const handleQuickInsert = useCallback((rows: number, cols: number) => {
    const quickTableData = {
      rows,
      columns: cols,
      hasHeader: true,
      borderStyle: 'solid' as const,
      alignment: 'left' as const
    };

    // Restore selection
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }

    onCommand('insertTable', quickTableData);
    setIsOpen(false);

    // Focus back to editor
    setTimeout(() => {
      const editor = document.querySelector('.editor-content') as HTMLElement;
      if (editor) {
        editor.focus();
      }
    }, 100);
  }, [onCommand]);

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // Listen for table edit events
  useEffect(() => {
    const handleTableEdit = (event: CustomEvent) => {
      const { table, currentData } = event.detail;
      setEditingTable(table);
      setTableData(currentData);
      setIsEditMode(true);
      setIsOpen(true);
    };

    document.addEventListener('openTableEditor', handleTableEdit as EventListener);
    return () => document.removeEventListener('openTableEditor', handleTableEdit as EventListener);
  }, []);

  // Initialize existing tables when component mounts
  useEffect(() => {
    const editor = document.querySelector('.editor-content') as HTMLElement;
    if (editor) {
      TableEditService.initializeExistingTables(editor);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  // Quick table grid (5x5)
  const renderQuickGrid = () => {
    const grid = [];
    for (let row = 1; row <= 5; row++) {
      for (let col = 1; col <= 5; col++) {
        grid.push(
          <div
            key={`${row}-${col}`}
            className="grid-editor__grid-cell"
            onClick={() => handleQuickInsert(row, col)}
            title={`${row} × ${col} table`}
          />
        );
      }
    }
    return grid;
  };

  // If in modal mode, render only the panel content
  if (isModal) {
    return (
      <div className="grid-editor__panel">
        <div className="grid-editor__header">
          <h3 className="grid-editor__title">
            {isEditMode ? 'Edit Table' : 'Insert Table'}
          </h3>
        </div>

        {error && (
          <div className="grid-editor__error">
            {error}
          </div>
        )}

        {/* Quick Grid Selector */}
        <div className="grid-editor__section">
          <label className="grid-editor__section-title">Quick Insert</label>
          <div className="grid-editor__grid">
            {renderQuickGrid()}
          </div>
          <p className="grid-editor__grid-hint">Click to insert table</p>
        </div>

        {/* Custom Table Options */}
        <div className="grid-editor__section">
          <label className="grid-editor__section-title">Custom Table</label>
          
          <div className="grid-editor__form">
            <div className="grid-editor__row">
              <div className="grid-editor__field">
                <label htmlFor="table-rows" className="grid-editor__field-label">
                  Rows
                </label>
                <input
                  id="table-rows"
                  type="number"
                  min="1"
                  max="20"
                  value={tableData.rows}
                  onChange={(e) => setTableData(prev => ({ 
                    ...prev, 
                    rows: Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                  }))}
                  className="grid-editor__input"
                />
              </div>
              
              <div className="grid-editor__field">
                <label htmlFor="table-columns" className="grid-editor__field-label">
                  Columns
                </label>
                <input
                  id="table-columns"
                  type="number"
                  min="1"
                  max="10"
                  value={tableData.columns}
                  onChange={(e) => setTableData(prev => ({ 
                    ...prev, 
                    columns: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                  }))}
                  className="grid-editor__input"
                />
              </div>
            </div>

            <div className="grid-editor__field">
              <label className="grid-editor__checkbox-label">
                <input
                  type="checkbox"
                  checked={tableData.hasHeader}
                  onChange={(e) => setTableData(prev => ({ 
                    ...prev, 
                    hasHeader: e.target.checked 
                  }))}
                  className="grid-editor__checkbox"
                />
                Include header row
              </label>
            </div>

            <div className="grid-editor__field">
              <label htmlFor="table-border" className="grid-editor__field-label">
                Border Style
              </label>
              <select
                id="table-border"
                value={tableData.borderStyle}
                onChange={(e) => setTableData(prev => ({ 
                  ...prev, 
                  borderStyle: e.target.value as TableData['borderStyle']
                }))}
                className="grid-editor__select"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="none">None</option>
              </select>
            </div>

            <div className="grid-editor__field">
              <label htmlFor="table-alignment" className="grid-editor__field-label">
                Alignment
              </label>
              <select
                id="table-alignment"
                value={tableData.alignment}
                onChange={(e) => setTableData(prev => ({ 
                  ...prev, 
                  alignment: e.target.value as TableData['alignment']
                }))}
                className="grid-editor__select"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid-editor__actions">
          <button
            type="button"
            onClick={() => onClose?.()}
            className="grid-editor__button grid-editor__button--secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateTable}
            disabled={isCreating}
            className="grid-editor__button grid-editor__button--primary"
          >
            {isCreating ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Table' : 'Insert Table')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-editor" ref={dropdownRef}>
      <button
        ref={triggerRef}
        className={`grid-editor__trigger ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        type="button"
        aria-label="Insert grid"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Insert Grid"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      </button>

      {isOpen && (
        <div 
          className="grid-editor__panel"
          style={{
            top: `${panelPosition.top}px`,
            left: `${panelPosition.left}px`
          }}
        >
          <div className="grid-editor__header">
            <h3 className="grid-editor__title">
              {isEditMode ? 'Edit Table' : 'Insert Table'}
            </h3>
          </div>

          {error && (
            <div className="grid-editor__error">
              {error}
            </div>
          )}

          {/* Quick Grid Selector */}
          <div className="grid-editor__section">
            <label className="grid-editor__section-title">Quick Insert</label>
            <div className="grid-editor__grid">
              {renderQuickGrid()}
            </div>
            <p className="grid-editor__grid-hint">Click to insert table</p>
          </div>

          {/* Custom Table Options */}
          <div className="grid-editor__section">
            <label className="grid-editor__section-title">Custom Table</label>
            
            <div className="grid-editor__form">
              <div className="grid-editor__row">
                <div className="grid-editor__field">
                  <label htmlFor="table-rows" className="grid-editor__field-label">
                    Rows
                  </label>
                  <input
                    id="table-rows"
                    type="number"
                    min="1"
                    max="20"
                    value={tableData.rows}
                    onChange={(e) => setTableData(prev => ({ 
                      ...prev, 
                      rows: Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                    }))}
                    className="grid-editor__input"
                  />
                </div>
                
                <div className="grid-editor__field">
                  <label htmlFor="table-columns" className="grid-editor__field-label">
                    Columns
                  </label>
                  <input
                    id="table-columns"
                    type="number"
                    min="1"
                    max="10"
                    value={tableData.columns}
                    onChange={(e) => setTableData(prev => ({ 
                      ...prev, 
                      columns: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                    }))}
                    className="grid-editor__input"
                  />
                </div>
              </div>

              <div className="grid-editor__field">
                <label className="grid-editor__checkbox-label">
                  <input
                    type="checkbox"
                    checked={tableData.hasHeader}
                    onChange={(e) => setTableData(prev => ({ 
                      ...prev, 
                      hasHeader: e.target.checked 
                    }))}
                    className="grid-editor__checkbox"
                  />
                  Include header row
                </label>
              </div>

              <div className="grid-editor__field">
                <label htmlFor="table-border" className="grid-editor__field-label">
                  Border Style
                </label>
                <select
                  id="table-border"
                  value={tableData.borderStyle}
                  onChange={(e) => setTableData(prev => ({ 
                    ...prev, 
                    borderStyle: e.target.value as TableData['borderStyle']
                  }))}
                  className="grid-editor__select"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div className="grid-editor__field">
                <label htmlFor="table-alignment" className="grid-editor__field-label">
                  Alignment
                </label>
                <select
                  id="table-alignment"
                  value={tableData.alignment}
                  onChange={(e) => setTableData(prev => ({ 
                    ...prev, 
                    alignment: e.target.value as TableData['alignment']
                  }))}
                  className="grid-editor__select"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid-editor__actions">
            <button
              type="button"
              onClick={() => isModal ? onClose?.() : setIsOpen(false)}
              className="grid-editor__button grid-editor__button--secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateTable}
              disabled={isCreating}
              className="grid-editor__button grid-editor__button--primary"
            >
              {isCreating ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Table' : 'Insert Table')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableEditor;
