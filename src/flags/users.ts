/**
 * User Management Page Feature Flags
 * 
 * This file controls all features and components visible on the user management page.
 * Set any flag to false to hide that feature from users in production.
 */

import { UserFlags } from './types';

export const userFlags: UserFlags = {
  // Global flags
  enableDebugMode: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,

  // User management actions - Control CRUD operations for users
  showAddUser: true,               // Shows "Add New User" button and creation dialog
  showEditUser: true,              // Shows edit option in user action menu
  showDeleteUser: true,            // Shows delete option in user action menu
  showUserPasswordUpdate: true,    // Shows password update option for users
  showUserStatusToggle: true,      // Shows activate/deactivate toggle for users

  // User page features - Control main page functionality
  showUserStats: true,             // Shows user statistics cards at the top
  showUserFilters: true,           // Shows search and filter options
  showUserExport: true,           // Shows export user data functionality
  showUserActivity: true,          // Shows last login and activity information
  showUserPermissions: true,       // Shows user permission information
  showUserRoles: true,             // Shows user role chips and information

  // Advanced user features - Premium/advanced functionality
  enableBulkUserActions: false,    // Enables bulk operations on multiple users
  enableUserImport: false,         // Enables importing users from CSV/Excel
  enableUserAuditLog: false,       // Shows audit log of user actions
  enableUserNotifications: true,   // Enables user notification preferences
};

/**
 * User Management Action Descriptions:
 * 
 * showAddUser: Displays the "Add New User" button and opens the user creation dialog
 * showEditUser: Shows edit option in the user actions menu (three dots menu)
 * showDeleteUser: Shows delete option in the user actions menu with confirmation
 * showUserPasswordUpdate: Shows "Update Password" option in user actions menu
 * showUserStatusToggle: Shows activate/deactivate option in user actions menu
 */

/**
 * User Page Feature Descriptions:
 * 
 * showUserStats: Statistics cards showing total users, active users, recent logins, etc.
 * showUserFilters: Search bar and filter options (by role, status, etc.)
 * showUserExport: Export user list to CSV, Excel, or PDF formats
 * showUserActivity: Displays last login time and activity status for each user
 * showUserPermissions: Shows permission level and access rights for each user
 * showUserRoles: Displays role chips (Admin, Operator, etc.) for each user
 */

/**
 * Advanced User Feature Descriptions:
 * 
 * enableBulkUserActions: Select multiple users for bulk operations (delete, activate, etc.)
 * enableUserImport: Import users from external files with validation
 * enableUserAuditLog: Track and display all user actions and changes
 * enableUserNotifications: Manage user notification preferences and settings
 */

/**
 * Security Considerations:
 * 
 * - showDeleteUser should be carefully controlled in production
 * - showUserPasswordUpdate requires appropriate admin permissions
 * - enableUserAuditLog is important for compliance and security tracking
 * - enableBulkUserActions should be restricted to prevent accidental mass changes
 */

export default userFlags;