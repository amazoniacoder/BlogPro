/**
 * BlogPro Stats Card Pattern
 * Universal statistics display component
 */

import React from 'react';
import { Card, Heading, Text, Badge } from '../../components';
import { Icon, IconName } from '../../icons/components';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: IconName;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = 'default',
  className = ''
}) => {
  const cardClasses = [
    'stats-card',
    `stats-card--${variant}`,
    className
  ].filter(Boolean).join(' ');

  const getTrendIcon = () => {
    switch (change?.trend) {
      case 'up': return 'arrow-up';
      case 'down': return 'arrow-down';
      default: return 'delete';
    }
  };

  const getTrendVariant = () => {
    switch (change?.trend) {
      case 'up': return 'success';
      case 'down': return 'error';
      default: return 'primary';
    }
  };

  return (
    <Card className={cardClasses}>
      <div className="stats-card__header">
        <Text size="sm" color="muted" className="stats-card__title">
          {title}
        </Text>
        {icon && (
          <Icon name={icon} size={20} className="stats-card__icon" />
        )}
      </div>
      
      <div className="stats-card__content">
        <Heading level={2} className="stats-card__value">
          {value}
        </Heading>
        
        {change && (
          <div className="stats-card__change">
            <Badge
              variant={getTrendVariant()}
              size="sm"
              className="stats-card__trend"
            >
              <Icon name={getTrendIcon()} size={12} />
              {change.value}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
