/**
 * BlogPro Password Input Component
 * Password input with toggle visibility
 */

import React, { useState } from 'react';
import { Icon } from '../../icons/components';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean;
  success?: boolean;
  className?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  error = false,
  success = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses = [
    'field',
    error && 'field--error',
    success && 'field--success',
    className
  ].filter(Boolean).join(' ');

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="password-input">
      <input
        type={showPassword ? 'text' : 'password'}
        className={inputClasses}
        autoComplete="current-password"
        {...props}
      />
      <button
        type="button"
        className="password-input__toggle"
        onClick={togglePassword}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} />
      </button>
    </div>
  );
};

export default PasswordInput;
