import React from 'react';
import { ErrorPage } from '@/ui-system/patterns/ErrorPage';
import { useTranslation } from '@/hooks/useTranslation';

const NotFound: React.FC = () => {
  const { t } = useTranslation('errors');
  
  const illustration = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="240"
      height="240"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );

  return (
    <div className="container">
      <ErrorPage
        code="404"
        title={t('pageNotFound')}
        description={t('pageNotFoundDescription')}
        actions={[
          { label: t('goToHomepage'), href: "/", variant: "primary" },
          { label: t('contactSupport'), href: "/contact", variant: "secondary" }
        ]}
        illustration={illustration}
      />
    </div>
  );
};

export default NotFound;
