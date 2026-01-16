/**
 * BlogPro Footer Links Component
 * Universal footer link groups
 */

import React from 'react';

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterLinksProps {
  links: FooterLink[];
  className?: string;
}

export const FooterLinks: React.FC<FooterLinksProps> = ({
  links,
  className = ''
}) => {
  return (
    <ul className={`footer__list ${className}`}>
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default FooterLinks;
