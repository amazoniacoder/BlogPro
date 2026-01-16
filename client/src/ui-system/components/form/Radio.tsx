/**
 * BlogPro Radio Component
 * Universal radio button component
 */

import React from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card';
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}) => {
  const radioClasses = [
    'radio',
    `radio--${size}`,
    `radio--${variant}`,
    props.disabled && 'radio--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <label className={radioClasses}>
      <input
        type="radio"
        className="radio__input"
        {...props}
      />
      <div className="radio__circle">
        <div className="radio__dot" />
      </div>
      {label && (
        <span className="radio__label">{label}</span>
      )}
    </label>
  );
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  children,
  className = ''
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div className={`bp-radio-group ${className}`} onChange={handleChange}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Radio) {
          return React.cloneElement(child, {
            name,
            checked: child.props.value === value,
            ...child.props
          });
        }
        return child;
      })}
    </div>
  );
};

export default Radio;
