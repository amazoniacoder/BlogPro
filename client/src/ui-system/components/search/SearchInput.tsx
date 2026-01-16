/**
 * BlogPro Search Input Component
 * Universal search input for frontend and admin
 */

import React, { useState, useRef } from 'react';
import { Icon } from '../../icons/components';
import { useTranslation } from '@/hooks/useTranslation';
import './search.css';

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  variant?: 'default' | 'compact' | 'admin';
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  value = '',
  onChange,
  onSearch,
  onFocus,
  onBlur,
  variant = 'default',
  className = '',
  disabled = false,
  autoFocus = false
}) => {
  const { t } = useTranslation('blog');
  const [inputValue, setInputValue] = useState(value);
  
  // Update internal value when external value changes
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const defaultPlaceholder = placeholder || t('searchPlaceholder');

  const searchClasses = [
    'search-input',
    `search-input--${variant}`,
    disabled && 'search-input--disabled',
    className
  ].filter(Boolean).join(' ');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(inputValue);
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    inputRef.current?.focus();
  };

  return (
    <form className={searchClasses} onSubmit={handleSubmit}>
      <div className="search-input__wrapper">
        <input
          ref={inputRef}
          type="text"
          className="search-input__field"
          placeholder={defaultPlaceholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          autoFocus={autoFocus}
        />
        
        {inputValue && (
          <button
            type="button"
            className="search-input__clear"
            onClick={handleClear}
            aria-label={t('clearSearch', 'Clear search')}
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchInput;
