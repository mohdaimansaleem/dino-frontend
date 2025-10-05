/**
 * Error Components Barrel Export
 * 
 * Centralized export for all error-related components
 */

export {
  StandardErrorPage,
  NotFoundErrorPage,
  ServerErrorPage,
  NetworkErrorPage,
  AccessDeniedErrorPage,
} from './StandardErrorPage';

// Re-export existing error components for backward compatibility
export { default as GlobalErrorBoundary } from '../ErrorBoundary/GlobalErrorBoundary';
// Use GlobalErrorBoundary as ErrorBoundary for backward compatibility
export { default as ErrorBoundary } from '../ErrorBoundary/GlobalErrorBoundary';

// Re-export error pages from ErrorPages directory
export * from '../ErrorPages';