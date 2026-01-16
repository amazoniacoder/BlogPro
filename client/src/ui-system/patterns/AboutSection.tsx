/**
 * BlogPro About Section Pattern
 * Professional about page with hero, features, and technology showcase
 */

import React from 'react';
import './about-section.css';

export interface Technology {
  name: string;
  description: string;
  logo: string;
  link: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface AboutSectionProps {
  title: string;
  subtitle: string;
  badges?: string[];
  description: string;
  features: Feature[];
  technologies: Technology[];
  className?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  title,
  subtitle,
  badges = [],
  description,
  features,
  technologies,
  className = ''
}) => {
  return (
    <div className={`about ${className}`}>
      {/* Hero Section */}
      <div className="about__hero">
        <div className="about__hero-content">
          <h1 className="about__hero-title">{title}</h1>
          <p className="about__hero-subtitle">{subtitle}</p>
          {badges.length > 0 && (
            <div className="about__hero-badges">
              {badges.map((badge, index) => (
                <span key={index} className="about__badge">{badge}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* About Platform */}
      <div className="about__section">
        <h2 className="about__section-title">About Platform</h2>
        <div className="about__content">
          <p className="about__description">{description}</p>
        </div>
      </div>

      {/* Features */}
      <div className="about__section">
        <h2 className="about__section-title">Key Features</h2>
        <div className="about__features">
          {features.map((feature, index) => (
            <div key={index} className="about__feature">
              <div className="about__feature-icon">{feature.icon}</div>
              <h3 className="about__feature-title">{feature.title}</h3>
              <p className="about__feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technologies */}
      <div className="about__section">
        <h2 className="about__section-title">Technology Stack</h2>
        <div className="about__content">
          <div className="about__technologies">
            {technologies.map((tech, index) => (
              <a 
                key={index} 
                href={tech.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="about__technology"
              >
                <img 
                  src={tech.logo} 
                  alt={tech.name} 
                  className="about__technology-logo"
                  loading="lazy"
                />
                <div className="about__technology-info">
                  <h3 className="about__technology-name">{tech.name}</h3>
                  <p className="about__technology-description">{tech.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
