/**
 * Coupons Feature Barrel Export
 * 
 * Main entry point for the coupons feature module
 */

// Components
export { 
  CouponDialog,
  CouponCard,
  CouponList,
  CouponFiltersComponent,
  CouponStatsComponent
} from './components';

// Pages
export { default as CouponsManagement } from './pages/CouponsManagement';

// Hooks
export { useCoupons } from './hooks/useCoupons';

// Services
export { couponService } from './services/couponService';

// Types
export type {
  Coupon,
  CouponCreate,
  CouponUpdate,
  CouponFilters,
  CouponFormData,
  CouponStats,
  CouponUsage,
  CouponValidationResult,
  DiscountType,
  CouponStatus
} from './types/coupon';

// Utils
export * from './utils/couponValidation';