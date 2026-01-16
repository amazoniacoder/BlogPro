/**
 * Table Service - Table creation, editing, and management
 * Handles table DOM operations and formatting
 */

import { TableEditService } from './TableEditService';

export interface TableConfig {
  rows: number;
  columns: number;
  hasHeader: boolean;
  borderStyle: 'none' | 'solid' | 'dashed';
  alignment: 'left' | 'center' | 'right';
}

export interface TableCell {
  element: HTMLTableCellElement;
  row: number;
  column: number;
  isHeader: boolean;
}

export class TableService {
  /**
   * Insert table into editor at current selection
   */
  static insertTable(config: TableConfig): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    
    // Create table element
    const table = this.createTable(config);
    
    // Insert table with proper spacing
    range.deleteContents();
    
    // Create spacing elements for cursor positioning
    const beforeSpace = document.createTextNode('\u200B');
    const afterSpace = document.createTextNode('\u200B');
    
    // Insert in order: space, table, space
    range.insertNode(beforeSpace);
    range.setStartAfter(beforeSpace);
    range.insertNode(table);
    range.setStartAfter(table);
    range.insertNode(afterSpace);
    
    // Position cursor after table
    range.setStartAfter(afterSpace);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Focus first cell for editing
    setTimeout(() => {
      const firstCell = table.querySelector('td, th') as HTMLTableCellElement;
      if (firstCell) {
        firstCell.focus();
        this.selectCellContent(firstCell);
      }
    }, 10);
    
    console.log('📊 Table inserted:', config);
  }

  /**
   * Create table DOM element with configuration
   */
  private static createTable(config: TableConfig): HTMLTableElement {
    const table = document.createElement('table');
    table.className = 'editor-table';
    table.setAttribute('data-rows', config.rows.toString());
    table.setAttribute('data-columns', config.columns.toString());
    table.setAttribute('data-has-header', config.hasHeader.toString());
    table.setAttribute('data-border-style', config.borderStyle);
    table.setAttribute('data-alignment', config.alignment);
    table.setAttribute('data-component-type', 'table');
    
    // Apply table styles
    this.applyTableStyles(table, config);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Create rows
    for (let row = 0; row < config.rows; row++) {
      const tr = document.createElement('tr');
      
      // Create cells
      for (let col = 0; col < config.columns; col++) {
        const isHeaderRow = config.hasHeader && row === 0;
        const cell = document.createElement(isHeaderRow ? 'th' : 'td');
        
        // Make cells editable
        cell.contentEditable = 'true';
        cell.className = isHeaderRow ? 'editor-table__header-cell' : 'editor-table__cell';
        
        // Add placeholder content
        if (isHeaderRow) {
          cell.textContent = `Header ${col + 1}`;
        } else {
          cell.innerHTML = '<br>'; // Empty cell with line break for cursor
        }
        
        // Add cell event listeners
        this.addCellEventListeners(cell);
        
        tr.appendChild(cell);
      }
      
      tbody.appendChild(tr);
    }
    
    table.appendChild(tbody);
    
    // Add table event listeners
    this.addTableEventListeners(table);
    
    // Attach context menu for editing
    setTimeout(() => {
      TableEditService.attachContextMenu(table);
    }, 0);
    
    return table;
  }

  /**
   * Apply styles to table based on configuration
   */
  private static applyTableStyles(table: HTMLTableElement, config: TableConfig): void {
    // Base table styles
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.margin = '16px 0';
    
    // Alignment
    switch (config.alignment) {
      case 'center':
        table.style.marginLeft = 'auto';
        table.style.marginRight = 'auto';
        break;
      case 'right':
        table.style.marginLeft = 'auto';
        table.style.marginRight = '0';
        break;
      case 'left':
      default:
        table.style.marginLeft = '0';
        table.style.marginRight = 'auto';
        break;
    }
    
    // Border styles
    const borderWidth = config.borderStyle === 'none' ? '0' : '1px';
    const borderStyle = config.borderStyle === 'none' ? 'none' : config.borderStyle;
    const borderColor = '#d1d5db';
    
    table.style.border = `${borderWidth} ${borderStyle} ${borderColor}`;
    
    // Apply cell styles
    const cellStyle = `
      border: ${borderWidth} ${borderStyle} ${borderColor};
      padding: 8px 12px;
      text-align: left;
      vertical-align: top;
      min-width: 100px;
      min-height: 32px;
    `;
    
    // Add styles to head
    const styleId = 'editor-table-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      .editor-table td,
      .editor-table th {
        ${cellStyle}
      }
      
      .editor-table th {
        background-color: #f9fafb;
        font-weight: 600;
      }
      
      .editor-table td:focus,
      .editor-table th:focus {
        outline: 2px solid #3b82f6;
        outline-offset: -2px;
        background-color: #eff6ff;
      }
      
      .editor-table td:empty::before,
      .editor-table th:empty::before {
        content: '\\00a0';
        color: transparent;
      }
    `;
  }

  /**
   * Add event listeners to table cells
   */
  private static addCellEventListeners(cell: HTMLTableCellElement): void {
    // Handle Enter key to move to next row
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.moveToNextCell(cell, 'down');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.moveToNextCell(cell, e.shiftKey ? 'previous' : 'next');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.moveToNextCell(cell, 'up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.moveToNextCell(cell, 'down');
      }
    });
    
    // Handle content changes
    cell.addEventListener('input', () => {
      this.triggerContentChange(cell);
    });
    
    // Select all content on focus
    cell.addEventListener('focus', () => {
      setTimeout(() => this.selectCellContent(cell), 10);
    });
  }

  /**
   * Add event listeners to table
   */
  private static addTableEventListeners(table: HTMLTableElement): void {
    // Right-click context menu for table operations
    table.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      // TODO: Implement table context menu
      console.log('Table context menu');
    });
  }

  /**
   * Move focus to next/previous cell
   */
  private static moveToNextCell(currentCell: HTMLTableCellElement, direction: 'next' | 'previous' | 'up' | 'down'): void {
    const table = currentCell.closest('table');
    if (!table) return;
    
    const cells = Array.from(table.querySelectorAll('td, th')) as HTMLTableCellElement[];
    const currentIndex = cells.indexOf(currentCell);
    
    let targetIndex = currentIndex;
    
    switch (direction) {
      case 'next':
        targetIndex = currentIndex + 1;
        break;
      case 'previous':
        targetIndex = currentIndex - 1;
        break;
      case 'up':
        const columnsCount = table.rows[0]?.cells.length || 0;
        targetIndex = currentIndex - columnsCount;
        break;
      case 'down':
        const colsCount = table.rows[0]?.cells.length || 0;
        targetIndex = currentIndex + colsCount;
        break;
    }
    
    // Wrap around or stay in bounds
    if (targetIndex >= 0 && targetIndex < cells.length) {
      const targetCell = cells[targetIndex];
      targetCell.focus();
      this.selectCellContent(targetCell);
    }
  }

  /**
   * Select all content in a cell
   */
  private static selectCellContent(cell: HTMLTableCellElement): void {
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(cell);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Trigger content change event
   */
  private static triggerContentChange(element: HTMLElement): void {
    const editor = element.closest('[contenteditable="true"]') as HTMLElement;
    if (editor) {
      const event = new Event('input', { bubbles: true });
      editor.dispatchEvent(event);
    }
  }

  /**
   * Initialize existing tables in editor
   */
  static initializeExistingTables(editorElement: HTMLElement): void {
    const tables = editorElement.querySelectorAll('table.editor-table, table[data-component-type="table"]');
    
    tables.forEach(table => {
      const htmlTable = table as HTMLTableElement;
      
      // Re-apply event listeners to cells
      const cells = htmlTable.querySelectorAll('td, th') as NodeListOf<HTMLTableCellElement>;
      cells.forEach(cell => {
        this.addCellEventListeners(cell);
      });
      
      // Re-apply table event listeners
      this.addTableEventListeners(htmlTable);
      
      // Initialize editing functionality
      TableEditService.attachContextMenu(htmlTable);
      
      console.log('📊 Initialized existing table with editing support');
    });
  }

  /**
   * Add row to table
   */
  static addRow(table: HTMLTableElement, position: 'before' | 'after', referenceRow: HTMLTableRowElement): void {
    const newRow = document.createElement('tr');
    const columnCount = referenceRow.cells.length;
    
    for (let i = 0; i < columnCount; i++) {
      const cell = document.createElement('td');
      cell.contentEditable = 'true';
      cell.className = 'editor-table__cell';
      cell.innerHTML = '<br>';
      this.addCellEventListeners(cell);
      newRow.appendChild(cell);
    }
    
    if (position === 'after') {
      referenceRow.parentNode?.insertBefore(newRow, referenceRow.nextSibling);
    } else {
      referenceRow.parentNode?.insertBefore(newRow, referenceRow);
    }
    
    this.triggerContentChange(table);
  }

  /**
   * Add column to table
   */
  static addColumn(table: HTMLTableElement, position: 'before' | 'after', columnIndex: number): void {
    const rows = table.querySelectorAll('tr');
    
    rows.forEach((row, rowIndex) => {
      const isHeaderRow = rowIndex === 0 && table.querySelector('th');
      const cell = document.createElement(isHeaderRow ? 'th' : 'td');
      
      cell.contentEditable = 'true';
      cell.className = isHeaderRow ? 'editor-table__header-cell' : 'editor-table__cell';
      
      if (isHeaderRow) {
        cell.textContent = `Header ${columnIndex + 1}`;
      } else {
        cell.innerHTML = '<br>';
      }
      
      this.addCellEventListeners(cell);
      
      const referenceCell = row.cells[columnIndex];
      if (position === 'after' && referenceCell.nextSibling) {
        row.insertBefore(cell, referenceCell.nextSibling);
      } else if (position === 'before') {
        row.insertBefore(cell, referenceCell);
      } else {
        row.appendChild(cell);
      }
    });
    
    this.triggerContentChange(table);
  }

  /**
   * Delete row from table
   */
  static deleteRow(row: HTMLTableRowElement): void {
    const table = row.closest('table') as HTMLTableElement;
    if (table && table.rows.length > 1) {
      row.remove();
      this.triggerContentChange(table);
    }
  }

  /**
   * Delete column from table
   */
  static deleteColumn(table: HTMLTableElement, columnIndex: number): void {
    if (table.rows[0]?.cells.length > 1) {
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        if (row.cells[columnIndex]) {
          row.cells[columnIndex].remove();
        }
      });
      this.triggerContentChange(table);
    }
  }
}
