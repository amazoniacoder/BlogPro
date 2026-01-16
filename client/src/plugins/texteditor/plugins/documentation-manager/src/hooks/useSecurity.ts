/**
 * Security Hook
 * Manages security state and permission checking
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  UserRole, 
  LibraryType, 
  PermissionContext, 
  Permissions,
  calculatePermissions,
  hasPermission,
  validateAction,
  logSecurityAction
} from '../utils/permissions';

interface SecurityState {
  userRole: UserRole;
  userId?: string;
  permissions: Permissions;
  isAuthenticated: boolean;
  sessionExpiry?: Date;
}

interface UseSecurityReturn {
  security: SecurityState;
  checkPermission: (permission: keyof Permissions) => boolean;
  validateUserAction: (action: keyof Permissions, resource?: string) => { allowed: boolean; reason?: string };
  updateUserRole: (role: UserRole, userId?: string) => void;
  logout: () => void;
  getSecurityAuditLog: () => any[];
  clearAuditLog: () => void;
}

export const useSecurity = (
  libraryType: LibraryType,
  initialRole?: UserRole,
  initialUserId?: string
): UseSecurityReturn => {
  const [security, setSecurity] = useState<SecurityState>(() => {
    // Try to get user info from localStorage
    const token = localStorage.getItem('token');
    let userRole: UserRole = initialRole || null;
    let userId = initialUserId;
    
    if (token && !initialRole) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userRole = payload.role || null;
        userId = payload.userId || payload.id;
      } catch {
        // Invalid token, remain as null
      }
    }
    
    const context: PermissionContext = {
      userRole,
      libraryType,
      currentUserId: userId
    };
    
    return {
      userRole,
      userId,
      permissions: calculatePermissions(context),
      isAuthenticated: !!userRole,
      sessionExpiry: token ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined // 7 days
    };
  });

  // Update permissions when library type changes
  useEffect(() => {
    const context: PermissionContext = {
      userRole: security.userRole,
      libraryType,
      currentUserId: security.userId
    };
    
    setSecurity(prev => ({
      ...prev,
      permissions: calculatePermissions(context)
    }));
  }, [libraryType, security.userRole, security.userId]);

  // Check session expiry
  useEffect(() => {
    if (security.sessionExpiry && security.isAuthenticated) {
      const checkExpiry = () => {
        if (new Date() > security.sessionExpiry!) {
          logout();
        }
      };
      
      const interval = setInterval(checkExpiry, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [security.sessionExpiry, security.isAuthenticated]);

  const checkPermission = useCallback((permission: keyof Permissions): boolean => {
    const context: PermissionContext = {
      userRole: security.userRole,
      libraryType,
      currentUserId: security.userId
    };
    
    return hasPermission(context, permission);
  }, [security.userRole, security.userId, libraryType]);

  const validateUserAction = useCallback((
    action: keyof Permissions, 
    resource?: string
  ): { allowed: boolean; reason?: string } => {
    const context: PermissionContext = {
      userRole: security.userRole,
      libraryType,
      currentUserId: security.userId
    };
    
    const result = validateAction(context, action);
    
    // Log the action attempt
    logSecurityAction({
      userId: security.userId,
      userRole: security.userRole,
      action,
      resource: resource || `${libraryType}-library`,
      allowed: result.allowed,
      reason: result.reason
    });
    
    return result;
  }, [security.userRole, security.userId, libraryType]);

  const updateUserRole = useCallback((role: UserRole, userId?: string) => {
    const context: PermissionContext = {
      userRole: role,
      libraryType,
      currentUserId: userId
    };
    
    setSecurity({
      userRole: role,
      userId,
      permissions: calculatePermissions(context),
      isAuthenticated: !!role,
      sessionExpiry: role ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined
    });
    
    // Log role change
    logSecurityAction({
      userId,
      userRole: role,
      action: 'role_change',
      resource: 'user_session',
      allowed: true
    });
  }, [libraryType]);

  const logout = useCallback(() => {
    // Log logout action
    logSecurityAction({
      userId: security.userId,
      userRole: security.userRole,
      action: 'logout',
      resource: 'user_session',
      allowed: true
    });
    
    // Clear authentication
    localStorage.removeItem('token');
    
    setSecurity({
      userRole: null,
      userId: undefined,
      permissions: calculatePermissions({ userRole: null, libraryType }),
      isAuthenticated: false,
      sessionExpiry: undefined
    });
  }, [security.userId, security.userRole, libraryType]);

  const getSecurityAuditLog = useCallback(() => {
    const logs = localStorage.getItem('securityAuditLog');
    return logs ? JSON.parse(logs) : [];
  }, []);

  const clearAuditLog = useCallback(() => {
    localStorage.removeItem('securityAuditLog');
    
    logSecurityAction({
      userId: security.userId,
      userRole: security.userRole,
      action: 'clear_audit_log',
      resource: 'security_logs',
      allowed: security.userRole === 'admin'
    });
  }, [security.userId, security.userRole]);

  return {
    security,
    checkPermission,
    validateUserAction,
    updateUserRole,
    logout,
    getSecurityAuditLog,
    clearAuditLog
  };
};
