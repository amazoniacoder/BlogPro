/**
 * Text Color Picker Component
 * Provides text color and background color selection
 */

import React, { useState, useRef, useEffect } from 'react';
import './TextColorPicker.css';

export interface TextColorPickerProps {
  currentColor?: string;
  onColorChange: (color: string) => void;
  type?: 'text' | 'background';
  disabled?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

interface ColorOption {
  value: string;
  label: string;
  category: 'basic' | 'theme' | 'standard';
}

const colorOptions: ColorOption[] = [
  // Basic colors
  { value: '#000000', label: 'Black', category: 'basic' },
  { value: '#ffffff', label: 'White', category: 'basic' },
  { value: '#ff0000', label: 'Red', category: 'basic' },
  { value: '#00ff00', label: 'Green', category: 'basic' },
  { value: '#0000ff', label: 'Blue', category: 'basic' },
  { value: '#ffff00', label: 'Yellow', category: 'basic' },
  
  // Theme colors
  { value: '#1f2937', label: 'Dark Gray', category: 'theme' },
  { value: '#374151', label: 'Gray', category: 'theme' },
  { value: '#6b7280', label: 'Light Gray', category: 'theme' },
  { value: '#3b82f6', label: 'Blue', category: 'theme' },
  { value: '#10b981', label: 'Green', category: 'theme' },
  { value: '#f59e0b', label: 'Orange', category: 'theme' },
  
  // Standard colors
  { value: '#dc2626', label: 'Red', category: 'standard' },
  { value: '#ea580c', label: 'Orange', category: 'standard' },
  { value: '#ca8a04', label: 'Yellow', category: 'standard' },
  { value: '#16a34a', label: 'Green', category: 'standard' },
  { value: '#0891b2', label: 'Cyan', category: 'standard' },
  { value: '#7c3aed', label: 'Purple', category: 'standard' },
  { value: '#be185d', label: 'Pink', category: 'standard' },
  { value: '#0f172a', label: 'Slate', category: 'standard' }
];

export const TextColorPicker: React.FC<TextColorPickerProps> = ({
  currentColor = '#000000',
  onColorChange,
  type = 'text',
  disabled = false,
  onClose,
  isModal = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(currentColor);
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

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setCustomColor(color);
    if (isModal) {
      onClose?.();
    } else {
      setIsOpen(false);
    }
  };

  const handleCustomColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  const getColorLabel = () => {
    const option = colorOptions.find(opt => opt.value.toLowerCase() === currentColor.toLowerCase());
    return option ? option.label : currentColor;
  };

  const renderColorGrid = (category: 'basic' | 'theme' | 'standard') => {
    const colors = colorOptions.filter(option => option.category === category);
    
    return (
      <div className={`color-grid color-grid--${category}`}>
        {colors.map((option) => (
          <button
            key={option.value}
            className={`color-option ${
              option.value.toLowerCase() === currentColor.toLowerCase() ? 'selected' : ''
            }`}
            style={{ backgroundColor: option.value }}
            onClick={() => handleColorSelect(option.value)}
            title={option.label}
            type="button"
            aria-label={`${type} color: ${option.label}`}
          >
            {option.value.toLowerCase() === currentColor.toLowerCase() && (
              <span className="color-option__check">✓</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  // If in modal mode, render only the panel content
  if (isModal) {
    return (
      <div 
        className="text-color-picker__panel"
        role="dialog"
        aria-label={`${type} color picker`}
      >
        <div className="color-section">
          <h4 className="color-section__title">Basic Colors</h4>
          {renderColorGrid('basic')}
        </div>

        <div className="color-section">
          <h4 className="color-section__title">Theme Colors</h4>
          {renderColorGrid('theme')}
        </div>

        <div className="color-section">
          <h4 className="color-section__title">Standard Colors</h4>
          {renderColorGrid('standard')}
        </div>

        <div className="color-section">
          <h4 className="color-section__title">Custom Color</h4>
          <div className="custom-color-input">
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="custom-color-input__picker"
              aria-label="Custom color picker"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                  onColorChange(e.target.value);
                }
              }}
              className="custom-color-input__text"
              placeholder="#000000"
              aria-label="Custom color hex value"
            />
          </div>
        </div>

        <div className="color-actions">
          <button
            className="color-action-button color-action-button--remove"
            onClick={() => handleColorSelect('')}
            type="button"
          >
            Remove Color
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-color-picker" ref={dropdownRef}>
      <button
        className={`text-color-picker__trigger ${isOpen ? 'open' : ''}`}
        onClick={() => {
          if (disabled) return;
          // Check if mobile and dispatch modal event
          if (window.innerWidth <= 768 && !isModal) {
            document.dispatchEvent(new CustomEvent('openPluginModal', {
              detail: { plugin: 'text-color-picker' }
            }));
            return;
          }
          setIsOpen(!isOpen);
        }}
        disabled={disabled}
        type="button"
        aria-label={`${type} color: ${getColorLabel()}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className="text-color-picker__preview">
          <span 
            className="text-color-picker__color-sample"
            style={{ backgroundColor: currentColor }}
          />

        </span>

      </button>

      {isOpen && (
        <div 
          className="text-color-picker__panel"
          role="dialog"
          aria-label={`${type} color picker`}
        >
          <div className="color-section">
            <h4 className="color-section__title">Basic Colors</h4>
            {renderColorGrid('basic')}
          </div>

          <div className="color-section">
            <h4 className="color-section__title">Theme Colors</h4>
            {renderColorGrid('theme')}
          </div>

          <div className="color-section">
            <h4 className="color-section__title">Standard Colors</h4>
            {renderColorGrid('standard')}
          </div>

          <div className="color-section">
            <h4 className="color-section__title">Custom Color</h4>
            <div className="custom-color-input">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="custom-color-input__picker"
                aria-label="Custom color picker"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    onColorChange(e.target.value);
                  }
                }}
                className="custom-color-input__text"
                placeholder="#000000"
                aria-label="Custom color hex value"
              />
            </div>
          </div>

          <div className="color-actions">
            <button
              className="color-action-button color-action-button--remove"
              onClick={() => handleColorSelect('')}
              type="button"
            >
              Remove Color
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
