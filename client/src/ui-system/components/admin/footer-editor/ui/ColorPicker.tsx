import React, { useState } from 'react';
import { Input } from '../../../input';
import { AdminButton } from '../../AdminButton';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  showGradients?: boolean;
}

const presetColors = [
  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd',
  '#6c757d', '#495057', '#343a40', '#212529', '#000000',
  '#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14',
  '#ffc107', '#28a745', '#20c997', '#17a2b8', '#6c757d'
];

const presetGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  showGradients = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>('solid');

  const handlePresetClick = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const isGradient = value.includes('gradient');

  return (
    <div className="color-picker">
      <label className="color-picker__label">
        {label}
      </label>
      
      <div className="color-picker__input-group">
        <div
          className="color-picker__preview"
          style={{ 
            background: value,
            width: '40px',
            height: '40px',
            border: '2px solid #e0e0e0',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => setIsOpen(!isOpen)}
          title="Открыть палитру цветов"
        />
        
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff или gradient"
          className="color-picker__input"
          style={{ flex: 1, marginLeft: '8px' }}
        />
        
        <input
          type="color"
          value={isGradient ? '#ffffff' : value}
          onChange={(e) => onChange(e.target.value)}
          className="color-picker__native"
          title="Выбрать цвет"
          style={{
            width: '40px',
            height: '40px',
            marginLeft: '8px',
            border: 'none',
            borderRadius: '4px'
          }}
        />
      </div>

      {isOpen && (
        <div className="color-picker__palette" style={{
          position: 'absolute',
          zIndex: 1000,
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          marginTop: '4px'
        }}>
          {showGradients && (
            <div className="color-picker__tabs" style={{
              display: 'flex',
              marginBottom: '12px',
              gap: '4px'
            }}>
              <AdminButton
                variant={activeTab === 'solid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('solid')}
              >
                Цвета
              </AdminButton>
              <AdminButton
                variant={activeTab === 'gradient' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('gradient')}
              >
                Градиенты
              </AdminButton>
            </div>
          )}
          
          {activeTab === 'solid' && (
            <div className="color-picker__presets" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '4px',
              marginBottom: '12px'
            }}>
              {presetColors.map((color) => (
                <button
                  key={color}
                  className={`color-picker__preset ${value === color ? 'color-picker__preset--active' : ''}`}
                  style={{ 
                    backgroundColor: color,
                    width: '24px',
                    height: '24px',
                    border: value === color ? '2px solid #0066cc' : '1px solid #e0e0e0',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handlePresetClick(color)}
                  title={color}
                />
              ))}
            </div>
          )}
          
          {activeTab === 'gradient' && showGradients && (
            <div className="color-picker__gradients" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '12px'
            }}>
              {presetGradients.map((gradient, index) => (
                <div
                  key={index}
                  className="color-picker__gradient"
                  style={{
                    background: gradient,
                    width: '80px',
                    height: '40px',
                    border: value === gradient ? '2px solid #0066cc' : '1px solid #e0e0e0',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handlePresetClick(gradient)}
                  title={gradient}
                />
              ))}
            </div>
          )}
          
          <div className="color-picker__actions" style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end'
          }}>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => onChange('transparent')}
            >
              Прозрачный
            </AdminButton>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Закрыть
            </AdminButton>
          </div>
        </div>
      )}
    </div>
  );
};