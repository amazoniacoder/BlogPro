import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Component that scrolls to top when admin routes change
 * Improves user experience when navigating between admin pages
 */
const AdminScrollToTop = () => {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
};

export default AdminScrollToTop;
