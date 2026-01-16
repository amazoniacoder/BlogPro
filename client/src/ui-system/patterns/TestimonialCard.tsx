/**
 * BlogPro Testimonial Card Pattern
 * Card component for displaying customer testimonials
 */

import React from 'react';
import './testimonial-card.css';

export interface TestimonialCardProps {
  quote: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  rating?: number;
  className?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  rating = 5,
  className = ''
}) => {
  return (
    <div className={`testimonial-card ${className}`}>
      <p className="testimonial-card__quote">{quote}</p>
      <div className="testimonial-card__author">
        {author.avatar && (
          <img
            src={author.avatar}
            alt={author.name}
            className="testimonial-card__avatar"
            loading="lazy"
          />
        )}
        <div className="testimonial-card__info">
          <span className="testimonial-card__name">{author.name}</span>
          <span className="testimonial-card__role">{author.role}</span>
          {rating > 0 && (
            <div className="testimonial-card__rating">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="testimonial-card__star"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={i < rating ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
