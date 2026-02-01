import type { Meta } from '@storybook/react';

const meta: Meta = {
  title: 'UI System/Design Tokens',
  parameters: {
    docs: {
      description: {
        component: `
# Design Tokens

Централизованная система токенов дизайна BlogPro обеспечивает консистентность и масштабируемость UI.

## Цветовая палитра

### Primary Colors
Основные цвета бренда используются для ключевых элементов интерфейса.

### Secondary Colors
Вторичные цвета для дополнительных элементов и состояний.

### Semantic Colors
Семантические цвета для обратной связи: success, error, warning, info.

## Типографика

### Font Families
- **Sans**: Inter, system-ui (основной шрифт)
- **Serif**: Georgia, Cambria (заголовки)
- **Mono**: Fira Code, Monaco (код)

### Font Sizes
Модульная шкала размеров от xs (12px) до 9xl (128px).

## Spacing

8px базовая сетка для консистентных отступов и размеров.

## Использование

### В CSS
\`\`\`css
.my-component {
  color: var(--color-primary-600);
  padding: var(--space-4);
  font-size: var(--text-lg);
  border-radius: var(--radius-md);
}
\`\`\`

### В TypeScript
\`\`\`tsx
// Используйте CSS переменные
const styles = {
  color: 'var(--color-primary-600)',
  padding: 'var(--space-4)'
};
\`\`\`
        `,
      },
    },
  },
};

// Color Palette Stories
export const Colors = () => {
  const colorGroups = {
    primary: 'Primary',
    secondary: 'Secondary', 
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    gray: 'Gray'
  };

  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {Object.entries(colorGroups).map(([key, label]) => (
        <div key={key}>
          <h3 style={{ margin: '0 0 1rem 0' }}>{label}</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {shades.map(shade => {
              const cssVar = `--color-${key}-${shade}`;
              return (
                <div key={shade} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: `var(${cssVar})`,
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                    {shade}
                  </div>
                  <div style={{ fontSize: '0.625rem', color: '#6b7280' }}>
                    {cssVar}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default meta;