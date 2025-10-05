/**
 * Common Components Barrel Export
 * 
 * Centralized exports for common reusable components
 */

// Permission Components
export { default as PermissionWrapper } from './PermissionWrapper';
export {
  CanViewDashboard,
  CanManageOrders,
  CanManageMenu,
  CanManageTables,
  CanManageUsers,
  CanManageVenues,
  CanViewSettings,
  SuperAdminOnly,
  AdminOnly,
  OperatorOnly,
  AdminOrAbove,
  OperatorOrAbove,
  withPermissions,
  usePermissionCheck,
} from './PermissionWrapper';

// Feature Flag Component
export { default as FeatureFlag } from './FeatureFlag';

// Venue Assignment Check
export { default as VenueAssignmentCheck } from './VenueAssignmentCheck';

// Workspace Error Boundary
export { default as WorkspaceErrorBoundary } from './WorkspaceErrorBoundary';