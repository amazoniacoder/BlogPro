/**
 * Lazy Button Component
 * Dynamically imported for better performance
 */

import React, { Suspense } from 'react';

const ButtonComponent = React.lazy(() => 
  import('../button').then(module => ({
    default: module.Button
  }))
);

export const LazyButton: React.FC<any> = (props) => (
  <Suspense fallback={<div className="loading-placeholder" />}>
    <ButtonComponent {...props} />
  </Suspense>
);

export default LazyButton;
