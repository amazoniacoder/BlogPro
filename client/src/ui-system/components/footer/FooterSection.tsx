/**
 * BlogPro Footer Section Component
 * Universal footer section container
 */

import React from 'react';

export interface FooterSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  title,
  children,
  className = ''
}) => {
  return (
    <div className={`footer__column ${className}`}>
      {title && (
        <h4 className="footer__heading">{title}</h4>
      )}
      {children}
    </div>
  );
};

export default FooterSection;
