/**
 * BlogPro Filter Panel Pattern
 * Universal filtering interface component
 */

import React from 'react';
import { Card, FormField, Input, Button, Checkbox, DatePicker } from '../../components';
import { BasicSelect } from '../../components/form';
import { Icon } from '../../icons/components';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'date' | 'daterange';
  options?: FilterOption[];
  placeholder?: string;
}

export interface FilterPanelProps {
  fields: FilterField[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onApply: () => void;
  onReset: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  values,
  onChange,
  onApply,
  onReset,
  collapsed = false,
  onToggle,
  className = ''
}) => {
  const panelClasses = [
    'filter-panel',
    collapsed && 'filter-panel--collapsed',
    className
  ].filter(Boolean).join(' ');

  const renderField = (field: FilterField) => {
    const value = values[field.key];

    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'select':
        return (
          <BasicSelect
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
          >
            <option value="">All</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </BasicSelect>
        );

      case 'checkbox':
        return (
          <div className="filter-panel__checkbox-group">
            {field.options?.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={value?.includes(option.value) || false}
                onChange={(e) => {
                  const currentValues = value || [];
                  const newValues = e.target.checked
                    ? [...currentValues, option.value]
                    : currentValues.filter((v: string) => v !== option.value);
                  onChange(field.key, newValues);
                }}
              />
            ))}
          </div>
        );

      case 'date':
        return (
          <DatePicker
            value={value ? new Date(value) : undefined}
            onChange={(date) => onChange(field.key, date?.toISOString())}
            placeholder={field.placeholder}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className={panelClasses}>
      <div className="filter-panel__header">
        <div className="filter-panel__title">
          <Icon name="gear" size={16} />
          Filters
        </div>
        
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="filter-panel__toggle"
          >
            <Icon name={collapsed ? 'arrow-down' : 'arrow-up'} size={16} />
          </Button>
        )}
      </div>

      {!collapsed && (
        <div className="filter-panel__content">
          <div className="filter-panel__fields">
            {fields.map((field) => (
              <FormField key={field.key} label={field.label}>
                {renderField(field)}
              </FormField>
            ))}
          </div>

          <div className="filter-panel__actions">
            <Button variant="primary" onClick={onApply}>
              Apply Filters
            </Button>
            <Button variant="ghost" onClick={onReset}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FilterPanel;
