/**
 * Orders Management Page Feature Flags
 * 
 * This file controls all features and components visible on the orders management page.
 * Set any flag to false to hide that feature from users in production.
 */

import { OrderFlags } from './types';

export const orderFlags: OrderFlags = {
  // Global flags
  enableDebugMode: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,

  // Order management actions - Control operations for orders
  showOrderDetails: true,          // Shows detailed order information and items
  showOrderStatusUpdate: true,     // Shows order status update functionality
  showOrderCancel: true,           // Shows order cancellation option
  showOrderRefund: true,           // Shows order refund processing
  showOrderPrint: true,            // Shows print receipt/kitchen order functionality

  // Order page features - Control main page functionality
  showOrderStats: true,            // Shows order statistics at the top of the page
  showOrderFilters: true,          // Shows filtering options (by status, date, etc.)
  showOrderTracking: true,         // Shows real-time order tracking
  showOrderHistory: true,          // Shows historical order data
  showOrderNotes: true,            // Shows order notes and special instructions

  // Advanced order features - Premium/advanced functionality
  enableOrderModification: false,  // Enables modifying orders after placement
  enableOrderSplitting: false,     // Enables splitting orders across multiple bills
  enableOrderMerging: false,       // Enables merging multiple orders
  enableOrderAnalytics: true,      // Enables detailed order analytics
  enableKitchenDisplay: true,      // Enables kitchen display system integration
};

/**
 * Order Management Action Descriptions:
 * 
 * showOrderDetails: View complete order information including items, customer, table
 * showOrderStatusUpdate: Update order status (pending, preparing, ready, delivered)
 * showOrderCancel: Cancel orders with appropriate reason and notification
 * showOrderRefund: Process refunds for cancelled or returned orders
 * showOrderPrint: Print kitchen orders, receipts, and customer bills
 */

/**
 * Order Page Feature Descriptions:
 * 
 * showOrderStats: Statistics showing total orders, revenue, average order value
 * showOrderFilters: Filter orders by status, date range, table, customer
 * showOrderTracking: Real-time tracking of order progress and timing
 * showOrderHistory: Historical order data and customer order patterns
 * showOrderNotes: Special instructions, allergies, and customer preferences
 */

/**
 * Advanced Order Feature Descriptions:
 * 
 * enableOrderModification: Allow changes to orders after they've been placed
 * enableOrderSplitting: Split single orders into multiple bills for groups
 * enableOrderMerging: Combine multiple orders from the same table
 * enableOrderAnalytics: Detailed analytics on order patterns and performance
 * enableKitchenDisplay: Integration with kitchen display systems for order management
 */

export default orderFlags;