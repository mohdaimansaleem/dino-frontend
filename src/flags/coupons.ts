/**
 * Coupons Management Page Feature Flags
 * 
 * This file controls all features and components visible on the coupons management page.
 * Set any flag to false to hide that feature from users in production.
 */

import { CouponFlags } from './types';

export const couponFlags: CouponFlags = {
  // Global flags
  enableDebugMode: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,

  // Coupon management actions - Control CRUD operations for coupons
  showAddCoupon: true,             // Shows "Add Coupon" button and creation dialog
  showEditCoupon: true,            // Shows edit button on coupon cards
  showDeleteCoupon: true,          // Shows delete button on coupon cards
  showCouponPreview: true,         // Shows coupon preview functionality
  showCouponActivation: true,      // Shows activate/deactivate toggle for coupons

  // Coupon page features - Control main page functionality
  showCouponStats: true,           // Shows coupon statistics at the top of the page
  showCouponFilters: true,         // Shows filtering options (by status, type, etc.)
  showCouponUsage: true,           // Shows coupon usage analytics and tracking
  showCouponAnalytics: true,       // Shows detailed coupon performance analytics

  // Advanced coupon features - Premium/advanced functionality
  enableBulkCouponActions: false,  // Enables bulk operations on multiple coupons
  enableCouponTemplates: false,    // Enables pre-built coupon templates
  enableCouponScheduling: true,    // Enables scheduling coupon activation/expiration
  enableCouponLimits: true,        // Enables usage limits and restrictions
};

/**
 * Coupon Management Action Descriptions:
 * 
 * showAddCoupon: Displays the "Add New Coupon" button and opens the creation dialog
 * showEditCoupon: Shows edit icon on each coupon card for modifications
 * showDeleteCoupon: Shows delete icon on each coupon card for removal
 * showCouponPreview: Shows preview of how the coupon will appear to customers
 * showCouponActivation: Shows toggle to activate/deactivate coupons
 */

/**
 * Coupon Page Feature Descriptions:
 * 
 * showCouponStats: Statistics showing total coupons, active coupons, usage rates
 * showCouponFilters: Filter coupons by status, type, discount amount, expiration
 * showCouponUsage: Track how many times each coupon has been used
 * showCouponAnalytics: Detailed analytics on coupon performance and ROI
 */

/**
 * Advanced Coupon Feature Descriptions:
 * 
 * enableBulkCouponActions: Select multiple coupons for bulk operations
 * enableCouponTemplates: Pre-built templates for common coupon types
 * enableCouponScheduling: Set automatic activation and expiration dates
 * enableCouponLimits: Set usage limits per customer, total usage, minimum order value
 */

export default couponFlags;