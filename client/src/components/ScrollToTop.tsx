import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Component that scrolls to the top of the page when the route changes
 */
const ScrollToTop: React.FC = () => {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location]);
  
  return null; // This component doesn't render anything
};

export default ScrollToTop;
