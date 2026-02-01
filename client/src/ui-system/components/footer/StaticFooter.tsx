/**
 * BlogPro Static Footer Component
 * Original static footer for backward compatibility
 */

import React from 'react';
import { Link } from 'wouter';
import { Icon } from '../../icons/components';
import { useTranslation } from '@/hooks/useTranslation';
import './footer.css';

export interface StaticFooterProps {
  className?: string;
}

export const StaticFooter: React.FC<StaticFooterProps> = ({ className = '' }) => {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer footer--visible ${className}`}>
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <h3 className="footer__logo m-0">BlogPro</h3>
            <p className="footer__tagline text-secondary">{t('footerTagline', 'Professional web solutions for your business success.')}</p>
            <div className="footer__social">
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="font-bold text-secondary transition">
                <Icon name="share" size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="transition">
                <Icon name="share" size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="VK" className="transition">
                <Icon name="share" size={20} />
              </a>
            </div>
          </div>
          
          <div className="footer__links">
            <div className="footer__column">
              <h4 className="footer__heading">{t('services', 'Services')}</h4>
              <ul className="footer__list p-0 m-0">
                <li><Link href="/products/landing-page" className="transition">{t('landingPages', 'Landing Pages')}</Link></li>
                <li><Link href="/products/business-card" className="transition">{t('businessCards', 'Business Cards')}</Link></li>
                <li><Link href="/products/blog" className="transition">{t('blogs', 'Blogs')}</Link></li>
                <li><Link href="/products/store" className="transition">{t('stores', 'Stores')}</Link></li>
              </ul>
            </div>
            
            <div className="footer__column">
              <h4 className="footer__heading">{t('company', 'Company')}</h4>
              <ul className="footer__list p-0 m-0">
                <li><Link href="/about" className="transition">{t('about', 'About')}</Link></li>
                <li><Link href="/contact" className="transition">{t('contact', 'Contact')}</Link></li>
                <li><Link href="/blog" className="transition">{t('blog', 'Blog')}</Link></li>
              </ul>
            </div>
            
            <div className="footer__column">
              <h4 className="footer__heading">{t('contact', 'Contact')}</h4>
              <address className="footer__address text-secondary">
                <p>123 Web Street</p>
                <p>Design City, DC 12345</p>
                <p><a href="mailto:info@webdesignstudio.com" className="text-secondary transition">info@webdesignstudio.com</a></p>
                <p><a href="tel:+15551234567" className="text-secondary transition">(555) 123-4567</a></p>
              </address>
            </div>
          </div>
        </div>
        
        <div className="footer__bottom">
          <p className="footer__copyright text-secondary">© {currentYear} BlogPro. {t('allRightsReserved', 'All rights reserved.')}</p>
          <div className="footer__legal">
            <Link href="/privacy" className="text-secondary transition">{t('privacyPolicy', 'Privacy Policy')}</Link>
            <Link href="/terms" className="text-secondary transition">{t('termsOfService', 'Terms of Service')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};