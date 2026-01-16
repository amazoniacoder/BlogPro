/**
 * BlogPro Lazy Loading Utilities
 * Component lazy loading optimization
 */

import React, { Suspense, ComponentType } from 'react';
import { Spinner } from '../components';

export interface LazyComponentProps {
  fallback?: React.ReactNode;
}

export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = React.lazy(importFn);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <Spinner size="md" />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy load heavy components
export const LazyDialog = createLazyComponent(
  () => import('../components/overlay/Dialog')
);

export const LazySheet = createLazyComponent(
  () => import('../components/overlay/Sheet')
);

export const LazyDataTable = createLazyComponent(
  () => import('../patterns/admin/DataTable')
);

export const LazyRichTextEditor = createLazyComponent(
  () => import('../components/input/RichTextEditor')
);

export const LazyColorPicker = createLazyComponent(
  () => import('../components/input/ColorPicker')
);

export const LazyDatePicker = createLazyComponent(
  () => import('../components/input/DatePicker')
);
