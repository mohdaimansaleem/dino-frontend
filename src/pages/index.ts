/**
 * Pages index
 * Centralized exports for all pages organized by category
 */

// Public pages
export * from './public';

// Authentication pages
export * from './auth';

// Menu pages
export * from './menu';

// Admin pages (specific exports)
export { default as AdminDashboard } from './admin/AdminDashboard';
export { default as UserManagement } from './admin/UserManagement';
export { default as MenuManagement } from './admin/MenuManagement';
export { default as OrdersManagement } from './admin/OrdersManagement';
export { default as TableManagement } from './admin/TableManagement';