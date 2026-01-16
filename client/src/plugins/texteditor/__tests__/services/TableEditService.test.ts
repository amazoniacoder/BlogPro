/**
 * TableEditService tests
 */

import { TableEditService } from '../../core/services/TableEditService';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

describe('TableEditService', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="editor-content"></div>';
    vi.clearAllMocks();
  });

  test('should get table data from DOM element', () => {
    const table = document.createElement('table');
    table.setAttribute('data-component-type', 'table');
    table.setAttribute('data-rows', '3');
    table.setAttribute('data-columns', '2');
    table.setAttribute('data-has-header', 'true');
    table.setAttribute('data-border-style', 'solid');
    table.setAttribute('data-alignment', 'center');

    // Create table structure
    const tbody = document.createElement('tbody');
    for (let i = 0; i < 3; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < 2; j++) {
        const cell = document.createElement(i === 0 ? 'th' : 'td');
        cell.textContent = `Cell ${i}-${j}`;
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
    table.appendChild(tbody);

    const tableData = TableEditService.getTableData(table);

    expect(tableData.rows).toBe(3);
    expect(tableData.columns).toBe(2);
    expect(tableData.hasHeader).toBe(true);
    expect(tableData.borderStyle).toBe('solid');
    expect(tableData.alignment).toBe('center');
  });

  test('should add rows to table', () => {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    
    // Create initial row
    const row = document.createElement('tr');
    const cell1 = document.createElement('td');
    const cell2 = document.createElement('td');
    row.appendChild(cell1);
    row.appendChild(cell2);
    tbody.appendChild(row);
    table.appendChild(tbody);

    TableEditService.addRows(table, 2, 'bottom');

    const rows = table.querySelectorAll('tr');
    expect(rows.length).toBe(3);
    
    // Check that new rows have correct number of columns
    const lastRow = rows[rows.length - 1];
    expect(lastRow.children.length).toBe(2);
  });

  test('should add columns to table', () => {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    
    // Create initial row with 2 columns
    const row = document.createElement('tr');
    const cell1 = document.createElement('td');
    const cell2 = document.createElement('td');
    row.appendChild(cell1);
    row.appendChild(cell2);
    tbody.appendChild(row);
    table.appendChild(tbody);

    TableEditService.addColumns(table, 1, 'right');

    const updatedRow = table.querySelector('tr');
    expect(updatedRow?.children.length).toBe(3);
  });

  test('should attach context menu to table', () => {
    const table = document.createElement('table');
    const addEventListenerSpy = vi.spyOn(table, 'addEventListener');

    TableEditService.attachContextMenu(table);

    expect(addEventListenerSpy).toHaveBeenCalledWith('contextmenu', expect.any(Function));
  });

  test('should initialize existing tables', () => {
    const container = document.createElement('div');
    const table = document.createElement('table');
    table.setAttribute('data-component-type', 'table');
    container.appendChild(table);

    const attachContextMenuSpy = vi.spyOn(TableEditService, 'attachContextMenu');

    TableEditService.initializeExistingTables(container);

    expect(attachContextMenuSpy).toHaveBeenCalledWith(table);
  });
});
