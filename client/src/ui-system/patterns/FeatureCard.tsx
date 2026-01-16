/**
 * BlogPro Feature Card Pattern
 * Card component for displaying features with icons
 */

import React from 'react';
import { Link } from 'wouter';
import { Icon } from '../icons/components';
import './feature-card.css';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkText?: string;
  linkUrl?: string;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  linkText = 'Learn more',
  linkUrl = '#',
  className = ''
}) => {
  return (
    <div className={`feature-card ${className}`}>
      <div className="feature-card__icon">{icon}</div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__description">{description}</p>
      {linkUrl && (
        <Link href={linkUrl} className="feature-card__link">
          {linkText}
          <Icon name="arrow-right" size={16} className="feature-card__link-icon" />
        </Link>
      )}
    </div>
  );
};

export default FeatureCard;
