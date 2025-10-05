/**
 * UI Components Barrel Export
 * 
 * This file provides a single entry point for all UI components
 * following atomic design principles.
 */

// ===================================================================
// ATOMS - Basic building blocks
// ===================================================================

// Button Components
export { Button, default as ButtonComponent } from './Button';

// Card Components  
export { 
  Card, 
  ContentCard,
  MediaCard,
  ProfileCard,
  StatsCard,
  default as CardComponent 
} from './Card';

// Loading Components
export { 
  LoadingSpinner, 
  PageLoader, 
  ContentLoader, 
  InlineLoader,
  default as LoadingSpinnerComponent 
} from './LoadingSpinner';

// Loading States & Skeletons
export {
  TableLoadingSkeleton,
  CardLoadingSkeleton,
  PageLoadingSkeleton,
  InlineLoader as LoadingStatesInlineLoader, // Alias to avoid conflict
  FullPageLoader,
  RetryLoader,
  EmptyState,
  SmartLoading,
  EnhancedFullPageLoader,
  default as LoadingStates
} from './LoadingStates';

// Toast Notifications
export {
  ToastContainer,
  useToast,
  type ToastSeverity,
  type ToastMessage
} from './ToastNotification';
export { default as ToastNotification } from './ToastNotification';
export { default as ToastNotificationComponent } from './ToastNotification';

// ===================================================================
// MOLECULES - Component combinations
// ===================================================================

// Animated Components
export { default as AnimatedBackground } from './AnimatedBackground';
export { default as AnimatedBackgroundComponent } from './AnimatedBackground';
export { default as AnimatedCounter } from './AnimatedCounter';
export { default as AnimatedCounterComponent } from './AnimatedCounter';
export { default as MenuAnimatedBackground } from './MenuAnimatedBackground';
export { default as MenuAnimatedBackgroundComponent } from './MenuAnimatedBackground';
export { default as LoginAnimatedBackground } from './LoginAnimatedBackground';
export { default as LoginAnimatedBackgroundComponent } from './LoginAnimatedBackground';
export { default as SpaceLoginBackground } from './SpaceLoginBackground';
export { default as SpaceLoginBackgroundComponent } from './SpaceLoginBackground';

// ===================================================================
// UTILITY EXPORTS
// ===================================================================

// Common component props and types
// Note: ButtonProps and CardProps are internal interfaces, not exported from components
// If needed, they can be re-exported here

// ===================================================================
// LEGACY EXPORTS (for backward compatibility)
// ===================================================================

// These exports maintain backward compatibility
// They will be deprecated in future versions
export { Button as StandardButton } from './Button';
export { Card as StandardCard } from './Card';

// ===================================================================
// COMPONENT COLLECTIONS
// ===================================================================

// Note: Component collections are commented out due to import/export complexity
// Individual components should be imported directly from their respective files