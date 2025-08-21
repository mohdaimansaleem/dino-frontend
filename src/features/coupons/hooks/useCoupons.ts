/**
 * Custom Hook for Coupon Management
 * 
 * Provides state management and API interactions for coupons
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Coupon, 
  CouponFilters, 
  CouponStats,
  CouponCreate,
  CouponUpdate
} from '../types/coupon';
import { couponService } from '../services/couponService';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserData } from '../../../contexts/UserDataContext';

interface UseCouponsState {
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  stats: CouponStats | null;
  statsLoading: boolean;
}

interface UseCouponsActions {
  fetchCoupons: (filters?: CouponFilters & { page?: number; limit?: number }) => Promise<void>;
  createCoupon: (couponData: CouponCreate) => Promise<Coupon>;
  updateCoupon: (id: string, couponData: CouponUpdate) => Promise<Coupon>;
  deleteCoupon: (id: string) => Promise<void>;
  toggleCouponStatus: (id: string, isActive: boolean) => Promise<Coupon>;
  validateCouponCode: (code: string, excludeId?: string) => Promise<{ isValid: boolean; message?: string }>;
  fetchStats: () => Promise<void>;
  refreshCoupons: () => Promise<void>;
  clearError: () => void;
}

export const useCoupons = (): UseCouponsState & UseCouponsActions => {
  const { user } = useAuth();
  const { userData } = useUserData();
  
  const [state, setState] = useState<UseCouponsState>({
    coupons: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    limit: 10,
    stats: null,
    statsLoading: false,
  });

  const [currentFilters, setCurrentFilters] = useState<CouponFilters & { page?: number; limit?: number }>({});

  // Get current venue ID
  const venueId = userData?.venue?.id;

  /**
   * Fetch coupons with filters
   */
  const fetchCoupons = useCallback(async (filters?: CouponFilters & { page?: number; limit?: number }) => {
    if (!venueId && user?.role !== 'superadmin') {
      setState(prev => ({ ...prev, error: 'No venue selected' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const finalFilters = {
        ...filters,
        ...(user?.role !== 'superadmin' && venueId && { venueId })
      };
      
      setCurrentFilters(finalFilters);
      
      const response = await couponService.getCoupons(finalFilters);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          coupons: response.data.coupons,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: 'Failed to fetch coupons',
          loading: false,
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch coupons',
        loading: false,
      }));
    }
  }, [venueId, user?.role]);

  /**
   * Create a new coupon
   */
  const createCoupon = useCallback(async (couponData: CouponCreate): Promise<Coupon> => {
    if (!venueId && user?.role !== 'superadmin') {
      throw new Error('No venue selected');
    }

    try {
      const finalCouponData = {
        ...couponData,
        venueId: couponData.venueId || venueId!
      };

      const response = await couponService.createCoupon(finalCouponData);
      
      if (response.success) {
        // Refresh the coupons list
        await fetchCoupons(currentFilters);
        return response.data;
      } else {
        throw new Error('Failed to create coupon');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create coupon');
    }
  }, [venueId, user?.role, fetchCoupons, currentFilters]);

  /**
   * Update an existing coupon
   */
  const updateCoupon = useCallback(async (id: string, couponData: CouponUpdate): Promise<Coupon> => {
    try {
      const response = await couponService.updateCoupon(id, couponData);
      
      if (response.success) {
        // Update the coupon in the local state
        setState(prev => ({
          ...prev,
          coupons: prev.coupons.map(coupon => 
            coupon.id === id ? response.data : coupon
          )
        }));
        return response.data;
      } else {
        throw new Error('Failed to update coupon');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update coupon');
    }
  }, []);

  /**
   * Delete a coupon
   */
  const deleteCoupon = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await couponService.deleteCoupon(id);
      
      if (response.success) {
        // Remove the coupon from local state
        setState(prev => ({
          ...prev,
          coupons: prev.coupons.filter(coupon => coupon.id !== id),
          total: prev.total - 1
        }));
      } else {
        throw new Error('Failed to delete coupon');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete coupon');
    }
  }, []);

  /**
   * Toggle coupon active status
   */
  const toggleCouponStatus = useCallback(async (id: string, isActive: boolean): Promise<Coupon> => {
    try {
      const response = await couponService.toggleCouponStatus(id, isActive);
      
      if (response.success) {
        // Update the coupon in the local state
        setState(prev => ({
          ...prev,
          coupons: prev.coupons.map(coupon => 
            coupon.id === id ? response.data : coupon
          )
        }));
        return response.data;
      } else {
        throw new Error('Failed to update coupon status');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update coupon status');
    }
  }, []);

  /**
   * Validate coupon code
   */
  const validateCouponCode = useCallback(async (code: string, excludeId?: string): Promise<{ isValid: boolean; message?: string }> => {
    if (!venueId && user?.role !== 'superadmin') {
      return { isValid: false, message: 'No venue selected' };
    }

    try {
      return await couponService.validateCouponCode(code, venueId!, excludeId);
    } catch (error: any) {
      return { isValid: false, message: error.message || 'Validation failed' };
    }
  }, [venueId, user?.role]);

  /**
   * Fetch coupon statistics
   */
  const fetchStats = useCallback(async () => {
    if (!venueId && user?.role !== 'superadmin') {
      return;
    }

    try {
      setState(prev => ({ ...prev, statsLoading: true }));
      
      const response = await couponService.getCouponStats(
        user?.role !== 'superadmin' ? venueId : undefined
      );
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          stats: response.data,
          statsLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, statsLoading: false }));
      }
    } catch (error: any) {
      console.error('Failed to fetch coupon stats:', error);
      setState(prev => ({ ...prev, statsLoading: false }));
    }
  }, [venueId, user?.role]);

  /**
   * Refresh coupons with current filters
   */
  const refreshCoupons = useCallback(async () => {
    await fetchCoupons(currentFilters);
  }, [fetchCoupons, currentFilters]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initial load
  useEffect(() => {
    if (venueId || user?.role === 'superadmin') {
      fetchCoupons();
      fetchStats();
    }
  }, [venueId, user?.role, fetchCoupons, fetchStats]); // Include all dependencies

  return {
    // State
    ...state,
    
    // Actions
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCouponCode,
    fetchStats,
    refreshCoupons,
    clearError,
  };
};