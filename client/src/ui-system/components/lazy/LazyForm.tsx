/**
 * Lazy Form Component
 * Dynamically imported for better performance
 */

import React, { Suspense } from 'react';

const FormComponent = React.lazy(() => 
  import('../form').then(module => ({
    default: module.FormField
  }))
);

export const LazyForm: React.FC<any> = (props) => (
  <Suspense fallback={<div className="loading-placeholder" />}>
    <FormComponent {...props} />
  </Suspense>
);

export default LazyForm;
