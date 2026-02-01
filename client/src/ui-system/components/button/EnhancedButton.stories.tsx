import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './EnhancedButton';
import './enhanced-button.css';

const meta: Meta<typeof Button> = {
  title: 'UI System/Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Enhanced Button Component

Улучшенный компонент кнопки с поддержкой Design Tokens и Compound Components паттерна.

## Особенности

- **Design Tokens интеграция**: Использует централизованные токены дизайна
- **Compound Components**: Поддержка вложенных компонентов (Icon, Text, Group)
- **Accessibility**: Полная поддержка WCAG 2.1 AA
- **TypeScript**: Строгая типизация
- **Состояния**: Loading, disabled, различные варианты
- **Адаптивность**: Поддержка различных размеров экрана

## Использование

\`\`\`tsx
import { Button } from '@/ui-system/components/button';

// Простая кнопка
<Button variant="primary" size="md">
  Нажать
</Button>

// Кнопка с иконкой
<Button variant="secondary">
  <Button.Icon name="plus" position="left" />
  <Button.Text>Добавить</Button.Text>
</Button>

// Группа кнопок
<Button.Group orientation="horizontal">
  <Button variant="outline">Отмена</Button>
  <Button variant="primary">Сохранить</Button>
</Button.Group>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'outline', 'danger'],
      description: 'Визуальный вариант кнопки',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Размер кнопки',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключенное состояние',
    },
    loading: {
      control: 'boolean',
      description: 'Состояние загрузки',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Растянуть на всю ширину',
    },
    onClick: {
      action: 'clicked',
      description: 'Обработчик клика',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Базовые варианты
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
};

// Размеры
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Различные размеры кнопок: small, medium, large',
      },
    },
  },
};

// Состояния
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button>Normal</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </div>
      <Button fullWidth>Full Width</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Различные состояния: обычное, отключенное, загрузка, полная ширина',
      },
    },
  },
};