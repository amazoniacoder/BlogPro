/**
 * Lazy Card Component
 * Dynamically imported for better performance
 */

import React, { Suspense } from 'react';

const CardComponent = React.lazy(() => 
  import('../card').then(module => ({
    default: module.Card
  }))
);

export const LazyCard: React.FC<any> = (props) => (
  <Suspense fallback={<div className="loading-placeholder" />}>
    <CardComponent {...props} />
  </Suspense>
);

export default LazyCard;
