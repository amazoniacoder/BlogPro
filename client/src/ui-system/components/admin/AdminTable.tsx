/**
 * BlogPro Admin Table Component
 * Responsive table with mobile card layout
 */

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../icons/components';
import { useIsMobile } from '@/hooks/use-mobile';

export interface AdminTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface AdminTableAction {
  key: string;
  label: string;
  icon: string;
  variant?: 'edit' | 'delete' | 'primary' | 'secondary';
  onClick: (row: any) => void;
}

export interface AdminTableProps {
  columns: AdminTableColumn[];
  data: any[];
  actions?: AdminTableAction[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  imageField?: string;
  titleField?: string;
  subtitleField?: string;
  mobileInfoFields?: { key: string; label: string }[];
  className?: string;
}

export const AdminTable: React.FC<AdminTableProps> = ({
  columns,
  data,
  actions = [],
  sortField,
  sortDirection = 'asc',
  onSort,
  imageField,
  titleField,
  subtitleField,
  mobileInfoFields = [],
  className = ''
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenuId]);

  const handleSort = (field: string) => {
    if (!onSort) return;
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(field, newDirection);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const tableClasses = ['admin-table-container', className].filter(Boolean).join(' ');

  if (data.length === 0) {
    return (
      <div className={tableClasses}>
        <div className="admin-table__empty">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={tableClasses}>
      <table className="admin-table">
        <thead className="admin-table__head">
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={`admin-table__header-cell ${column.sortable ? 'admin-table__header-cell--sortable' : ''}`}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                {column.label} {column.sortable && getSortIcon(column.key)}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="admin-table__header-cell">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index} className="admin-table__row">
              {columns.map(column => (
                <td
                  key={column.key}
                  className={`admin-table__cell ${column.key === imageField ? 'admin-table__cell--thumbnail' : ''}`}
                  data-label={column.label}
                >
                  {column.key === imageField ? (
                    <div className="admin-table__thumbnail">
                      {row[column.key] ? (
                        <img
                          src={row[column.key]}
                          alt={row[titleField || 'title']}
                          className="admin-table__thumbnail-image"
                        />
                      ) : (
                        <div className="admin-table__thumbnail-placeholder">📄</div>
                      )}
                      {isMobile && actions.length > 0 && (
                        <>
                          {/* Info button */}
                          {mobileInfoFields.length > 0 && (
                            <>
                              <button
                                className="admin-mobile-info-toggle"
                                onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                                aria-label="Show info"
                              >
                                <Icon name="info" size={16} />
                              </button>
                              {openMenuId === row.id && (
                                <div ref={menuRef} className="admin-mobile-info-menu">
                                  {mobileInfoFields.map(field => {
                                    const column = columns.find(col => col.key === field.key);
                                    const value = column?.render ? column.render(row[field.key], row) : row[field.key];
                                    return (
                                      <div key={field.key} className="admin-mobile-info-item">
                                        <strong>{field.label}:</strong> {value}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          )}
                          {/* Action buttons */}
                          <div className="admin-mobile-actions">
                            {actions.map(action => (
                              <button
                                key={action.key}
                                className={`admin-mobile-action-button admin-mobile-action-button--${action.variant || 'primary'}`}
                                onClick={() => action.onClick(row)}
                                aria-label={action.label}
                              >
                                <Icon name={action.icon as any} size={14} />
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : column.key === titleField ? (
                    <div className="admin-table__content">
                      <div className="admin-table__content-title">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </div>
                      {subtitleField && (
                        <div className="admin-table__content-subtitle">
                          {row[subtitleField]}
                        </div>
                      )}
                    </div>
                  ) : (
                    column.render ? column.render(row[column.key], row) : row[column.key]
                  )}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="admin-table__cell admin-table__cell--actions" data-label="Actions">
                  {!isMobile && (
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                      {actions.map(action => (
                        <button
                          key={action.key}
                          className={`admin-button admin-button--${action.variant || 'primary'}`}
                          title={action.label}
                          onClick={() => action.onClick(row)}
                        >
                          <Icon name={action.icon as any} size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
