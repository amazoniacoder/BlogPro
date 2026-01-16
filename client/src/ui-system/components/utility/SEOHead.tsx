/**
 * BlogPro SEO Head Component
 * SEO component with language support
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  noindex = false
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const siteTitle = 'BlogPro';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  useEffect(() => {
    // Set document title
    document.title = fullTitle;
    
    // Set language attribute
    document.documentElement.lang = currentLang;
    
    // Update meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    if (description) updateMeta('description', description);
    if (keywords) updateMeta('keywords', keywords);
    updateMeta('og:title', fullTitle, true);
    if (description) updateMeta('og:description', description, true);
    updateMeta('og:type', 'website', true);
    updateMeta('og:locale', currentLang === 'ru' ? 'ru_RU' : 'en_US', true);
    if (ogImage) updateMeta('og:image', ogImage, true);
    if (noindex) updateMeta('robots', 'noindex,nofollow');
    
    // Handle canonical link
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }
    
  }, [fullTitle, description, keywords, currentLang, ogImage, noindex, canonical]);
  
  return null;
};

export default SEOHead;
