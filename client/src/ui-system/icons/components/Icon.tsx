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
  // Direct SVG paths for critical icons only
  const iconPaths: Partial<Record<IconName, string>> = {
    'search': 'M11 11m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M21 21l-4.35-4.35',
    'x': 'M18 6L6 18M6 6l12 12',
    'hamburger': 'M3 6h18M3 12h18M3 18h18',
    'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'admin': 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    'login': 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3',
    'logout': 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    'reply': 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
    'arrow-left': 'M19 12H5M12 19l-7-7 7-7',
    'sun': 'M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
    'moon': 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
    'gear': 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'
  };

  const pathData = iconPaths[name];
  
  if (!pathData) {
    // Fallback to sprite for icons not in direct paths
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
  }

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
      <path d={pathData} />
    </svg>
  );
};

export default Icon;
