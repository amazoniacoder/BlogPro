/**
 * BlogPro Contact Page Pattern
 * Complete contact page with form and information
 */

import React from 'react';
import './contact-page.css';

export interface ContactPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({

  children,
  className = ''
}) => {
  return (
    <div className={`contact-page ${className}`}>
      <div className="contact-page__container">
           
        <div className="contact-page__content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
