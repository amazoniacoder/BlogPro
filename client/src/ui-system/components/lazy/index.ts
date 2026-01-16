/**
 * BlogPro Lazy Components
 * Dynamic imports for performance optimization
 */

export { LazyCard } from './LazyCard';
export { LazyModal } from './LazyModal';
export { LazyButton } from './LazyButton';
export { LazyForm } from './LazyForm';

// Preload critical components
export const preloadCriticalComponents = () => {
  import('../button');
  import('../form');
};
