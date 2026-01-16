/**
 * BlogPro Color Picker Component
 * Universal color picker with presets and custom input
 */

import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../../icons/components';

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  presets?: string[];
  disabled?: boolean;
  className?: string;
}

const DEFAULT_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#64748b', '#374151', '#000000', '#ffffff'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#000000',
  onChange,
  presets = DEFAULT_PRESETS,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorSelect = (color: string) => {
    onChange?.(color);
    setIsOpen(false);
  };

  return (
    <div className={`color-picker ${className}`} ref={pickerRef}>
      <button
        type="button"
        className="color-picker__toggle"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <Icon name="palette" size={20} />
      </button>

      {isOpen && (
        <div className="color-picker__dropdown">
          <div className="color-picker__grid">
            {presets.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-picker__option ${value === color ? 'color-picker__option--active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
