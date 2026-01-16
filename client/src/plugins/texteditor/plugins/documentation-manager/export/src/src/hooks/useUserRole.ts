/**
 * User Role Management Hook
 * Centralized user authentication and role detection
 * Max 150 lines - strict TypeScript compliance
 */

import { useState, useEffect, useCallback } from 'react';
import { UserRole, UseUserRoleReturn } from '../types/SharedTypes';

interface TokenPayload {
  readonly role: string;
  readonly exp: number;
  readonly userId: string;
  readonly username: string;
}

/**
 * Hook for managing user role and permissions
 * Provides centralized authentication state and role-based permissions
 */
export const useUserRole = (): UseUserRoleReturn => {
  const [userRole, setUserRole] = useState<UserRole>(null);

  /**
   * Extract user role from JWT token
   */
  const getUserRoleFromToken = useCallback((): UserRole => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Decode JWT payload
      const payload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;
      
      // Check token expiration
      if (Date.now() >= payload.exp * 1000) {
        localStorage.removeItem('token');
        return null;
      }

      // Validate role
      const role = payload.role?.toLowerCase();
      if (['admin', 'editor', 'user'].includes(role)) {
        return role as UserRole;
      }

      return 'user'; // Default fallback
    } catch (error) {
      console.warn('Invalid token format:', error);
      localStorage.removeItem('token');
      return null;
    }
  }, []);

  /**
   * Initialize user role on mount and token changes
   */
  useEffect(() => {
    const initializeRole = () => {
      const role = getUserRoleFromToken();
      setUserRole(role);
    };

    initializeRole();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        initializeRole();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [getUserRoleFromToken]);

  /**
   * Check if user can edit content
   */
  const canEdit = userRole === 'admin' || userRole === 'editor';

  /**
   * Check if user can manage library structure
   */
  const canManage = userRole === 'admin';

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = userRole !== null;

  return {
    userRole,
    canEdit,
    canManage,
    isAuthenticated
  };
};
