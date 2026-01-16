/**
 * BlogPro Button Component
 * Unified button system with TypeScript support
 */

import React from 'react';
import { Link } from 'wouter';
import { Icon, IconName } from '../../icons/components';
import './index.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
  as?: 'button' | 'a';
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  as = 'button',
  href,
  ...props
}) => {
  const baseClasses = [
    'btn',
    'relative',
    'cursor-pointer',
    'no-underline',
    'items-center',
    'justify-center',
    'overflow-hidden',
    `btn--${variant}`,
    variant === 'ghost' && 'text-primary',
    size !== 'md' && `btn--${size}`,
    fullWidth && 'btn--full',
    fullWidth && 'w-full',
    loading && 'btn--loading',
    (disabled || loading) && 'disabled',
    className
  ].filter(Boolean).join(' ');

  const iconSize = {
    sm: 14,
    md: 16,
    lg: 18
  }[size];

  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <Icon
        name={icon}
        size={iconSize}
        className={`btn__icon ${iconPosition === 'right' ? 'btn__icon--right' : ''}`}
      />
    );
  };

  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && renderIcon()}
      {children && <span className="btn__text">{children}</span>}
      {icon && iconPosition === 'right' && renderIcon()}
    </>
  );

  if (as === 'a') {
    return (
      <Link
        href={href || '#'}
        className={baseClasses}
        aria-disabled={disabled || loading}
        {...(props as any)}
      >
        {renderContent()}
      </Link>
    );
  }

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      type="button"
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
