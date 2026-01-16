/**
 * Table Edit Service - Handles table modification operations
 * Following the development methodology for content persistence and re-editing
 */

export interface TableEditData {
  rows: number;
  columns: number;
  hasHeader: boolean;
  borderStyle: 'none' | 'solid' | 'dashed';
  alignment: 'left' | 'center' | 'right';
  borderColor?: string;
  headerBackgroundColor?: string;
  cellBackgroundColor?: string;
  textColor?: string;
}

export class TableEditService {
  /**
   * Add rows to existing table
   */
  static addRows(table: HTMLTableElement, count: number, position: 'top' | 'bottom' = 'bottom'): void {
    const tbody = table.querySelector('tbody') || table;
    const existingRow = tbody.querySelector('tr');
    if (!existingRow) return;

    const columnCount = existingRow.children.length;

    for (let i = 0; i < count; i++) {
      const newRow = document.createElement('tr');
      
      for (let j = 0; j < columnCount; j++) {
        const cell = document.createElement('td');
        cell.innerHTML = '&nbsp;';
        newRow.appendChild(cell);
      }

      if (position === 'top') {
        tbody.insertBefore(newRow, tbody.firstChild);
      } else {
        tbody.appendChild(newRow);
      }
    }

    this.updateTableData(table);
    this.triggerContentChange(table);
  }

  /**
   * Add columns to existing table
   */
  static addColumns(table: HTMLTableElement, count: number, position: 'left' | 'right' = 'right'): void {
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
      for (let i = 0; i < count; i++) {
        const cell = document.createElement(row.parentElement?.tagName === 'THEAD' ? 'th' : 'td');
        cell.innerHTML = '&nbsp;';
        
        if (position === 'left') {
          row.insertBefore(cell, row.firstChild);
        } else {
          row.appendChild(cell);
        }
      }
    });

    this.updateTableData(table);
    this.triggerContentChange(table);
  }

  /**
   * Remove rows from table
   */
  static removeRows(table: HTMLTableElement, count: number, position: 'top' | 'bottom' = 'bottom'): void {
    const tbody = table.querySelector('tbody') || table;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    if (rows.length <= count) return; // Don't remove all rows

    for (let i = 0; i < count && rows.length > 1; i++) {
      const rowToRemove = position === 'top' ? rows[i] : rows[rows.length - 1 - i];
      if (rowToRemove) {
        rowToRemove.remove();
      }
    }

    this.updateTableData(table);
    this.triggerContentChange(table);
  }

  /**
   * Remove columns from table
   */
  static removeColumns(table: HTMLTableElement, count: number, position: 'left' | 'right' = 'right'): void {
    const rows = table.querySelectorAll('tr');
    const firstRow = rows[0];
    if (!firstRow || firstRow.children.length <= count) return; // Don't remove all columns

    rows.forEach(row => {
      for (let i = 0; i < count && row.children.length > 1; i++) {
        const cellToRemove = position === 'left' ? row.firstElementChild : row.lastElementChild;
        if (cellToRemove) {
          cellToRemove.remove();
        }
      }
    });

    this.updateTableData(table);
    this.triggerContentChange(table);
  }

  /**
   * Get current table data from DOM element
   */
  static getTableData(table: HTMLTableElement): TableEditData {
    const rows = table.querySelectorAll('tbody tr, tr');
    const firstRow = rows[0];
    const columns = firstRow ? firstRow.children.length : 0;
    
    // Check if table has header
    const hasHeader = !!table.querySelector('thead') || 
                     (firstRow && Array.from(firstRow.children).some(cell => cell.tagName === 'TH'));

    // Get border style from table or first cell
    const borderStyle = this.getBorderStyle(table);
    
    // Get alignment
    const alignment = this.getTableAlignment(table);

    return {
      rows: rows.length,
      columns,
      hasHeader,
      borderStyle,
      alignment,
      borderColor: this.getBorderColor(table),
      headerBackgroundColor: this.getHeaderBackgroundColor(table),
      cellBackgroundColor: this.getCellBackgroundColor(table),
      textColor: this.getTextColor(table)
    };
  }

  /**
   * Update table structure based on new data
   */
  static updateTableStructure(table: HTMLTableElement, newData: TableEditData): void {
    const currentData = this.getTableData(table);
    
    // Adjust rows
    if (newData.rows > currentData.rows) {
      this.addRows(table, newData.rows - currentData.rows);
    } else if (newData.rows < currentData.rows) {
      this.removeRows(table, currentData.rows - newData.rows);
    }

    // Adjust columns
    if (newData.columns > currentData.columns) {
      this.addColumns(table, newData.columns - currentData.columns);
    } else if (newData.columns < currentData.columns) {
      this.removeColumns(table, currentData.columns - newData.columns);
    }

    // Update header
    this.updateTableHeader(table, newData.hasHeader);
    
    // Update styling
    this.updateTableStyling(table, newData);
    
    // Save data to attributes for persistence
    this.saveDataToAttributes(table, newData);
    
    this.triggerContentChange(table);
  }

  /**
   * Update table header structure
   */
  private static updateTableHeader(table: HTMLTableElement, hasHeader: boolean): void {
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody') || table;
    const firstRow = tbody.querySelector('tr');

    if (hasHeader && !thead && firstRow) {
      // Convert first row to header
      const newThead = document.createElement('thead');
      const headerRow = firstRow.cloneNode(true) as HTMLTableRowElement;
      
      // Convert td to th
      Array.from(headerRow.children).forEach(cell => {
        if (cell.tagName === 'TD') {
          const th = document.createElement('th');
          th.innerHTML = cell.innerHTML;
          headerRow.replaceChild(th, cell);
        }
      });
      
      newThead.appendChild(headerRow);
      table.insertBefore(newThead, tbody);
      firstRow.remove();
    } else if (!hasHeader && thead) {
      // Convert header back to regular row
      const headerRow = thead.querySelector('tr');
      if (headerRow) {
        const newRow = document.createElement('tr');
        
        // Convert th to td
        Array.from(headerRow.children).forEach(cell => {
          if (cell.tagName === 'TH') {
            const td = document.createElement('td');
            td.innerHTML = cell.innerHTML;
            newRow.appendChild(td);
          }
        });
        
        tbody.insertBefore(newRow, tbody.firstChild);
      }
      thead.remove();
    }
  }

  /**
   * Update table styling
   */
  private static updateTableStyling(table: HTMLTableElement, data: TableEditData): void {
    // Update border style
    table.style.borderCollapse = 'collapse';
    const borderColor = data.borderColor || '#ccc';
    const borderValue = data.borderStyle === 'none' ? 'none' : `1px ${data.borderStyle} ${borderColor}`;
    
    table.style.border = borderValue;
    
    // Update cells
    const cells = table.querySelectorAll('td, th');
    cells.forEach(cell => {
      const htmlCell = cell as HTMLElement;
      htmlCell.style.border = borderValue;
      htmlCell.style.padding = '8px';
      
      // Apply colors
      if (data.textColor) {
        htmlCell.style.color = data.textColor;
      }
      
      if (cell.tagName === 'TH' && data.headerBackgroundColor) {
        htmlCell.style.backgroundColor = data.headerBackgroundColor;
      } else if (cell.tagName === 'TD' && data.cellBackgroundColor) {
        htmlCell.style.backgroundColor = data.cellBackgroundColor;
      }
    });

    // Update alignment
    table.style.textAlign = data.alignment;
    if (data.alignment === 'center') {
      table.style.marginLeft = 'auto';
      table.style.marginRight = 'auto';
    } else {
      table.style.marginLeft = data.alignment === 'right' ? 'auto' : '0';
      table.style.marginRight = data.alignment === 'left' ? 'auto' : '0';
    }
  }

  /**
   * Save table data to HTML attributes for persistence
   */
  private static saveDataToAttributes(table: HTMLTableElement, data: TableEditData): void {
    table.setAttribute('data-rows', data.rows.toString());
    table.setAttribute('data-columns', data.columns.toString());
    table.setAttribute('data-has-header', data.hasHeader.toString());
    table.setAttribute('data-border-style', data.borderStyle);
    table.setAttribute('data-alignment', data.alignment);
    table.setAttribute('data-component-type', 'table');
    
    // Save color attributes
    if (data.borderColor) table.setAttribute('data-border-color', data.borderColor);
    if (data.headerBackgroundColor) table.setAttribute('data-header-bg-color', data.headerBackgroundColor);
    if (data.cellBackgroundColor) table.setAttribute('data-cell-bg-color', data.cellBackgroundColor);
    if (data.textColor) table.setAttribute('data-text-color', data.textColor);
  }

  /**
   * Update table data attributes after modification
   */
  private static updateTableData(table: HTMLTableElement): void {
    const currentData = this.getTableData(table);
    this.saveDataToAttributes(table, currentData);
  }

  /**
   * Get border style from table
   */
  private static getBorderStyle(table: HTMLTableElement): 'none' | 'solid' | 'dashed' {
    const borderStyle = table.style.borderStyle || 
                       getComputedStyle(table).borderStyle ||
                       table.getAttribute('data-border-style');
    
    if (borderStyle === 'dashed') return 'dashed';
    if (borderStyle === 'none') return 'none';
    return 'solid';
  }

  /**
   * Get table alignment
   */
  private static getTableAlignment(table: HTMLTableElement): 'left' | 'center' | 'right' {
    const alignment = table.getAttribute('data-alignment') ||
                     table.style.textAlign;
    
    if (alignment === 'center') return 'center';
    if (alignment === 'right') return 'right';
    return 'left';
  }

  /**
   * Get border color from table
   */
  private static getBorderColor(table: HTMLTableElement): string {
    return table.getAttribute('data-border-color') ||
           getComputedStyle(table).borderColor ||
           '#ccc';
  }

  /**
   * Get header background color
   */
  private static getHeaderBackgroundColor(table: HTMLTableElement): string {
    const headerCell = table.querySelector('th');
    return table.getAttribute('data-header-bg-color') ||
           (headerCell ? getComputedStyle(headerCell).backgroundColor : '') ||
           '#f9fafb';
  }

  /**
   * Get cell background color
   */
  private static getCellBackgroundColor(table: HTMLTableElement): string {
    const cell = table.querySelector('td');
    return table.getAttribute('data-cell-bg-color') ||
           (cell ? getComputedStyle(cell).backgroundColor : '') ||
           '#ffffff';
  }

  /**
   * Get text color
   */
  private static getTextColor(table: HTMLTableElement): string {
    const cell = table.querySelector('td, th');
    return table.getAttribute('data-text-color') ||
           (cell ? getComputedStyle(cell).color : '') ||
           '#000000';
  }

  /**
   * Trigger content change event for editor
   */
  private static triggerContentChange(table: HTMLTableElement): void {
    const editor = table.closest('[contenteditable="true"]') as HTMLElement;
    if (editor) {
      const event = new Event('input', { bubbles: true });
      editor.dispatchEvent(event);
    }
  }

  /**
   * Initialize existing tables with edit functionality
   */
  static initializeExistingTables(container: HTMLElement): void {
    const tables = container.querySelectorAll('table[data-component-type="table"]');
    tables.forEach(table => {
      this.attachContextMenu(table as HTMLTableElement);
    });
  }

  /**
   * Attach context menu to table
   */
  static attachContextMenu(table: HTMLTableElement): void {
    table.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(table, e.clientX, e.clientY, e);
    });
  }

  /**
   * Show context menu for table editing
   */
  private static showContextMenu(table: HTMLTableElement, x: number, y: number, event?: MouseEvent): void {
    // Remove existing context menu
    const existingMenu = document.querySelector('.table-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'table-context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.zIndex = '10000';
    menu.style.backgroundColor = 'white';
    menu.style.border = '1px solid #ccc';
    menu.style.borderRadius = '4px';
    menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    menu.style.padding = '4px 0';
    menu.style.minWidth = '150px';

    // Get clicked cell for cell-specific options
    const clickedCell = event ? (event.target as Element).closest('td, th') as HTMLTableCellElement : null;
    
    // Menu items
    const menuItems = [
      { label: 'Edit Table', action: () => this.openTableEditor(table) },
      { label: 'Table Colors', action: () => this.openColorEditor(table) },
      ...(clickedCell ? [{ label: 'Cell Color', action: () => this.openCellColorEditor(clickedCell) }] : []),
      { label: '---', action: null }, // Separator
      { label: 'Add Row Above', action: () => this.addRows(table, 1, 'top') },
      { label: 'Add Row Below', action: () => this.addRows(table, 1, 'bottom') },
      { label: 'Add Column Left', action: () => this.addColumns(table, 1, 'left') },
      { label: 'Add Column Right', action: () => this.addColumns(table, 1, 'right') },
      { label: 'Remove Row', action: () => this.removeRows(table, 1) },
      { label: 'Remove Column', action: () => this.removeColumns(table, 1) }
    ];

    menuItems.forEach(item => {
      if (item.label === '---') {
        // Add separator
        const separator = document.createElement('div');
        separator.style.height = '1px';
        separator.style.backgroundColor = '#e0e0e0';
        separator.style.margin = '4px 0';
        menu.appendChild(separator);
        return;
      }
      
      const menuItem = document.createElement('div');
      menuItem.textContent = item.label;
      menuItem.style.padding = '8px 16px';
      menuItem.style.cursor = 'pointer';
      menuItem.style.fontSize = '14px';
      
      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.backgroundColor = '#f0f0f0';
      });
      
      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.backgroundColor = 'transparent';
      });
      
      if (item.action) {
        menuItem.addEventListener('click', () => {
          item.action!();
          menu.remove();
        });
      }
      
      menu.appendChild(menuItem);
    });

    document.body.appendChild(menu);

    // Remove menu when clicking outside
    const removeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove();
        document.removeEventListener('click', removeMenu);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', removeMenu);
    }, 0);
  }

  /**
   * Open table editor dialog for existing table
   */
  private static openTableEditor(table: HTMLTableElement): void {
    const currentData = this.getTableData(table);
    
    // Dispatch custom event to open table editor with current data
    const event = new CustomEvent('openTableEditor', {
      detail: { table, currentData }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Open color editor for table
   */
  private static openColorEditor(table: HTMLTableElement): void {
    const currentData = this.getTableData(table);
    
    // Dispatch custom event to open color editor
    const event = new CustomEvent('openTableColorEditor', {
      detail: { table, currentData }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Apply colors to table
   */
  static applyTableColors(table: HTMLTableElement, colors: {
    borderColor?: string;
    headerBackgroundColor?: string;
    cellBackgroundColor?: string;
    textColor?: string;
  }): void {
    const currentData = this.getTableData(table);
    const updatedData = { ...currentData, ...colors };
    
    this.updateTableStyling(table, updatedData);
    this.saveDataToAttributes(table, updatedData);
    this.triggerContentChange(table);
  }

  /**
   * Apply colors to individual cell
   */
  static applyCellColors(cell: HTMLTableCellElement, colors: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  }): void {
    if (colors.backgroundColor) {
      cell.style.backgroundColor = colors.backgroundColor;
      cell.setAttribute('data-cell-bg-color', colors.backgroundColor);
    }
    if (colors.textColor) {
      cell.style.color = colors.textColor;
      cell.setAttribute('data-cell-text-color', colors.textColor);
    }
    if (colors.borderColor) {
      cell.style.borderColor = colors.borderColor;
      cell.setAttribute('data-cell-border-color', colors.borderColor);
    }
    
    const table = cell.closest('table') as HTMLTableElement;
    if (table) {
      this.triggerContentChange(table);
    }
  }

  /**
   * Get current cell colors
   */
  static getCellColors(cell: HTMLTableCellElement): {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  } {
    return {
      backgroundColor: cell.getAttribute('data-cell-bg-color') || 
                      getComputedStyle(cell).backgroundColor || '#ffffff',
      textColor: cell.getAttribute('data-cell-text-color') || 
                getComputedStyle(cell).color || '#000000',
      borderColor: cell.getAttribute('data-cell-border-color') || 
                  getComputedStyle(cell).borderColor || '#ccc'
    };
  }

  /**
   * Open cell color editor
   */
  private static openCellColorEditor(cell: HTMLTableCellElement): void {
    const currentColors = this.getCellColors(cell);
    
    const event = new CustomEvent('openCellColorEditor', {
      detail: { cell, currentColors }
    });
    
    document.dispatchEvent(event);
  }
}
