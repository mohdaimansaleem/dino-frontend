/**
 * Authentication components index
 * Centralized exports for all authentication-related components
 */

export { default as ProtectedRoute } from './ProtectedRoute';
export { default as RoleProtectedRoute } from './RoleProtectedRoute';
export { default as PermissionGate } from './PermissionGate';
export { default as PermissionSync } from './PermissionSync';
export { usePermissions, default as RoleBasedComponent } from './RoleBasedComponent';
export { default as UserProfile } from './UserProfile';
export { default as UserPermissions } from './UserPermissions';
export { default as PasswordStrengthIndicator } from './PasswordStrengthIndicator';
export { default as PasswordUpdateDialog } from './PasswordUpdateDialog';