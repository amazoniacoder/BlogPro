/**
 * BlogPro Footer Component
 * Dynamic footer with visual editor support
 */

import React, { useState, useEffect } from 'react';
import { FooterRenderer } from './FooterRenderer';
import { StaticFooter } from './StaticFooter';

export interface FooterProps {
  className?: string;
  useStatic?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ className = '', useStatic = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 1;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (!isVisible) return null;

  // Use static footer as fallback or when explicitly requested
  if (useStatic) {
    return <StaticFooter className={className} />;
  }

  // Use dynamic footer renderer
  return <FooterRenderer className={className} />;
};

export default Footer;

// Export static footer for backward compatibility
export { StaticFooter } from './StaticFooter';
