/**
 * BlogPro Icon Component
 * Centralized SVG icon system with TypeScript support
 */

import React from 'react';

export type IconName = 
  // Navigation
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'house'
  | 'hamburger'
  | 'search'
  | 'grid'
  | 'table'
  // Actions
  | 'save'
  | 'edit'
  | 'delete'
  | 'add'
  | 'minus'
  | 'refresh'
  | 'login'
  | 'logout'
  | 'alert-circle'
  | 'x'
  | 'check'
  | 'circle'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'eye'
  | 'eye-off'
  | 'calendar'
  | 'share'
  | 'heart'
  | 'reply'
  | 'thumbs-up'
  | 'flag'
  | 'download'
  | 'upload'
  | 'clock'
  | 'bell'
  | 'puzzle'
  | 'shopping-cart'
  | 'credit-card'
  | 'wallet'
  | 'paypal'
  | 'email'
  | 'camera'
  | 'status'
  | 'lock'
  | 'key'
  | 'star'
  // Users
  | 'user'
  | 'users'
  | 'admin'
  // Content
  | 'image'
  | 'book'
  | 'folder'
  | 'video'
  | 'audio'
  | 'file'
  | 'file-search'
  | 'file-users'
  | 'file-crown'
  // Themes
  | 'sun'
  | 'moon'
  | 'cake-icing'
  | 'palette'
  | 'smile-diamond'
  // Tools
  | 'gear'
  | 'wrench'
  // Analytics
  | 'monkey-running'
  | 'rocket-diamond'
  | 'tree-diamond'
  | 'chart'

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name' | 'size' | 'color' | 'onClick'> {
  name: IconName;
  size?: number | string;
  color?: string;
  className?: string;
  'aria-label'?: string;
  onClick?: () => void;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = 'currentColor',
  className = '',
  'aria-label': ariaLabel,
  onClick,
  ...props
}) => {
  return (
    <svg
      className={`icon icon--${name} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || name}
      role="img"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'inherit' }}
      {...props}
    >
      <use href={`/icons/sprite.svg#icon-${name}`} />
    </svg>
  );
};

export default Icon;
