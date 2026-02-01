import React, { useState } from 'react';
import { AdminSelect } from '../../AdminSelect';
import { Input } from '../../../input';

interface FontSelectorProps {
  label: string;
  value: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  };
  onChange: (font: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  }) => void;
}

const FONT_FAMILIES = [
  { value: 'inherit', label: 'По умолчанию' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Poppins, sans-serif', label: 'Poppins' }
];

const FONT_SIZES = [
  { value: '12px', label: '12px (Маленький)' },
  { value: '14px', label: '14px (Обычный)' },
  { value: '16px', label: '16px (Средний)' },
  { value: '18px', label: '18px (Большой)' },
  { value: '20px', label: '20px (Очень большой)' },
  { value: '24px', label: '24px (Заголовок)' },
  { value: '32px', label: '32px (Крупный заголовок)' }
];

const FONT_WEIGHTS = [
  { value: 'normal', label: 'Обычный' },
  { value: 'bold', label: 'Жирный' },
  { value: '300', label: 'Легкий' },
  { value: '400', label: 'Нормальный' },
  { value: '500', label: 'Средний' },
  { value: '600', label: 'Полужирный' },
  { value: '700', label: 'Жирный' },
  { value: '800', label: 'Очень жирный' }
];

export const FontSelector: React.FC<FontSelectorProps> = ({
  label,
  value,
  onChange
}) => {
  const [customSize, setCustomSize] = useState('');

  const handleFontFamilyChange = (fontFamily: string) => {
    onChange({ ...value, fontFamily });
  };

  const handleFontSizeChange = (fontSize: string) => {
    onChange({ ...value, fontSize });
  };

  const handleFontWeightChange = (fontWeight: string) => {
    onChange({ ...value, fontWeight });
  };

  const handleCustomSizeChange = (size: string) => {
    setCustomSize(size);
    if (size && (size.endsWith('px') || size.endsWith('rem') || size.endsWith('em'))) {
      onChange({ ...value, fontSize: size });
    }
  };

  return (
    <div className="font-selector">
      <label className="font-selector__label">{label}</label>
      
      <div className="font-selector__preview" style={{
        padding: '12px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        marginBottom: '12px',
        backgroundColor: '#f8f9fa'
      }}>
        <div
          className="font-selector__preview-text"
          style={{
            fontFamily: value.fontFamily,
            fontSize: value.fontSize,
            fontWeight: value.fontWeight
          }}
        >
          Пример текста с выбранным шрифтом
        </div>
      </div>

      <div className="font-selector__controls" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AdminSelect
          label="Шрифт"
          value={value.fontFamily}
          onChange={handleFontFamilyChange}
          options={FONT_FAMILIES}
        />

        <AdminSelect
          label="Размер"
          value={value.fontSize}
          onChange={handleFontSizeChange}
          options={FONT_SIZES}
        />

        <div className="font-selector__field">
          <label className="font-selector__field-label">Пользовательский размер</label>
          <Input
            type="text"
            value={customSize}
            onChange={(e) => handleCustomSizeChange(e.target.value)}
            placeholder="Например: 15px, 1.2rem, 1.5em"
          />
        </div>

        <AdminSelect
          label="Начертание"
          value={value.fontWeight}
          onChange={handleFontWeightChange}
          options={FONT_WEIGHTS}
        />
      </div>
    </div>
  );
};