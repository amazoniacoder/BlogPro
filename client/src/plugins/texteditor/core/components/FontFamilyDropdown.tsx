/**
 * FontFamilyDropdown Component
 * Accessible dropdown for font family selection with font previews
 */

import React, { useState, useRef, useEffect } from 'react';
import { FontFamily } from '../types/CoreTypes';

import './FontFamilyDropdown.css';

interface FontFamilyDropdownProps {
  currentFontFamily: FontFamily;
  onFontFamilyChange: (fontFamily: FontFamily) => void;
  disabled?: boolean;
}

export const FontFamilyDropdown: React.FC<FontFamilyDropdownProps> = ({
  currentFontFamily,
  onFontFamilyChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
    }
  };

  const handleFontFamilySelect = (fontFamily: FontFamily) => {
    onFontFamilyChange(fontFamily);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="font-family-dropdown" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`font-family-dropdown__trigger ${isOpen ? 'font-family-dropdown__trigger--open' : ''}`}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={`Font family: ${currentFontFamily}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span 
          className="font-family-dropdown__current"
          style={{ fontFamily: currentFontFamily }}
        >
          {currentFontFamily}
        </span>
        <svg
          className="font-family-dropdown__arrow"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="font-family-dropdown__menu"
          role="listbox"
          aria-label="Font family options"
        >
          {['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Roboto', 'Courier New'].map((fontFamily) => (
            <button
              key={fontFamily}
              type="button"
              className={`font-family-dropdown__option ${
                fontFamily === currentFontFamily ? 'font-family-dropdown__option--selected' : ''
              }`}
              onClick={() => handleFontFamilySelect(fontFamily as FontFamily)}
              role="option"
              aria-selected={fontFamily === currentFontFamily}
            >
              <span 
                className="font-family-dropdown__option-text"
                style={{ fontFamily: fontFamily }}
              >
                {fontFamily}
              </span>
              <span 
                className="font-family-dropdown__preview"
                style={{ fontFamily: fontFamily }}
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
