/**
 * Common components index
 * Centralized exports for all common/shared components
 */

export { default as AppInitializer } from './AppInitializer';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ErrorPage } from './ErrorPage';
export { default as Layout, default } from './Layout';
export { default as ThemeToggle } from './ThemeToggle';
export { default as NotificationCenter } from './NotificationCenter';

// Re-export from existing common folder
export * from '../common/FeatureFlag';
export * from '../common/PermissionWrapper';
export * from '../common/VenueAssignmentCheck';
export * from '../common/WorkspaceErrorBoundary';