// Hook to monitor translation performance
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useTranslationPerformance = () => {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const startTime = performance.now();
    
    const handleLanguageChange = () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Log performance metrics (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Translation loaded in ${loadTime.toFixed(2)}ms`);
      }
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  return {
    currentLanguage: i18n.language,
    isReady: i18n.isInitialized
  };
};
