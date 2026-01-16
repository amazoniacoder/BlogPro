/**
 * BlogPro Card Component
 * Minimalist card system with TypeScript support
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
  shadow?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}

export interface CardHeaderProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export interface CardActionsProps {
  align?: 'left' | 'center' | 'right' | 'between';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  bordered = false,
  shadow = false,
  interactive = false,
  className = '',
  children,
  ...props
}) => {
  const cardClasses = [
    'card',
    'text-primary',
    'overflow-hidden',
    bordered && 'card--bordered',
    bordered && 'border',
    shadow && 'card--shadow',
    interactive && 'card--interactive',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="card__header flex-col">
      {title && <h3 className="card__title m-0">{title}</h3>}
      {description && <p className="card__description">{description}</p>}
      {children}
    </div>
  );
};

export const CardBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="card__body">{children}</div>;
};

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="card__content">{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="card__footer">{children}</div>;
};

export const CardActions: React.FC<CardActionsProps> = ({
  align = 'right',
  children
}) => {
  const alignClass = align === 'right' ? '' : `card__actions--${align}`;
  
  return (
    <div className={`card__actions ${alignClass}`.trim()}>
      {children}
    </div>
  );
};
