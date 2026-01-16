/**
 * BlogPro Language Detector Component
 * Detects and sets language based on URL or browser preferences
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

export const LanguageDetector: React.FC = () => {
  const { i18n } = useTranslation();
  const [location] = useLocation();
  
  useEffect(() => {
    // Check if URL contains language prefix
    const pathLang = location.split('/')[1];
    
    if (pathLang === 'ru' || pathLang === 'en') {
      if (i18n.language !== pathLang) {
        i18n.changeLanguage(pathLang);
      }
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0];
      const supportedLang = ['en', 'ru'].includes(browserLang) ? browserLang : 'en';
      
      if (i18n.language !== supportedLang) {
        i18n.changeLanguage(supportedLang);
      }
    }
  }, [location, i18n]);
  
  return null;
};

export default LanguageDetector;
