import React, { useState } from 'react';
import { Input } from '../../../input';
import { Button } from '../../../button';
import { Icon } from '../../../../icons/components';

interface SpacingControlProps {
  label: string;
  value: string;
  onChange: (spacing: string) => void;
}

const presetSpacings = [
  { label: 'Нет', value: '0' },
  { label: 'XS', value: '0.25rem' },
  { label: 'SM', value: '0.5rem' },
  { label: 'MD', value: '1rem' },
  { label: 'LG', value: '1.5rem' },
  { label: 'XL', value: '2rem' },
  { label: '2XL', value: '3rem' },
  { label: '3XL', value: '4rem' }
];

export const SpacingControl: React.FC<SpacingControlProps> = ({
  label,
  value,
  onChange
}) => {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [customValue, setCustomValue] = useState(value);

  const handlePresetClick = (presetValue: string) => {
    onChange(presetValue);
    setCustomValue(presetValue);
  };

  const handleCustomChange = (newValue: string) => {
    setCustomValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="spacing-control">
      <div className="spacing-control__header">
        <label className="spacing-control__label">
          {label}
        </label>
        
        <div className="spacing-control__mode-toggle">
          <Button
            variant={mode === 'preset' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setMode('preset')}
          >
            <Icon name="grid" size={14} />
          </Button>
          <Button
            variant={mode === 'custom' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setMode('custom')}
          >
            <Icon name="edit" size={14} />
          </Button>
        </div>
      </div>

      {mode === 'preset' ? (
        <div className="spacing-control__presets">
          {presetSpacings.map((preset) => (
            <button
              key={preset.value}
              className={`spacing-control__preset ${value === preset.value ? 'spacing-control__preset--active' : ''}`}
              onClick={() => handlePresetClick(preset.value)}
              title={`${preset.label}: ${preset.value}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="spacing-control__custom">
          <Input
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="1rem, 16px, 1em"
          />
          <div className="spacing-control__units">
            {['px', 'rem', 'em', '%'].map((unit) => (
              <button
                key={unit}
                className="spacing-control__unit"
                onClick={() => {
                  const numValue = parseFloat(customValue) || 0;
                  handleCustomChange(`${numValue}${unit}`);
                }}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="spacing-control__preview">
        <div 
          className="spacing-control__preview-box"
          style={{ 
            padding: label.toLowerCase().includes('внутренн') ? value : '0.5rem',
            margin: label.toLowerCase().includes('внешн') ? value : '0'
          }}
        >
          Превью
        </div>
      </div>
    </div>
  );
};