/**
 * BlogPro Theme Color Picker Component
 * Color picker specifically for theme switching
 */

import React, { useState, useRef, useEffect } from 'react';
import { useColorTheme } from '../theme';
import { themeColors } from '../../../utils/theme-colors';
import { Icon } from '../../icons/components';
import { useTranslation } from '../../../hooks/useTranslation';

export const ThemeColorPicker: React.FC = () => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const { currentColor, setColorTheme } = useColorTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorSelect = (colorId: string) => {
    setColorTheme(colorId);
    setIsOpen(false);
  };

  return (
    <div className="color-picker" ref={dropdownRef}>
      <button
        className="color-picker__toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('selectColorTheme', 'Select color theme')}
      >
        <Icon name="palette" size={20} />
      </button>

      {isOpen && (
        <div className="color-picker__dropdown p-4">
          <div className="color-picker__grid">
            {themeColors.map((color) => (
              <button
                key={color.id}
                className={`color-picker__option ${currentColor === color.id ? 'color-picker__option--active' : ''}`}
                onClick={() => handleColorSelect(color.id)}
                title={color.name}
                style={{
                  background: color.id === 'rainbow' ? color.primary : color.primary
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
