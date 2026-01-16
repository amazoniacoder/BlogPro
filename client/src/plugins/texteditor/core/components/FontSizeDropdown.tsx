import React, { useState, useRef, useEffect } from 'react';
import { FontSize } from '../types/CoreTypes';

import './FontSizeDropdown.css';

interface FontSizeDropdownProps {
  currentFontSize: FontSize;
  onFontSizeChange: (fontSize: FontSize) => void;
  disabled?: boolean;
}

export const FontSizeDropdown: React.FC<FontSizeDropdownProps> = ({
  currentFontSize,
  onFontSizeChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFontSizeSelect = (fontSize: FontSize) => {
    onFontSizeChange(fontSize);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const formatFontSizeDisplay = (fontSize: FontSize): string => {
    return fontSize.replace('pt', '');
  };

  return (
    <div className="font-size-dropdown" ref={dropdownRef}>
      <button
        className={`font-size-dropdown__trigger ${isOpen ? 'font-size-dropdown__trigger--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={`Font size: ${formatFontSizeDisplay(currentFontSize)}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
      >
        <span className="font-size-dropdown__current">
          {formatFontSizeDisplay(currentFontSize)}
        </span>
        <svg 
          className="font-size-dropdown__arrow" 
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </button>

      {isOpen && (
        <div 
          className="font-size-dropdown__menu"
          role="listbox"
          aria-label="Font size options"
        >
          {['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'].map((fontSize) => (
            <button
              key={fontSize}
              className={`font-size-dropdown__option ${
                fontSize === currentFontSize ? 'font-size-dropdown__option--selected' : ''
              }`}
              onClick={() => handleFontSizeSelect(fontSize as FontSize)}
              role="option"
              aria-selected={fontSize === currentFontSize}
              type="button"
            >
              <span className="font-size-dropdown__option-text">
                {formatFontSizeDisplay(fontSize as FontSize)}
              </span>
              <span 
                className="font-size-dropdown__option-preview"
                style={{ fontSize }}
              >
                Aa
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
