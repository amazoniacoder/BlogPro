// Lazy loading component for translations to improve performance
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface LazyTranslationProps {
  namespace: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyTranslation: React.FC<LazyTranslationProps> = ({ 
  namespace, 
  children, 
  fallback = <span>Loading...</span> 
}) => {
  const { ready } = useTranslation(namespace);
  
  if (!ready) {
    return <>{fallback}</>;
  }
  
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default LazyTranslation;
