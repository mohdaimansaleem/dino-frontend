/**
 * Dashboard Page Feature Flags
 * 
 * This file controls all features and components visible on the dashboard page.
 * Set any flag to false to hide that feature from users in production.
 */

import { DashboardFlags } from './types';

export const dashboardFlags: DashboardFlags = {
  // Global flags
  enableDebugMode: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,

  // Dashboard tabs visibility - Control which tabs appear in the dashboard
  showOverviewTab: true,           // Shows the main overview tab with key metrics
  showSalesAnalyticsTab: true,     // Shows sales analytics and revenue charts
  showMenuPerformanceTab: true,    // Shows menu item performance and popularity
  showTablesOrdersTab: true,       // Shows table status and order management
  showPaymentsTab: true,           // Shows payment analytics and transaction data

  // Dashboard components - Control main dashboard sections
  showDashboardStats: true,        // Shows the statistics cards at the top
  showRealTimeUpdates: true,       // Enables real-time data updates
  showQuickActions: true,          // Shows quick action buttons
  showRecentActivity: true,        // Shows recent activity feed
  showPerformanceCharts: true,     // Shows performance charts and graphs

  // Individual chart controls - Control specific charts and visualizations
  showRevenueChart: true,          // Shows revenue and orders analytics chart
  showOrderStatusChart: true,      // Shows order status distribution pie chart
  showSalesMetrics: false,          // Shows sales performance metrics cards
  showAnalyticsCharts: true,       // Shows detailed analytics charts

  // Dashboard features - Advanced functionality
  enableDataExport: true,          // Allows exporting dashboard data to CSV/PDF
  enableAdvancedFilters: true,     // Shows advanced filtering options
  enableCustomDateRange: true,     // Allows custom date range selection
  enableNotifications: true,       // Shows notification alerts and badges
};

/**
 * Dashboard Tab Descriptions:
 * 
 * showOverviewTab: Main dashboard view with key performance indicators
 * showSalesAnalyticsTab: Detailed sales data, revenue trends, and analytics
 * showMenuPerformanceTab: Menu item popularity, sales by item, performance metrics
 * showTablesOrdersTab: Table occupancy, order status, table management
 * showPaymentsTab: Payment methods, transaction success rates, payment analytics
 */

/**
 * Dashboard Component Descriptions:
 * 
 * showDashboardStats: Top-level statistics cards (revenue, orders, tables, etc.)
 * showRealTimeUpdates: Live data updates without page refresh
 * showQuickActions: Quick access buttons for common tasks
 * showRecentActivity: Recent orders, updates, and system activity
 * showPerformanceCharts: Visual charts and graphs for data analysis
 */

/**
 * Dashboard Feature Descriptions:
 * 
 * enableDataExport: Export functionality for reports and data
 * enableAdvancedFilters: Complex filtering options for data analysis
 * enableCustomDateRange: Custom date picker for historical data
 * enableNotifications: Real-time notifications and alerts
 */

export default dashboardFlags;