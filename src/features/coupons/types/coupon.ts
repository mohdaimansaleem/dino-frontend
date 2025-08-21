/**
 * Coupon Types and Interfaces
 * 
 * Defines all TypeScript interfaces and types for the coupon management system
 */

export interface Coupon {
  id: string;
  code: string;
  venueId: string;
  venueName?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string; // ISO date string
  expiryDate: string; // ISO date string
  minOrderAmount?: number;
  maxClaims?: number;
  currentClaims: number;
  status: CouponStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type CouponStatus = 'active' | 'expired' | 'inactive' | 'draft';

export type DiscountType = 'percentage' | 'fixed';

export interface CouponCreate {
  code: string;
  venueId: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  expiryDate: string;
  minOrderAmount?: number;
  maxClaims?: number;
  isActive?: boolean;
}

export interface CouponUpdate {
  code?: string;
  discountType?: DiscountType;
  discountValue?: number;
  startDate?: string;
  expiryDate?: string;
  minOrderAmount?: number;
  maxClaims?: number;
  isActive?: boolean;
}

export interface CouponFilters {
  status?: CouponStatus;
  discountType?: DiscountType;
  venueId?: string;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalClaims: number;
  totalDiscountGiven: number;
}

export interface CouponValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CouponUsage {
  id: string;
  couponId: string;
  orderId: string;
  customerId?: string;
  discountAmount: number;
  usedAt: string;
  orderTotal: number;
}

// Form data interface for the coupon dialog
export interface CouponFormData {
  code: string;
  discountType: DiscountType;
  discountValue: number | string;
  startDate: string;
  expiryDate: string;
  minOrderAmount: number | string;
  maxClaims: number | string;
  isActive: boolean;
}

// API Response types
export interface CouponsResponse {
  success: boolean;
  data: {
    coupons: Coupon[];
    total: number;
    page: number;
    limit: number;
    stats?: CouponStats;
  };
  message?: string;
}

export interface CouponResponse {
  success: boolean;
  data: Coupon;
  message?: string;
}

export interface CouponStatsResponse {
  success: boolean;
  data: CouponStats;
  message?: string;
}

// Constants
export const DISCOUNT_TYPES: { value: DiscountType; label: string }[] = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed Amount (₹)' },
];

export const COUPON_STATUS_OPTIONS: { value: CouponStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: '#4CAF50' },
  { value: 'expired', label: 'Expired', color: '#F44336' },
  { value: 'inactive', label: 'Inactive', color: '#9E9E9E' },
  { value: 'draft', label: 'Draft', color: '#FF9800' },
];

// Validation constants
export const COUPON_VALIDATION = {
  CODE_MIN_LENGTH: 3,
  CODE_MAX_LENGTH: 20,
  CODE_PATTERN: /^[A-Z0-9_-]+$/,
  MIN_DISCOUNT_VALUE: 1,
  MAX_PERCENTAGE_DISCOUNT: 100,
  MIN_ORDER_AMOUNT: 0,
  MAX_CLAIMS_MIN: 1,
} as const;