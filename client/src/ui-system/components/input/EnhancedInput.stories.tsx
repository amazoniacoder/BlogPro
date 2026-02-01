import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './EnhancedInput';
import './enhanced-input.css';

const meta: Meta<typeof Input> = {
  title: 'UI System/Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Enhanced Input Component

Улучшенный компонент поля ввода с полной поддержкой accessibility и Design Tokens.

## Особенности

- **Design Tokens**: Использует централизованные токены дизайна
- **Accessibility**: WCAG 2.1 AA соответствие
- **Compound Components**: Label, Group, иконки
- **Валидация**: Встроенная поддержка ошибок и подсказок
- **Адаптивность**: Responsive дизайн
- **Темы**: Поддержка светлой и темной темы

## Использование

\`\`\`tsx
import { Input } from '@/ui-system/components/input';

// Простое поле
<Input placeholder="Введите текст" />

// С лейблом и валидацией
<Input.Group>
  <Input.Label required>Email</Input.Label>
  <Input 
    type="email" 
    error="Неверный формат email"
    leftIcon="email"
  />
</Input.Group>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Размер поля ввода',
    },
    variant: {
      control: 'select',
      options: ['default', 'filled', 'flushed'],
      description: 'Визуальный вариант',
    },
    error: {
      control: 'text',
      description: 'Текст ошибки',
    },
    helperText: {
      control: 'text',
      description: 'Вспомогательный текст',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключенное состояние',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Растянуть на всю ширину',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Базовые варианты
export const Default: Story = {
  args: {
    placeholder: 'Введите текст...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <Input.Group>
      <Input.Label>Имя пользователя</Input.Label>
      <Input placeholder="Введите имя пользователя" />
    </Input.Group>
  ),
};

export const Required: Story = {
  render: () => (
    <Input.Group>
      <Input.Label required>Email адрес</Input.Label>
      <Input 
        type="email" 
        placeholder="example@domain.com"
        helperText="Мы никогда не поделимся вашим email"
      />
    </Input.Group>
  ),
};

// Размеры
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </div>
  ),
};

// Варианты
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input variant="default" placeholder="Default variant" />
      <Input variant="filled" placeholder="Filled variant" />
      <Input variant="flushed" placeholder="Flushed variant" />
    </div>
  ),
};

// Состояния
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input placeholder="Обычное состояние" />
      
      <Input 
        placeholder="С подсказкой" 
        helperText="Это вспомогательный текст"
      />
      
      <Input 
        placeholder="С ошибкой" 
        error="Это поле обязательно для заполнения"
      />
      
      <Input 
        placeholder="Отключенное" 
        disabled
      />
      
      <Input 
        placeholder="Только для чтения" 
        readOnly
        defaultValue="Только чтение"
      />
    </div>
  ),
};