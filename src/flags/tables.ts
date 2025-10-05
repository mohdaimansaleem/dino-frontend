/**
 * Table Management Page Feature Flags
 * 
 * This file controls all features and components visible on the table management page.
 * Set any flag to false to hide that feature from users in production.
 */

import { TableFlags } from './types';

export const tableFlags: TableFlags = {
  // Global flags
  enableDebugMode: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,

  // Table management actions - Control CRUD operations for tables
  showAddTable: true,              // Shows "Add Table" button and creation dialog
  showEditTable: true,             // Shows edit button on table cards
  showDeleteTable: true,           // Shows delete button on table cards
  showTableQRCode: true,           // Shows QR code generation and display for tables
  showTableStatus: true,           // Shows table status (occupied, available, reserved)

  // Table page features - Control main page functionality
  showTableStats: true,            // Shows table statistics at the top of the page
  showTableAreas: true,            // Shows table area management and organization
  showTableFilters: true,          // Shows filtering options (by area, status, etc.)
  showTableLayout: true,           // Shows visual table layout and floor plan
  showTableReservations: true,    // Shows table reservation management

  // Advanced table features - Premium/advanced functionality
  enableTableMerging: false,       // Enables merging multiple tables for large parties
  enableTableScheduling: false,    // Enables scheduling table availability
  enableWaitlistManagement: false, // Enables customer waitlist functionality
  enableTableAnalytics: true,      // Enables table usage analytics and reports
};

/**
 * Table Management Action Descriptions:
 * 
 * showAddTable: Displays the "Add New Table" button and opens the creation dialog
 * showEditTable: Shows edit icon on each table card for modifications
 * showDeleteTable: Shows delete icon on each table card for removal
 * showTableQRCode: Shows QR code for each table and QR code management features
 * showTableStatus: Shows current status of each table (occupied, available, etc.)
 */

/**
 * Table Page Feature Descriptions:
 * 
 * showTableStats: Statistics showing total tables, occupancy rate, available tables
 * showTableAreas: Management of different areas/sections in the restaurant
 * showTableFilters: Filter tables by area, status, capacity, etc.
 * showTableLayout: Visual representation of table layout and floor plan
 * showTableReservations: Table booking and reservation management system
 */

/**
 * Advanced Table Feature Descriptions:
 * 
 * enableTableMerging: Combine adjacent tables for larger groups
 * enableTableScheduling: Set specific availability times for tables
 * enableWaitlistManagement: Manage customer waiting lists and notifications
 * enableTableAnalytics: Detailed analytics on table usage and turnover
 */

export default tableFlags;