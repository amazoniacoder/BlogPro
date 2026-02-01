/**
 * BlogPro Enhanced Input Component
 * Design Tokens + Accessibility + Compound Components
 */

import React, { createContext, useContext, useId, forwardRef } from 'react';
import { Icon } from '../../icons/components';
import type { IconName } from '../../icons/components';

// Input Context
interface InputContextValue {
  id: string;
  hasError: boolean;
  disabled: boolean;
  size: InputSize;
}

const InputContext = createContext<InputContextValue | null>(null);

// Types
export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled' | 'flushed';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  variant?: InputVariant;
  error?: string;
  helperText?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
  fullWidth?: boolean;
}

// Input Label Component
export interface InputLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export const InputLabel: React.FC<InputLabelProps> = ({
  children,
  htmlFor,
  required = false,
  className = ''
}) => {
  const context = useContext(InputContext);
  const labelFor = htmlFor || context?.id;
  
  const labelClasses = [
    'input-label',
    required && 'input-label--required',
    context?.hasError && 'input-label--error',
    className
  ].filter(Boolean).join(' ');

  return (
    <label 
      htmlFor={labelFor}
      className={labelClasses}
    >
      {children}
      {required && (
        <span className="input-label__required-indicator" aria-label="обязательное поле">
          *
        </span>
      )}
    </label>
  );
};

// Input Group Component
export interface InputGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  children,
  className = ''
}) => {
  const groupClasses = ['input-group', className].filter(Boolean).join(' ');
  
  return (
    <div className={groupClasses}>
      {children}
    </div>
  );
};

// Input Icon Subcomponent
interface InputIconProps {
  name: IconName;
  position: 'left' | 'right';
  onClick?: () => void;
  clickable?: boolean;
  className?: string;
}

const InputIcon: React.FC<InputIconProps> = ({
  name,
  position,
  onClick,
  clickable = false,
  className = ''
}) => {
  const context = useContext(InputContext);
  
  const iconSize = context?.size === 'sm' ? 14 : context?.size === 'lg' ? 18 : 16;
  
  const iconClasses = [
    'input__icon',
    `input__icon--${position}`,
    clickable && 'input__icon--clickable',
    context?.disabled && 'input__icon--disabled',
    className
  ].filter(Boolean).join(' ');

  const IconComponent = (
    <Icon 
      name={name} 
      size={iconSize} 
      className={iconClasses}
    />
  );

  if (clickable && onClick && !context?.disabled) {
    return (
      <button
        type="button"
        className="input__icon-button"
        onClick={onClick}
        tabIndex={-1}
        aria-hidden="true"
      >
        {IconComponent}
      </button>
    );
  }

  return IconComponent;
};

// Input Helper Text Subcomponent
interface InputHelperTextProps {
  error?: string;
  helperText?: string;
}

const InputHelperText: React.FC<InputHelperTextProps> = ({
  error,
  helperText
}) => {
  const context = useContext(InputContext);
  
  if (error) {
    return (
      <div 
        id={`${context?.id}-error`}
        className="input__error-text"
        role="alert"
        aria-live="polite"
      >
        <Icon name="error" size={14} className="input__error-icon" />
        {error}
      </div>
    );
  }
  
  if (helperText) {
    return (
      <div 
        id={`${context?.id}-helper`}
        className="input__helper-text"
      >
        {helperText}
      </div>
    );
  }
  
  return null;
};

// Main Input Component with proper typing for compound components
type InputComponent = React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>> & {
  Label: typeof InputLabel;
  Group: typeof InputGroup;
};

export const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    size = 'md',
    variant = 'default',
    error,
    helperText,
    leftIcon,
    rightIcon,
    onLeftIconClick,
    onRightIconClick,
    fullWidth = false,
    disabled = false,
    className = '',
    id: providedId,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) => {
  const generatedId = useId();
  const id = providedId || generatedId;
  const hasError = Boolean(error);
  
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  
  const describedBy = [
    ariaDescribedBy,
    helperId,
    errorId
  ].filter(Boolean).join(' ') || undefined;

  const baseClasses = 'input';
  const variantClasses = `input--${variant}`;
  const sizeClasses = `input--${size}`;
  const stateClasses = [
    hasError && 'input--error',
    disabled && 'input--disabled',
    fullWidth && 'input--full-width',
    leftIcon && 'input--with-left-icon',
    rightIcon && 'input--with-right-icon'
  ].filter(Boolean);
  
  const classes = [baseClasses, variantClasses, sizeClasses, ...stateClasses, className]
    .filter(Boolean)
    .join(' ');

  const contextValue: InputContextValue = {
    id,
    hasError,
    disabled,
    size
  };

  return (
    <InputContext.Provider value={contextValue}>
      <div className="input-wrapper">
        <div className="input-container">
          {leftIcon && (
            <InputIcon 
              name={leftIcon} 
              position="left" 
              onClick={onLeftIconClick}
              clickable={Boolean(onLeftIconClick)}
            />
          )}
          
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={classes}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            {...props}
          />
          
          {rightIcon && (
            <InputIcon 
              name={rightIcon} 
              position="right" 
              onClick={onRightIconClick}
              clickable={Boolean(onRightIconClick)}
            />
          )}
        </div>
        
        {(helperText || error) && (
          <InputHelperText error={error} helperText={helperText} />
        )}
      </div>
    </InputContext.Provider>
  );
}) as InputComponent;

Input.displayName = 'Input';

// Attach subcomponents
Input.Label = InputLabel;
Input.Group = InputGroup;

export default Input;