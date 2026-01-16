/**
 * BlogPro Team Card Pattern
 * Card component for displaying team member information
 */

import React from 'react';
import './team-card.css';

export interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}

export interface TeamCardProps {
  name: string;
  role: string;
  bio?: string;
  imageUrl: string;
  socialLinks?: SocialLink[];
  className?: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  name,
  role,
  bio,
  imageUrl,
  socialLinks = [],
  className = ''
}) => {
  return (
    <div className={`team-card ${className}`}>
      <div className="team-card__image-container">
        <img 
          src={imageUrl} 
          alt={name} 
          className="team-card__image"
          loading="lazy"
        />
      </div>
      <div className="team-card__content">
        <h3 className="team-card__name">{name}</h3>
        <p className="team-card__role">{role}</p>
        {bio && <p className="team-card__bio">{bio}</p>}
        
        {socialLinks.length > 0 && (
          <div className="team-card__social">
            {socialLinks.map((link, index) => (
              <a 
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="team-card__social-link"
                aria-label={link.platform}
              >
                {link.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
