/**
 * Components index
 * Centralized exports for all components organized by category
 */

// Authentication components
export * from './auth';

// Admin components
export * from './admin';

// Common components
export * from './common';

// UI components
export * from './ui';

// Layout components
export * from './layout';

// Modal components
export * from './modals';

// Menu components
export * from './menu';

// Order components
export * from './orders';

// Dashboard components (specific exports to avoid conflicts)
export {
  StatsCard,
  ChartCard,
  SectionHeader,
  EmptyState,
  DashboardHero,
  getStatusColor,
  getTableStatusColor,
  getOrderStatusColor,
} from './dashboards/DashboardComponents';
export { UnifiedDashboard } from './dashboards';
export { UserDataDashboard } from './dashboards';

// Registration components
export * from './registration';

// Template components
export * from './templates';

// Lazy components
export * from './lazy';