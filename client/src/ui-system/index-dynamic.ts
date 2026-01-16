/**
 * BlogPro UI System - Dynamic Loading
 * Optimized imports for better performance
 */

// Critical components (loaded immediately)
export { Button } from './components/button';
export { Icon } from './icons/components';

// Non-critical components (lazy loaded)
export { LazyCard, LazyModal } from './components/lazy';

// Preload function for critical path
export const preloadUISystem = () => {
  // Preload critical CSS
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = '/ui-system/dist/ui-system-optimized.css';
  link.as = 'style';
  document.head.appendChild(link);
  
  // Preload critical icons
  const iconLink = document.createElement('link');
  iconLink.rel = 'preload';
  iconLink.href = '/ui-system/icons/dist/sprite-minimal.svg';
  iconLink.as = 'image';
  document.head.appendChild(iconLink);
};
