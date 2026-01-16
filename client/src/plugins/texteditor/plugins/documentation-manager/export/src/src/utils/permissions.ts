/**
 * Role-Based Permission System
 * Centralized permission checking for documentation features
 */

export type UserRole = 'admin' | 'editor' | 'user' | null;
export type LibraryType = 'texteditor' | 'website';

export interface PermissionContext {
  userRole: UserRole;
  libraryType: LibraryType;
  contentOwnerId?: string;
  currentUserId?: string;
}

export interface Permissions {
  canViewContent: boolean;
  canCreateContent: boolean;
  canEditContent: boolean;
  canDeleteContent: boolean;
  canManageStructure: boolean;
  canSwitchLibraries: boolean;
  canAccessAdminPanel: boolean;
  canExportContent: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
}

/**
 * Calculate permissions based on user role and context
 */
export const calculatePermissions = (context: PermissionContext): Permissions => {
  const { userRole, contentOwnerId, currentUserId } = context;
  
  // Public users (no authentication)
  if (!userRole) {
    return {
      canViewContent: true,
      canCreateContent: false,
      canEditContent: false,
      canDeleteContent: false,
      canManageStructure: false,
      canSwitchLibraries: false,
      canAccessAdminPanel: false,
      canExportContent: true, // Allow public export
      canManageUsers: false,
      canViewAnalytics: false
    };
  }
  
  // Regular authenticated users
  if (userRole === 'user') {
    return {
      canViewContent: true,
      canCreateContent: false,
      canEditContent: false,
      canDeleteContent: false,
      canManageStructure: false,
      canSwitchLibraries: false,
      canAccessAdminPanel: false,
      canExportContent: true,
      canManageUsers: false,
      canViewAnalytics: false
    };
  }
  
  // Editors
  if (userRole === 'editor') {
    const isOwner = contentOwnerId && currentUserId && contentOwnerId === currentUserId;
    
    return {
      canViewContent: true,
      canCreateContent: true,
      canEditContent: true,
      canDeleteContent: isOwner || !contentOwnerId, // Can delete own content or unowned content
      canManageStructure: false, // Editors cannot manage structure
      canSwitchLibraries: true,
      canAccessAdminPanel: true,
      canExportContent: true,
      canManageUsers: false,
      canViewAnalytics: true
    };
  }
  
  // Administrators
  if (userRole === 'admin') {
    return {
      canViewContent: true,
      canCreateContent: true,
      canEditContent: true,
      canDeleteContent: true,
      canManageStructure: true,
      canSwitchLibraries: true,
      canAccessAdminPanel: true,
      canExportContent: true,
      canManageUsers: true,
      canViewAnalytics: true
    };
  }
  
  // Default: no permissions
  return {
    canViewContent: false,
    canCreateContent: false,
    canEditContent: false,
    canDeleteContent: false,
    canManageStructure: false,
    canSwitchLibraries: false,
    canAccessAdminPanel: false,
    canExportContent: false,
    canManageUsers: false,
    canViewAnalytics: false
  };
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  context: PermissionContext,
  permission: keyof Permissions
): boolean => {
  const permissions = calculatePermissions(context);
  return permissions[permission];
};

/**
 * Get user-friendly permission description
 */
export const getPermissionDescription = (userRole: UserRole): string => {
  switch (userRole) {
    case 'admin':
      return 'Full access to all features including structure management and user administration';
    case 'editor':
      return 'Can create, edit, and manage content. Cannot modify site structure';
    case 'user':
      return 'Can view and export documentation content';
    case null:
      return 'Public access - can view and export content only';
    default:
      return 'No permissions';
  }
};

/**
 * Get available actions for user role
 */
export const getAvailableActions = (context: PermissionContext): string[] => {
  const permissions = calculatePermissions(context);
  const actions: string[] = [];
  
  if (permissions.canViewContent) actions.push('View Content');
  if (permissions.canCreateContent) actions.push('Create Content');
  if (permissions.canEditContent) actions.push('Edit Content');
  if (permissions.canDeleteContent) actions.push('Delete Content');
  if (permissions.canManageStructure) actions.push('Manage Structure');
  if (permissions.canSwitchLibraries) actions.push('Switch Libraries');
  if (permissions.canAccessAdminPanel) actions.push('Access Admin Panel');
  if (permissions.canExportContent) actions.push('Export Content');
  if (permissions.canManageUsers) actions.push('Manage Users');
  if (permissions.canViewAnalytics) actions.push('View Analytics');
  
  return actions;
};

/**
 * Validate action against user permissions
 */
export const validateAction = (
  context: PermissionContext,
  action: keyof Permissions
): { allowed: boolean; reason?: string } => {
  const permissions = calculatePermissions(context);
  
  if (permissions[action]) {
    return { allowed: true };
  }
  
  const { userRole } = context;
  let reason = 'Insufficient permissions';
  
  if (!userRole) {
    reason = 'Authentication required';
  } else if (userRole === 'user') {
    reason = 'Editor or admin access required';
  } else if (userRole === 'editor' && action === 'canManageStructure') {
    reason = 'Admin access required for structure management';
  }
  
  return { allowed: false, reason };
};

/**
 * Security audit log entry
 */
export interface SecurityAuditEntry {
  timestamp: Date;
  userId?: string;
  userRole: UserRole;
  action: string;
  resource: string;
  allowed: boolean;
  reason?: string;
  ip?: string;
}

/**
 * Log security-related actions
 */
export const logSecurityAction = (entry: Omit<SecurityAuditEntry, 'timestamp'>): void => {
  const auditEntry: SecurityAuditEntry = {
    ...entry,
    timestamp: new Date()
  };
  
  // In production, this would be sent to a security logging service
  console.log('[SECURITY AUDIT]', JSON.stringify(auditEntry));
  
  // Store in localStorage for demo purposes (in production, use proper logging)
  const existingLogs = JSON.parse(localStorage.getItem('securityAuditLog') || '[]');
  existingLogs.push(auditEntry);
  
  // Keep only last 100 entries
  if (existingLogs.length > 100) {
    existingLogs.splice(0, existingLogs.length - 100);
  }
  
  localStorage.setItem('securityAuditLog', JSON.stringify(existingLogs));
};
