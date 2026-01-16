/**
 * BlogPro Structured Data Components
 * Structured data components for SEO
 */

import React, { useEffect } from 'react';

export interface BlogStructuredDataProps {
  title: string;
  description: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  url: string;
}

export const BlogStructuredData: React.FC<BlogStructuredDataProps> = ({
  title,
  description,
  author = 'BlogPro',
  datePublished,
  dateModified,
  image,
  url
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Organization",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "BlogPro"
    },
    "url": url,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    ...(datePublished && { "datePublished": datePublished }),
    ...(dateModified && { "dateModified": dateModified }),
    ...(image && { 
      "image": {
        "@type": "ImageObject",
        "url": image
      }
    })
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    script.id = 'blog-structured-data';
    
    const existing = document.getElementById('blog-structured-data');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    
    return () => {
      const scriptToRemove = document.getElementById('blog-structured-data');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [structuredData]);
  
  return null;
};

export interface WebsiteStructuredDataProps {
  name: string;
  description: string;
  url: string;
}

export const WebsiteStructuredData: React.FC<WebsiteStructuredDataProps> = ({
  name,
  description,
  url
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "description": description,
    "url": url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    script.id = 'website-structured-data';
    
    const existing = document.getElementById('website-structured-data');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    
    return () => {
      const scriptToRemove = document.getElementById('website-structured-data');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [structuredData]);
  
  return null;
};
