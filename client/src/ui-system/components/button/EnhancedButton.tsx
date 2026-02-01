/**
 * BlogPro Enhanced Button Component
 * Compound Components Pattern + Design Tokens Integration
 */

import React, { createContext, useContext } from 'react';
import { Icon } from '../../icons/components';
import type { IconName } from '../../icons/components';

// Button Context для Compound Components
interface ButtonContextValue {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
}

const ButtonContext = createContext<ButtonContextValue | null>(null);

// Types
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children?: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  'aria-label'?: string;
}

// Main Button Component
export const Button: React.FC<ButtonProps> & {
  Icon: typeof ButtonIcon;
  Text: typeof ButtonText;
  Group: typeof ButtonGroup;
} = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  style,
  title,
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseClasses = 'button';
  const variantClasses = `button--${variant}`;
  const sizeClasses = `button--${size}`;
  const stateClasses = [
    loading && 'button--loading',
    disabled && 'button--disabled',
    fullWidth && 'button--full-width'
  ].filter(Boolean);
  
  const classes = [baseClasses, variantClasses, sizeClasses, ...stateClasses, className]
    .filter(Boolean)
    .join(' ');

  const contextValue: ButtonContextValue = {
    variant,
    size,
    disabled: disabled || loading
  };

  return (
    <ButtonContext.Provider value={contextValue}>
      <button
        type={type}
        onClick={disabled || loading ? undefined : onClick}
        disabled={disabled || loading}
        className={classes}
        style={style}
        title={title}
        aria-label={ariaLabel}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && <ButtonSpinner />}
        {children}
      </button>
    </ButtonContext.Provider>
  );
};

// Button Icon Subcomponent
interface ButtonIconProps {
  name: IconName;
  size?: number;
  position?: 'left' | 'right';
  className?: string;
}

const ButtonIcon: React.FC<ButtonIconProps> = ({
  name,
  size,
  position = 'left',
  className = ''
}) => {
  const context = useContext(ButtonContext);
  
  const defaultSize = context?.size === 'sm' ? 14 : context?.size === 'lg' ? 18 : 16;
  const iconSize = size || defaultSize;
  
  const iconClasses = [
    'button__icon',
    `button__icon--${position}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <Icon 
      name={name} 
      size={iconSize} 
      className={iconClasses}
    />
  );
};

// Button Text Subcomponent
interface ButtonTextProps {
  children: React.ReactNode;
  className?: string;
}

const ButtonText: React.FC<ButtonTextProps> = ({
  children,
  className = ''
}) => {
  const textClasses = ['button__text', className].filter(Boolean).join(' ');
  
  return (
    <span className={textClasses}>
      {children}
    </span>
  );
};

// Button Group Subcomponent
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  className = ''
}) => {
  const groupClasses = [
    'button-group',
    `button-group--${orientation}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={groupClasses} role="group">
      {children}
    </div>
  );
};

// Loading Spinner Component
const ButtonSpinner: React.FC = () => (
  <span className="button__spinner" aria-hidden="true">
    <svg className="button__spinner-icon" viewBox="0 0 24 24">
      <circle
        className="button__spinner-circle"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        strokeWidth="2"
      />
    </svg>
  </span>
);

// Attach subcomponents
Button.Icon = ButtonIcon;
Button.Text = ButtonText;
Button.Group = ButtonGroup;

export default Button;