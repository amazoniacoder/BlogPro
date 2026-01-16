/**
 * BlogPro Input Component
 * Input system matching old BEM structure
 */

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  error = false,
  success = false,
  className = '',
  ...props
}) => {
  const inputClasses = [
    'field',
    error && 'field--error',
    success && 'field--success',
    className
  ].filter(Boolean).join(' ');

  return (
    <input
      className={inputClasses}
      {...props}
    />
  );
};

export default Input;
