/**
 * BlogPro Dashboard Card Pattern
 * Universal dashboard widget component
 */

import React from 'react';
import { Card, Heading, Button } from '../../components';
import { Icon, IconName } from '../../icons/components';

export interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  icon?: IconName;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact' | 'highlighted';
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  icon,
  action,
  variant = 'default',
  className = ''
}) => {
  const cardClasses = [
    'dashboard-card',
    `dashboard-card--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <Card className={cardClasses}>
      <div className="dashboard-card__header">
        <div className="dashboard-card__title-section">
          {icon && (
            <Icon name={icon} size={20} className="dashboard-card__icon" />
          )}
          <Heading level={3} className="dashboard-card__title">
            {title}
          </Heading>
        </div>
        
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className="dashboard-card__action"
          >
            {action.label}
          </Button>
        )}
      </div>
      
      <div className="dashboard-card__content">
        {children}
      </div>
    </Card>
  );
};

export default DashboardCard;
