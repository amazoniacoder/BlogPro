import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { routeCacheService } from '@/services/cache/route-cache';
import { AdminRoutes } from '../utils/routePatterns';

/**
 * Custom hook to handle admin routing logic
 * Manages active section detection and route caching
 * @returns Object containing activeSection and related routing utilities
 */
export function useAdminRouting() {
  const [location, navigate] = useLocation();
  
  // Extract the active section from the URL path
  const path = location.split("/").filter(Boolean);
  
  // If we're at /admin, set activeSection to "dashboard"
  // Otherwise, use the second path segment
  let activeSection = path.length > 1 && path[0] === "admin" 
    ? path[1] 
    : path.length === 1 && path[0] === "admin"
      ? "dashboard"
      : "dashboard";
      

  
  // Handle section change
  const handleSectionChange = (section: string, path: string) => {
    console.log(`Navigating to section: ${section}, path: ${path}`);
    // Use AdminRoutes for navigation validation
    const isValidRoute = Object.values(AdminRoutes).includes(path);
    if (isValidRoute) {
      console.log(`Valid admin route: ${path}`);
    }
    navigate(path);
  };
  
  // Log routing information for debugging
  useEffect(() => {
    console.log(`Current location: ${location}`);
    console.log(`Active section: ${activeSection}`);
    console.log(`Path segments:`, path);
    
    // Preload data for admin sections based on the active section
    if (location.startsWith('/admin')) {
      if (activeSection === 'dashboard') {
        routeCacheService.preloadRouteData('/admin/dashboard/blog', '/api/blog');
      } else if (activeSection === 'blog') {
        routeCacheService.preloadRouteData('/admin/blog', '/api/blog');
      } else if (activeSection === 'users') {
        routeCacheService.preloadRouteData('/admin/users', '/api/admin/users');
      }
    }
  }, [location, activeSection, path]);
  
  return {
    activeSection,
    handleSectionChange,
    location,
    navigate
  };
}

export default useAdminRouting;
