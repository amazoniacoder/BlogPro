/**
 * BlogPro Switch Component
 * Universal toggle switch component
 */

import React from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}) => {
  const switchClasses = [
    'switch',
    `switch--${size}`,
    `switch--${variant}`,
    props.checked && 'switch--checked',
    props.disabled && 'switch--disabled',
    props.disabled && 'disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <label className={switchClasses}>
      <input
        type="checkbox"
        className="switch__input"
        {...props}
      />
      <div className="switch__track">
        <div className="switch__thumb" />
      </div>
      {label && (
        <span className="switch__label">{label}</span>
      )}
    </label>
  );
};

export default Switch;
