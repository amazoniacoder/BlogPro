/**
 * BlogPro Pricing Card Pattern
 * Card component for displaying pricing plans
 */

import React from 'react';
import { Link } from 'wouter';
import { Icon } from '../icons/components';
import './pricing-card.css';

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingCardProps {
  title: string;
  description?: string;
  price: {
    amount: number;
    currency: string;
    period: string;
  };
  features: PricingFeature[];
  ctaText?: string;
  ctaLink?: string;
  featured?: boolean;
  featuredText?: string;
  className?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  description,
  price,
  features,
  ctaText = 'Choose Plan',
  ctaLink = '#',
  featured = false,
  featuredText = 'Most Popular',
  className = ''
}) => {
  return (
    <div className={`pricing-card ${featured ? 'pricing-card--featured' : ''} ${className}`}>
      {featured && <span className="pricing-card__badge">{featuredText}</span>}
      
      <div className="pricing-card__header">
        <h3 className="pricing-card__title">{title}</h3>
        {description && <p className="pricing-card__description">{description}</p>}
        <div className="pricing-card__price">
          <span className="pricing-card__amount leading-none">{price.currency}{price.amount}</span>
          <span className="pricing-card__period">/{price.period}</span>
        </div>
      </div>
      
      <ul className="pricing-card__features">
        {features.map((feature, index) => (
          <li 
            key={index} 
            className={`pricing-card__feature ${feature.included ? 'pricing-card__feature--included' : 'pricing-card__feature--excluded'}`}
          >
            <Icon 
              name={feature.included ? "check" : "x"} 
              size={16} 
              className={`pricing-card__feature-icon ${feature.included ? 'pricing-card__feature-icon--included' : 'pricing-card__feature-icon--excluded'}`}
            />
            {feature.text}
          </li>
        ))}
      </ul>
      
      <Link 
        href={ctaLink} 
        className={`button ${featured ? 'button--primary' : 'button--outline'} pricing-card__cta`}
      >
        {ctaText}
      </Link>
    </div>
  );
};

export default PricingCard;
