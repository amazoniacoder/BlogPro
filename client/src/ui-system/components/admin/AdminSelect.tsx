import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface AdminSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

export const AdminSelect: React.FC<AdminSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false
}) => {
  return (
    <div className="admin-select">
      {label && (
        <label className="admin-select__label">
          {label}
        </label>
      )}
      <select
        className="admin-select__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};