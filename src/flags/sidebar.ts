/**
 * Sidebar Navigation Feature Flags
 * 
 * This file controls all navigation items and features in the sidebar.
 * Set any flag to false to hide that navigation item or feature from users.
 */

import { SidebarFlags } from './types';

export const sidebarFlags: SidebarFlags = {
  // Global flags
  enableDebugMode: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,

  // Navigation items - Control which menu items appear in the sidebar
  showDashboardNav: true,          // Shows "Dashboard" navigation item
  showOrdersNav: true,             // Shows "Orders" navigation item
  showMenuNav: true,               // Shows "Menu" navigation item
  showTablesNav: true,             // Shows "Tables" navigation item
  showCouponsNav: true,            // Shows "Coupons" navigation item
  showUsersNav: true,              // Shows "Users" navigation item
  showPermissionsNav: true,        // Shows "Permissions" navigation item
  showSettingsNav: true,           // Shows "Settings" navigation item
  showWorkspaceNav: true,          // Shows "Workspace" navigation item (SuperAdmin only)

  // Sidebar features - Control sidebar functionality
  showVenueStatus: true,           // Shows venue status toggle and information
  showUserProfile: true,          // Shows user profile section in sidebar
  showQuickActions: false,         // Shows quick action buttons in sidebar
  showNotificationBadges: true,    // Shows notification badges on navigation items

  // Sidebar behavior - Control sidebar interaction features
  enableSidebarCollapse: true,     // Enables sidebar collapse/expand functionality
  enableSidebarSearch: false,      // Enables search functionality in sidebar
  enableSidebarTooltips: true,     // Shows tooltips when sidebar is collapsed
};

/**
 * Navigation Item Descriptions:
 * 
 * showDashboardNav: Main dashboard with analytics and overview
 * showOrdersNav: Order management and tracking functionality
 * showMenuNav: Menu item and category management
 * showTablesNav: Table management and QR code generation
 * showCouponsNav: Coupon and promotion management
 * showUsersNav: User account management and permissions
 * showPermissionsNav: Advanced permission and role management
 * showSettingsNav: Venue and system settings
 * showWorkspaceNav: Workspace management (SuperAdmin feature)
 */

/**
 * Sidebar Feature Descriptions:
 * 
 * showVenueStatus: Venue open/closed status with toggle switch
 * showUserProfile: Current user information and role display
 * showQuickActions: Quick access buttons for common tasks
 * showNotificationBadges: Red badges showing pending items/notifications
 */

/**
 * Sidebar Behavior Descriptions:
 * 
 * enableSidebarCollapse: Allows users to collapse sidebar to save space
 * enableSidebarSearch: Search functionality to quickly find navigation items
 * enableSidebarTooltips: Helpful tooltips when sidebar is in collapsed mode
 */

/**
 * Role-Based Visibility:
 * 
 * Some navigation items are automatically filtered based on user permissions:
 * - showWorkspaceNav: Only visible to SuperAdmin users
 * - showPermissionsNav: Only visible to Admin and SuperAdmin users
 * - showUsersNav: Only visible to Admin and SuperAdmin users
 * 
 * These flags provide additional control on top of role-based filtering.
 */

/**
 * Production Recommendations:
 * 
 * - Keep showDashboardNav, showOrdersNav, showMenuNav always true for core functionality
 * - showWorkspaceNav should remain true but is automatically filtered by role
 * - enableSidebarCollapse improves UX on smaller screens
 * - showNotificationBadges helps users stay aware of pending tasks
 * - showVenueStatus is critical for restaurant operations
 */

export default sidebarFlags;