/**
 * Lazy Loading Components Barrel Export
 * 
 * Centralized exports for all lazy loading functionality
 */

// Main lazy component loader
export {
  LazyComponents,
  lazyManager,
  LazyWrapper,
  withLazyLoading,
  default as LazyComponentLoader
} from './LazyComponentLoader';

// Skeleton components
export {
  PageSkeleton,
  CardSkeleton,
  ListSkeleton,
  DashboardSkeleton
} from './LazyComponentLoader';

// Utility functions
export {
  preloadCriticalComponents,
  preloadAdminComponents,
  preloadPublicComponents
} from './LazyComponentLoader';

// Hooks
export {
  usePreloadComponents,
  useIntersectionPreload
} from './LazyComponentLoader';

// Types (re-export for convenience)
// Note: Types are internal to LazyComponentLoader, re-export if needed