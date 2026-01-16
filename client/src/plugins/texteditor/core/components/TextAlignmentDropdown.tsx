/**
 * Text Alignment Dropdown Component
 * Provides left, center, right, and justify alignment options
 */

import React, { useState, useRef, useEffect } from 'react';
import { TextAlign } from '../types/CoreTypes';
import './TextAlignmentDropdown.css';

export interface TextAlignmentDropdownProps {
  currentAlignment?: TextAlign;
  onAlignmentChange: (alignment: TextAlign) => void;
  disabled?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

interface AlignmentOption {
  value: TextAlign;
  label: string;
  icon: string;
  shortcut?: string;
}

const alignmentOptions: AlignmentOption[] = [
  { value: 'left', label: 'Align Left', icon: '⬅', shortcut: 'Ctrl+Shift+L' },
  { value: 'center', label: 'Align Center', icon: '↔', shortcut: 'Ctrl+Shift+E' },
  { value: 'right', label: 'Align Right', icon: '➡', shortcut: 'Ctrl+Shift+R' },
  { value: 'justify', label: 'Justify', icon: '≡', shortcut: 'Ctrl+Shift+J' }
];

export const TextAlignmentDropdown: React.FC<TextAlignmentDropdownProps> = ({
  currentAlignment = 'left',
  onAlignmentChange,
  disabled = false,
  onClose,
  isModal = false
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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleAlignmentSelect = (alignment: TextAlign) => {
    onAlignmentChange(alignment);
    if (isModal) {
      onClose?.();
    } else {
      setIsOpen(false);
    }
  };

  const getCurrentOption = () => {
    return alignmentOptions.find(option => option.value === currentAlignment) || alignmentOptions[0];
  };

  const currentOption = getCurrentOption();

  // If in modal mode, render only the menu content
  if (isModal) {
    return (
      <div 
        className="text-alignment-dropdown__menu"
        role="listbox"
        aria-label="Text alignment options"
      >
        {alignmentOptions.map((option) => (
          <button
            key={option.value}
            className={`text-alignment-dropdown__option ${
              option.value === currentAlignment ? 'selected' : ''
            }`}
            onClick={() => handleAlignmentSelect(option.value)}
            role="option"
            aria-selected={option.value === currentAlignment}
            type="button"
          >
            <span className="text-alignment-dropdown__option-label">
              {option.label}
            </span>
            {option.shortcut && (
              <span className="text-alignment-dropdown__option-shortcut">
                {option.shortcut}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="text-alignment-dropdown" ref={dropdownRef}>
      <button
        className={`text-alignment-dropdown__trigger ${isOpen ? 'open' : ''}`}
        onClick={() => {
          if (disabled) return;
          // Check if mobile and dispatch modal event
          if (window.innerWidth <= 768 && !isModal) {
            document.dispatchEvent(new CustomEvent('openPluginModal', {
              detail: { plugin: 'text-alignment' }
            }));
            return;
          }
          setIsOpen(!isOpen);
        }}
        disabled={disabled}
        type="button"
        aria-label={`Text alignment: ${currentOption.label}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >

        <span className="text-alignment-dropdown__icon">
          {currentOption.icon}
        </span>

      </button>

      {isOpen && (
        <div 
          className="text-alignment-dropdown__menu"
          role="listbox"
          aria-label="Text alignment options"
        >
          {alignmentOptions.map((option) => (
            <button
              key={option.value}
              className={`text-alignment-dropdown__option ${
                option.value === currentAlignment ? 'selected' : ''
              }`}
              onClick={() => handleAlignmentSelect(option.value)}
              role="option"
              aria-selected={option.value === currentAlignment}
              type="button"
            >

              <span className="text-alignment-dropdown__option-label">
                {option.label}
              </span>
              {option.shortcut && (
                <span className="text-alignment-dropdown__option-shortcut">
                  {option.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
