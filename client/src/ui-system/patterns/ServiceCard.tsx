/**
 * BlogPro Service Card Pattern
 * Card component for displaying service offerings
 */

import React from 'react';
import { Link } from 'wouter';
import { Icon } from '../icons/components';
import './service-card.css';

export interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
  price?: {
    amount: number;
    currency: string;
    period?: string;
  };
  ctaText?: string;
  ctaLink?: string;
  popular?: boolean;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  features = [],
  price,
  ctaText = 'Get Started',
  ctaLink = '#',
  popular = false,
  className = ''
}) => {
  return (
    <div className={`service-card ${className}`}>
      {popular && <span className="service-card__badge">Popular</span>}
      <div className="service-card__icon">{icon}</div>
      <h3 className="service-card__title">{title}</h3>
      <p className="service-card__description">{description}</p>
      
      {features.length > 0 && (
        <ul className="service-card__features">
          {features.map((feature, index) => (
            <li key={index} className="service-card__feature">
              <Icon name="check" size={16} className="service-card__feature-icon" />
              {feature}
            </li>
          ))}
        </ul>
      )}
      
      {price && (
        <div className="service-card__price">
          <span className="service-card__price-amount">
            {price.currency}{price.amount}
          </span>
          {price.period && <span> /{price.period}</span>}
        </div>
      )}
      
      <Link href={ctaLink} className="button button--primary service-card__cta">
        {ctaText}
      </Link>
    </div>
  );
};

export default ServiceCard;
