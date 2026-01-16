import React, { ReactNode } from 'react';
import { AnalyticsErrorBoundary as UIAnalyticsErrorBoundary } from '@/ui-system/components/admin';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

const AnalyticsErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  return (
    <UIAnalyticsErrorBoundary fallback={fallback}>
      {children}
    </UIAnalyticsErrorBoundary>
  );
};

export default AnalyticsErrorBoundary;
