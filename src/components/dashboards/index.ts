/**
 * Dashboard Components Barrel Export
 * 
 * Centralized exports for dashboard-related components
 */

// Main Dashboard Components
export { default as UnifiedDashboard } from './UnifiedDashboard';
export { default as DashboardRouter } from './DashboardRouter';

// Legacy Dashboard Components removed - now using UnifiedDashboard for all roles
export { default as UserDataDashboard } from './UserDataDashboard';
export { default as RealTimeDashboard } from './RealTimeDashboard';

// Standardized Dashboard Components
export {
  StatsCard,
  ChartCard,
  SectionHeader,
  EmptyState,
  DashboardHero,
  getStatusColor,
  getTableStatusColor,
  getOrderStatusColor,
} from './DashboardComponents';