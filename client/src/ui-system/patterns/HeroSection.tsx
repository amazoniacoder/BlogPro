/**
 * BlogPro Hero Section Pattern
 * Universal hero section component
 */

import React from 'react';
import { Button } from '../components';
import { Link } from '../components/typography';
import { Icon } from '../icons/components';

export interface HeroAction {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  href?: string;
}

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: HeroAction[];
  backgroundImage?: string;
  variant?: 'default' | 'centered' | 'dark' | 'split';
  fullHeight?: boolean;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  actions = [],
  backgroundImage,
  variant = 'default',
  className = ''
}) => {
  const heroClasses = [
    'hero',
    `hero--${variant}`,
    backgroundImage && 'hero--with-bg',
    className
  ].filter(Boolean).join(' ');

  const heroStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`
  } : undefined;

  return (
    <section className={heroClasses} style={heroStyle}>
       <div className="hero__container">
        <div className="hero__content">
          {subtitle && (
            <p className="hero__subtitle">
              {subtitle}
            </p>
          )}
          
          <h1 className="hero__title">
            {title}
          </h1>
          
          {description && (
            <p className="hero__description">
              {description}
            </p>
          )}
          
          {actions.length > 0 && (
            <div className="hero__actions">
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
              
              <button 
                className="hero__scroll-arrow backdrop-blur"
                onClick={() => {
                  const nextSection = document.querySelector('.product-showcase');
                  if (nextSection) {
                    nextSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                aria-label="Scroll to next section"
              >
                <Icon name="arrow-down" className="hero__scroll-icon" size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
