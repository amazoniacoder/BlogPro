import React, { useState } from 'react';
import { Card } from '../../card';
import { AdminSelect } from '../AdminSelect';
import { Input } from '../../input';
import { ColorPicker } from './ui/ColorPicker';
import { FontSelector } from './ui/FontSelector';
import { ResponsiveToggle } from './ui/ResponsiveToggle';
import { AdminButton } from '../AdminButton';
import { Icon } from '../../../icons/components';
import { useNotification } from '../../../../hooks/useNotification';
import type { FooterConfig, FooterBlock } from '../../../../../../shared/types/footer';

interface StylePanelProps {
  config: FooterConfig | null;
  selectedBlock: string | null;
  onConfigChange: (updates: Partial<FooterConfig>) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<FooterBlock>) => void;
}

const PRESET_THEMES = [
  {
    name: 'Светлая',
    config: {
      theme: 'light' as const,
      backgroundColor: '#ffffff',
      textColor: '#333333',
      linkColor: '#0066cc',
      borderColor: '#e0e0e0'
    }
  },
  {
    name: 'Темная',
    config: {
      theme: 'dark' as const,
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      linkColor: '#66b3ff',
      borderColor: '#404040'
    }
  },
  {
    name: 'Корпоративная',
    config: {
      theme: 'custom' as const,
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      linkColor: '#007bff',
      borderColor: '#dee2e6'
    }
  }
];

export const StylePanel: React.FC<StylePanelProps> = ({
  config,
  selectedBlock,
  onConfigChange
}) => {
  const { showSuccess } = useNotification();
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!config) {
    return (
      <Card>
        <h3>Стили</h3>
        <p>Конфигурация не загружена</p>
      </Card>
    );
  }

  const selectedBlockData = selectedBlock 
    ? config.blocks.find(block => block.id === selectedBlock)
    : null;

  const handleGlobalStyleChange = (field: string, value: any) => {
    onConfigChange({
      styles: {
        ...config.styles,
        [field]: value
      }
    });
  };

  const handleLayoutChange = (field: string, value: any) => {
    onConfigChange({
      layout: {
        ...config.layout,
        [field]: value
      }
    });
  };

  const handleBlockStyleChange = (field: string, value: any) => {
    if (!selectedBlockData) return;

    const updatedBlocks = config.blocks.map(block =>
      block.id === selectedBlock
        ? {
            ...block,
            styles: {
              ...block.styles,
              [field]: value
            }
          }
        : block
    );

    onConfigChange({ blocks: updatedBlocks });
  };

  const applyTheme = (theme: typeof PRESET_THEMES[0]) => {
    onConfigChange({
      styles: {
        ...config.styles,
        ...theme.config
      }
    });
    showSuccess(`Тема "${theme.name}" применена`);
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `footer-config-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess('Конфигурация экспортирована');
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        onConfigChange(importedConfig);
        showSuccess('Конфигурация импортирована');
      } catch (error) {
        console.error('Error importing config:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="style-panel">
      {/* Готовые темы */}
      <Card>
        <h3>Готовые темы</h3>
        <div className="style-panel__themes">
          {PRESET_THEMES.map((theme, index) => (
            <AdminButton
              key={index}
              variant="secondary"
              size="sm"
              onClick={() => applyTheme(theme)}
              style={{
                backgroundColor: theme.config.backgroundColor,
                color: theme.config.textColor,
                border: `1px solid ${theme.config.borderColor}`
              }}
            >
              {theme.name}
            </AdminButton>
          ))}
        </div>
      </Card>

      {/* Адаптивные настройки */}
      <Card>
        <h3>Адаптивные настройки</h3>
        <ResponsiveToggle
          activeDevice={activeDevice}
          onDeviceChange={setActiveDevice}
          config={config}
          onConfigChange={onConfigChange}
        />
      </Card>

      {/* Общие стили футера */}
      <Card>
        <h3>Общие стили футера</h3>
        <div>
          <AdminSelect
            label="Тема"
            value={config.styles.theme}
            onChange={(value) => handleGlobalStyleChange('theme', value)}
            options={[
              { value: 'light', label: 'Светлая' },
              { value: 'dark', label: 'Темная' },
              { value: 'custom', label: 'Пользовательская' }
            ]}
          />

          <ColorPicker
            label="Цвет фона"
            value={config.styles.backgroundColor}
            onChange={(value) => handleGlobalStyleChange('backgroundColor', value)}
            showGradients={true}
          />

          <ColorPicker
            label="Цвет текста"
            value={config.styles.textColor}
            onChange={(value) => handleGlobalStyleChange('textColor', value)}
          />

          <ColorPicker
            label="Цвет ссылок"
            value={config.styles.linkColor}
            onChange={(value) => handleGlobalStyleChange('linkColor', value)}
          />
        </div>
      </Card>

      {/* Макет */}
      <Card>
        <h3>Макет</h3>
        <div>
          <AdminSelect
            label="Тип макета"
            value={config.layout.type}
            onChange={(value) => handleLayoutChange('type', value)}
            options={[
              { value: 'grid', label: 'Сетка' },
              { value: 'flex', label: 'Flexbox' },
              { value: 'columns', label: 'Колонки' }
            ]}
          />

          <div className="admin-editor__field">
            <label className="admin-editor__label">Количество колонок</label>
            <Input
              type="number"
              value={config.layout.columns}
              onChange={(e) => handleLayoutChange('columns', parseInt(e.target.value))}
              min={1}
              max={6}
            />
          </div>

          <div className="admin-editor__field">
            <label className="admin-editor__label">Отступ между элементами</label>
            <Input
              type="text"
              value={config.layout.gap}
              onChange={(e) => handleLayoutChange('gap', e.target.value)}
              placeholder="2rem"
            />
          </div>
        </div>
      </Card>

      {/* Стили выбранного блока */}
      {selectedBlockData && (
        <Card>
          <h3>Стили блока: {selectedBlockData.type}</h3>
          <div>
            <AdminSelect
              label="Выравнивание текста"
              value={selectedBlockData.styles.textAlign || 'left'}
              onChange={(value) => handleBlockStyleChange('textAlign', value)}
              options={[
                { value: 'left', label: 'По левому краю' },
                { value: 'center', label: 'По центру' },
                { value: 'right', label: 'По правому краю' }
              ]}
            />

            <ColorPicker
              label="Цвет текста"
              value={selectedBlockData.styles.color || config.styles.textColor}
              onChange={(value) => handleBlockStyleChange('color', value)}
            />

            <ColorPicker
              label="Цвет фона"
              value={selectedBlockData.styles.backgroundColor || 'transparent'}
              onChange={(value) => handleBlockStyleChange('backgroundColor', value)}
            />

            <FontSelector
              label="Шрифт"
              value={{
                fontFamily: selectedBlockData.styles.fontFamily || 'inherit',
                fontSize: selectedBlockData.styles.fontSize || '14px',
                fontWeight: selectedBlockData.styles.fontWeight || 'normal'
              }}
              onChange={(font) => {
                handleBlockStyleChange('fontFamily', font.fontFamily);
                handleBlockStyleChange('fontSize', font.fontSize);
                handleBlockStyleChange('fontWeight', font.fontWeight);
              }}
            />
          </div>
        </Card>
      )}

      {/* Импорт/Экспорт */}
      <Card>
        <h3>Импорт/Экспорт</h3>
        <div className="style-panel__import-export">
          <AdminButton
            variant="secondary"
            onClick={exportConfig}
          >
            <Icon name="download" size={16} />
            Экспорт конфигурации
          </AdminButton>
          
          <label className="style-panel__import-label">
            <span className="admin-button admin-button--secondary">
              <Icon name="upload" size={16} />
              Импорт конфигурации
            </span>
            <input
              type="file"
              accept=".json"
              onChange={importConfig}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </Card>
    </div>
  );
};