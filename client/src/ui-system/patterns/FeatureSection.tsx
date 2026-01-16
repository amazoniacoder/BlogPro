/**
 * BlogPro Feature Section Pattern
 * Universal features showcase section
 */

import React from 'react';
import { Heading, Text } from '../components';
import { FeatureCard } from './FeatureCard';
import { IconName, Icon } from '../icons/components';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: IconName;
}

export interface FeatureSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'alternating' | 'grid';
  className?: string;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  subtitle,
  description,
  features,
  columns = 3,
  variant = 'default',
  className = ''
}) => {
  const sectionClasses = [
    'feature-section',
    `feature-section--${variant}`,
    `feature-section--cols-${columns}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClasses}>
      <div className="feature-section__container">
        <div className="feature-section__header">
          {subtitle && (
            <Text className="feature-section__subtitle" color="primary">
              {subtitle}
            </Text>
          )}
          
          <Heading level={2} className="feature-section__title">
            {title}
          </Heading>
          
          {description && (
            <Text size="lg" className="feature-section__description">
              {description}
            </Text>
          )}
        </div>
        
        <div className="feature-section__grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon ? <Icon name={feature.icon} size={24} /> : <div />}
              className={`feature-section__item ${variant === 'alternating' && index % 2 === 1 ? 'feature-section__item--highlighted' : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
