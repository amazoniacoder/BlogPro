/**
 * BlogPro Product Showcase Pattern
 * Professional product demo cards section
 */

import React from 'react';
import { Button } from '../components';
import './product-showcase.css';

export interface ProductCard {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

export interface ProductShowcaseProps {
  title: string;
  description?: string;
  products: ProductCard[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  title,
  description,
  products,
  ctaLabel = "Get in Touch",
  ctaHref = "/contact",
  className = ''
}) => {
  return (
    <section className={`product-showcase ${className}`}>
      <div className="product-showcase__container">
        <div className="product-showcase__header">
          <h2 className="product-showcase__title">{title}</h2>
          {description && (
            <p className="product-showcase__description">{description}</p>
          )}
        </div>
        
        <div className="product-showcase__grid grid-auto-fit">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-card__image">
                <img src={product.image} alt={product.title} />
              </div>
              <div className="product-card__content">
                <h3 className="product-card__title">{product.title}</h3>
                <p className="product-card__description">{product.description}</p>
                <a href={product.href} className="product-card__link">
                  Learn More →
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="product-showcase__cta">
          <Button variant="primary" size="lg" as="a" href={ctaHref}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
