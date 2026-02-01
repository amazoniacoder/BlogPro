/**
 * BlogPro CTA Section Pattern
 * Universal call-to-action section
 */

import React from 'react';
import { Button } from '../components';
import { Link } from '../components/typography';

export interface CTAAction {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  href?: string;
}

export interface CTASectionProps {
  title: string;
  description?: string;
  actions: CTAAction[];
  variant?: 'default' | 'gradient' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  title,
  description,
  actions,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const ctaClasses = [
    'cta',
    `cta--${variant}`,
    `cta--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <section className={ctaClasses}>
      <div className="cta__container">
        <div className="cta__content">
          <h2 className="cta__title">
            {title}
          </h2>
          
          {description && (
            <p className="cta__description">
              {description}
            </p>
          )}
          
          <div className="cta__actions">
            {actions.map((action, index) => {
              if (action.href) {
                return (
                  <Link
                    key={index}
                    href={action.href}
                    variant="button"
                    className={`btn--${action.variant || 'primary'} btn--lg`}
                  >
                    {action.label}
                  </Link>
                );
              }
              
              return (
                <Button
                  key={index}
                  variant={action.variant || 'primary'}
                  size="lg"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
