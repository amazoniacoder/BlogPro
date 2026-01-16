import { Suspense, ComponentType } from 'react';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <div className="page-loading bg-primary">
    <div className="page-loading__spinner"></div>
    <span className="page-loading__text">Загрузка...</span>
  </div>
);

export const LazyWrapper = ({ children, fallback = <DefaultFallback /> }: LazyWrapperProps) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

export const withLazyWrapper = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <LazyWrapper fallback={fallback}>
      <Component {...props} />
    </LazyWrapper>
  );
};
