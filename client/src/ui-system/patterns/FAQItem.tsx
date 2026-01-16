/**
 * BlogPro FAQ Item Pattern
 * Collapsible FAQ item component
 */

import React, { useState } from 'react';
import './faq-item.css';

export interface FAQItemProps {
  question: string;
  answer: string | React.ReactNode;
  initialOpen?: boolean;
  className?: string;
}

export const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,
  initialOpen = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`faq-item ${isOpen ? 'faq-item--open' : ''} ${className}`}>
      <div className="faq-item__header" onClick={toggleOpen}>
        <h3 className="faq-item__question">{question}</h3>
        <svg
          className="faq-item__icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div className="faq-item__content">
        <div className="faq-item__answer">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default FAQItem;
