/**
 * Lazy Modal Component
 * Dynamically imported for better performance
 */

import React, { Suspense } from 'react';

const ModalComponent = React.lazy(() => 
  import('../modal').then(module => ({
    default: module.Modal
  }))
);

export const LazyModal: React.FC<any> = (props) => (
  <Suspense fallback={<div className="loading-placeholder" />}>
    <ModalComponent {...props} />
  </Suspense>
);

export default LazyModal;
