import React, { useState } from 'react';
import { AdminButton } from '../../AdminButton';
import { AdminSelect } from '../../AdminSelect';
import { Input } from '../../../input';
import { Icon } from '../../../../icons/components';
import { ColorPicker } from './ColorPicker';
import type { FooterConfig } from '../../../../../../../shared/types/footer';

interface ResponsiveToggleProps {
  activeDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  config: FooterConfig;
  onConfigChange: (updates: Partial<FooterConfig>) => void;
}

const DEVICE_CONFIGS = {
  desktop: {
    name: 'Рабочий стол',
    width: '1200px',
    icon: 'gear',
    breakpoint: 'min-width: 1024px'
  },
  tablet: {
    name: 'Планшет',
    width: '768px',
    icon: 'gear',
    breakpoint: 'max-width: 1023px and min-width: 768px'
  },
  mobile: {
    name: 'Мобильный',
    width: '375px',
    icon: 'gear',
    breakpoint: 'max-width: 767px'
  }
};

export const ResponsiveToggle: React.FC<ResponsiveToggleProps> = ({
  activeDevice,
  onDeviceChange,
  config,
  onConfigChange
}) => {
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    onDeviceChange(device);
  };

  const handleResponsiveStyleChange = (device: 'mobile' | 'tablet', field: string, value: any) => {
    const currentResponsive = config.responsive || { mobile: {}, tablet: {} };
    const keys = field.split('.');
    
    let deviceConfig = { ...currentResponsive[device] };
    
    if (keys.length === 2) {
      const existingValue = deviceConfig[keys[0] as keyof typeof deviceConfig];
      deviceConfig = {
        ...deviceConfig,
        [keys[0]]: {
          ...(typeof existingValue === 'object' && existingValue !== null ? existingValue : {}),
          [keys[1]]: value
        }
      };
    } else {
      deviceConfig = {
        ...deviceConfig,
        [field]: value
      };
    }
    
    onConfigChange({
      responsive: {
        ...currentResponsive,
        [device]: deviceConfig
      }
    });
  };

  const inheritFromDesktop = (device: 'mobile' | 'tablet') => {
    const currentResponsive = config.responsive || { mobile: {}, tablet: {} };
    
    onConfigChange({
      responsive: {
        ...currentResponsive,
        [device]: {}
      }
    });
  };

  const getResponsiveValue = (device: 'desktop' | 'tablet' | 'mobile', field: string) => {
    if (device === 'desktop') {
      const keys = field.split('.');
      if (keys.length === 2) {
        const obj = config[keys[0] as keyof FooterConfig] as any;
        return obj?.[keys[1]] || '';
      }
      return config[field as keyof FooterConfig] || '';
    }

    const responsiveConfig = config.responsive?.[device];
    if (!responsiveConfig) return '';

    const keys = field.split('.');
    if (keys.length === 2) {
      const obj = responsiveConfig[keys[0] as keyof FooterConfig] as any;
      return obj?.[keys[1]] || '';
    }
    return responsiveConfig[field as keyof FooterConfig] || '';
  };

  const currentDeviceConfig = config.responsive?.[activeDevice as 'mobile' | 'tablet'];
  const hasCustomSettings = currentDeviceConfig && Object.keys(currentDeviceConfig).length > 0;

  const renderDeviceSettings = () => {
    const isDesktop = activeDevice === 'desktop';
    const deviceConfig = DEVICE_CONFIGS[activeDevice];

    return (
      <div className="responsive-toggle__settings" style={{
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        backgroundColor: '#fff'
      }}>
        <h4>Настройки для {deviceConfig.name}</h4>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
          Breakpoint: {deviceConfig.breakpoint}
        </p>

        {/* Макет */}
        <div style={{ marginBottom: '16px' }}>
          <h5>Макет</h5>
          
          <AdminSelect
            label="Тип макета"
            value={getResponsiveValue(activeDevice, 'layout.type') || 'grid'}
            onChange={(value) => {
              if (isDesktop) {
                onConfigChange({
                  layout: { ...config.layout, type: value as any }
                });
              } else {
                handleResponsiveStyleChange(activeDevice as 'mobile' | 'tablet', 'layout.type', value);
              }
            }}
            options={[
              { value: 'grid', label: 'Сетка' },
              { value: 'flex', label: 'Flexbox' },
              { value: 'columns', label: 'Колонки' }
            ]}
          />

          <div className="responsive-field">
            <label className="responsive-field__label">Количество колонок</label>
            <Input
              type="number"
              value={getResponsiveValue(activeDevice, 'layout.columns') || 3}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (isDesktop) {
                  onConfigChange({
                    layout: { ...config.layout, columns: value }
                  });
                } else {
                  handleResponsiveStyleChange(activeDevice as 'mobile' | 'tablet', 'layout.columns', value);
                }
              }}
              min={1}
              max={6}
            />
          </div>

          <div className="responsive-field">
            <label className="responsive-field__label">Отступ между элементами</label>
            <Input
              type="text"
              value={getResponsiveValue(activeDevice, 'layout.gap') || '2rem'}
              onChange={(e) => {
                if (isDesktop) {
                  onConfigChange({
                    layout: { ...config.layout, gap: e.target.value }
                  });
                } else {
                  handleResponsiveStyleChange(activeDevice as 'mobile' | 'tablet', 'layout.gap', e.target.value);
                }
              }}
              placeholder="2rem"
            />
          </div>
        </div>

        {/* Стили */}
        <div style={{ marginBottom: '16px' }}>
          <h5>Стили</h5>
          
          <ColorPicker
            label="Цвет фона"
            value={getResponsiveValue(activeDevice, 'styles.backgroundColor') || config.styles.backgroundColor}
            onChange={(value) => {
              if (isDesktop) {
                onConfigChange({
                  styles: { ...config.styles, backgroundColor: value }
                });
              } else {
                handleResponsiveStyleChange(activeDevice as 'mobile' | 'tablet', 'styles.backgroundColor', value);
              }
            }}
          />

          <div className="responsive-field">
            <label className="responsive-field__label">Внутренние отступы</label>
            <Input
              type="text"
              value={getResponsiveValue(activeDevice, 'styles.padding') || config.styles.padding}
              onChange={(e) => {
                if (isDesktop) {
                  onConfigChange({
                    styles: { ...config.styles, padding: e.target.value }
                  });
                } else {
                  handleResponsiveStyleChange(activeDevice as 'mobile' | 'tablet', 'styles.padding', e.target.value);
                }
              }}
              placeholder="2rem"
            />
          </div>

          <div className="responsive-field">
            <label className="responsive-field__label">Внешние отступы</label>
            <Input
              type="text"
              value={getResponsiveValue(activeDevice, 'styles.margin') || config.styles.margin}
              onChange={(e) => {
                if (isDesktop) {
                  onConfigChange({
                    styles: { ...config.styles, margin: e.target.value }
                  });
                } else {
                  handleResponsiveStyleChange(activeDevice as 'mobile' | 'tablet', 'styles.margin', e.target.value);
                }
              }}
              placeholder="0"
            />
          </div>
        </div>

        {!isDesktop && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Icon name="info" size={16} />
            <span style={{ fontSize: '14px' }}>
              Пустые поля наследуют значения с рабочего стола
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="responsive-toggle">
      <div className="responsive-toggle__header">
        <h3>Адаптивные настройки</h3>
        
        <div className="responsive-toggle__devices" style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {Object.entries(DEVICE_CONFIGS).map(([device, deviceConfig]) => (
            <AdminButton
              key={device}
              variant={activeDevice === device ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleDeviceChange(device as any)}
            >
              <Icon name={deviceConfig.icon as any} size={16} />
              {deviceConfig.name}
            </AdminButton>
          ))}
        </div>
      </div>

      <div className="responsive-toggle__device-info" style={{
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4>{DEVICE_CONFIGS[activeDevice].name}</h4>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              Максимальная ширина: {DEVICE_CONFIGS[activeDevice].width}
            </p>
          </div>
          
          {activeDevice !== 'desktop' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => setShowDeviceSettings(!showDeviceSettings)}
              >
                {showDeviceSettings ? 'Скрыть' : 'Настроить'}
              </AdminButton>
              
              {hasCustomSettings && (
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => inheritFromDesktop(activeDevice as 'mobile' | 'tablet')}
                  className="admin-button--danger"
                >
                  Сбросить
                </AdminButton>
              )}
            </div>
          )}
        </div>

        {activeDevice !== 'desktop' && !hasCustomSettings && (
          <div style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Icon name="info" size={16} />
            <span style={{ fontSize: '14px' }}>
              Наследует настройки рабочего стола
            </span>
          </div>
        )}
      </div>

      {(activeDevice === 'desktop' || showDeviceSettings) && renderDeviceSettings()}

      <div className="responsive-toggle__preview" style={{
        marginTop: '16px',
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px'
      }}>
        <h4>Предпросмотр</h4>
        <div 
          className={`responsive-toggle__preview-frame responsive-toggle__preview-frame--${activeDevice}`}
          style={{
            maxWidth: DEVICE_CONFIGS[activeDevice].width,
            margin: '0 auto',
            border: '2px solid #0066cc',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            textAlign: 'center'
          }}
        >
          <div className="responsive-toggle__preview-content">
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              Предпросмотр для {DEVICE_CONFIGS[activeDevice].name}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
              Ширина: {DEVICE_CONFIGS[activeDevice].width} | 
              Breakpoint: {DEVICE_CONFIGS[activeDevice].breakpoint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};