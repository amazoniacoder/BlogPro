/**
 * BlogPro Data Table Pattern
 * Universal admin data table with actions
 */

import React from 'react';
import { Table, TableHead, TableRow, TableCell, Button, Checkbox } from '../../components';
import { Icon } from '../../icons/components';

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface DataTableAction {
  label: string;
  icon?: string;
  onClick: (row: any) => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  actions?: DataTableAction[];
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  loading?: boolean;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  actions = [],
  selectable = false,
  onSelectionChange,
  className = ''
}) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? data.map(row => row.id) : [];
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedIds, id]
      : selectedIds.filter(selectedId => selectedId !== id);
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSort = (key: string) => {
    const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  return (
    <div className={`bp-data-table ${className}`}>
      <Table bordered>
        <TableHead>
          <TableRow>
            {selectable && (
              <TableCell header>
                <Checkbox
                  checked={selectedIds.length === data.length && data.length > 0}
                  indeterminate={selectedIds.length > 0 && selectedIds.length < data.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
            )}
            
            {columns.map((column) => (
              <TableCell key={column.key} header>
                {column.sortable ? (
                  <button
                    className="data-table__sort-button"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                    {sortConfig?.key === column.key && (
                      <Icon
                        name={sortConfig.direction === 'asc' ? 'arrow-up' : 'arrow-down'}
                        size={14}
                      />
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
            
            {actions.length > 0 && (
              <TableCell header>Actions</TableCell>
            )}
          </TableRow>
        </TableHead>
        
        <tbody>
          {sortedData.map((row) => (
            <TableRow key={row.id}>
              {selectable && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(row.id)}
                    onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                  />
                </TableCell>
              )}
              
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {row[column.key]}
                </TableCell>
              ))}
              
              {actions.length > 0 && (
                <TableCell>
                  <div className="data-table__actions">
                    {actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant || 'ghost'}
                        size="sm"
                        onClick={() => action.onClick(row)}
                      >
                        {action.icon && <Icon name={action.icon as any} size={14} />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DataTable;
