/**
 * Coupon Service
 * 
 * Handles all API interactions for coupon management
 */

import { apiService } from '../../../utils/api';
import { 
  Coupon, 
  CouponCreate, 
  CouponUpdate, 
  CouponFilters,
  CouponsResponse,
  CouponResponse,
  CouponStats,
  CouponStatsResponse,
  CouponUsage
} from '../types/coupon';

class CouponService {
  private readonly baseUrl = '/api/coupons';

  /**
   * Get all coupons with optional filters
   */
  async getCoupons(filters?: CouponFilters & { page?: number; limit?: number }): Promise<CouponsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiService.get<CouponsResponse['data']>(
        `${this.baseUrl}?${params.toString()}`
      );

      return {
        success: response.success,
        data: response.data || { coupons: [], total: 0, page: 1, limit: 10 },
        message: response.message
      };
    } catch (error: any) {
      console.error('Failed to fetch coupons:', error);
      throw new Error(error.message || 'Failed to fetch coupons');
    }
  }

  /**
   * Get coupon by ID
   */
  async getCouponById(id: string): Promise<CouponResponse> {
    try {
      const response = await apiService.get<Coupon>(`${this.baseUrl}/${id}`);
      
      return {
        success: response.success,
        data: response.data!,
        message: response.message
      };
    } catch (error: any) {
      console.error('Failed to fetch coupon:', error);
      throw new Error(error.message || 'Failed to fetch coupon');
    }
  }

  /**
   * Create a new coupon
   */
  async createCoupon(couponData: CouponCreate): Promise<CouponResponse> {
    try {
      const response = await apiService.post<Coupon>(this.baseUrl, couponData);
      
      return {
        success: response.success,
        data: response.data!,
        message: response.message || 'Coupon created successfully'
      };
    } catch (error: any) {
      console.error('Failed to create coupon:', error);
      throw new Error(error.message || 'Failed to create coupon');
    }
  }

  /**
   * Update an existing coupon
   */
  async updateCoupon(id: string, couponData: CouponUpdate): Promise<CouponResponse> {
    try {
      const response = await apiService.put<Coupon>(`${this.baseUrl}/${id}`, couponData);
      
      return {
        success: response.success,
        data: response.data!,
        message: response.message || 'Coupon updated successfully'
      };
    } catch (error: any) {
      console.error('Failed to update coupon:', error);
      throw new Error(error.message || 'Failed to update coupon');
    }
  }

  /**
   * Delete a coupon
   */
  async deleteCoupon(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.delete(`${this.baseUrl}/${id}`);
      
      return {
        success: response.success,
        message: response.message || 'Coupon deleted successfully'
      };
    } catch (error: any) {
      console.error('Failed to delete coupon:', error);
      throw new Error(error.message || 'Failed to delete coupon');
    }
  }

  /**
   * Toggle coupon active status
   */
  async toggleCouponStatus(id: string, isActive: boolean): Promise<CouponResponse> {
    try {
      const response = await apiService.put<Coupon>(`${this.baseUrl}/${id}/status`, { 
        isActive 
      });
      
      return {
        success: response.success,
        data: response.data!,
        message: response.message || `Coupon ${isActive ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error: any) {
      console.error('Failed to toggle coupon status:', error);
      throw new Error(error.message || 'Failed to update coupon status');
    }
  }

  /**
   * Validate coupon code uniqueness
   */
  async validateCouponCode(code: string, venueId: string, excludeId?: string): Promise<{ isValid: boolean; message?: string }> {
    try {
      const params = new URLSearchParams({
        code,
        venueId,
        ...(excludeId && { excludeId })
      });

      const response = await apiService.get<{ isValid: boolean; message?: string }>(
        `${this.baseUrl}/validate-code?${params.toString()}`
      );
      
      return response.data || { isValid: false, message: 'Validation failed' };
    } catch (error: any) {
      console.error('Failed to validate coupon code:', error);
      return { isValid: false, message: error.message || 'Failed to validate coupon code' };
    }
  }

  /**
   * Get coupon statistics
   */
  async getCouponStats(venueId?: string): Promise<CouponStatsResponse> {
    try {
      const params = venueId ? `?venueId=${venueId}` : '';
      const response = await apiService.get<CouponStats>(`${this.baseUrl}/stats${params}`);
      
      return {
        success: response.success,
        data: response.data!,
        message: response.message
      };
    } catch (error: any) {
      console.error('Failed to fetch coupon stats:', error);
      throw new Error(error.message || 'Failed to fetch coupon statistics');
    }
  }

  /**
   * Get coupon usage history
   */
  async getCouponUsage(couponId: string, page = 1, limit = 10): Promise<{ 
    success: boolean; 
    data: { usage: CouponUsage[]; total: number; page: number; limit: number }; 
    message?: string 
  }> {
    try {
      const response = await apiService.get<{ usage: CouponUsage[]; total: number; page: number; limit: number }>(
        `${this.baseUrl}/${couponId}/usage?page=${page}&limit=${limit}`
      );
      
      return {
        success: response.success,
        data: response.data || { usage: [], total: 0, page: 1, limit: 10 },
        message: response.message
      };
    } catch (error: any) {
      console.error('Failed to fetch coupon usage:', error);
      throw new Error(error.message || 'Failed to fetch coupon usage');
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdateCoupons(ids: string[], updates: Partial<CouponUpdate>): Promise<{ 
    success: boolean; 
    message: string; 
    updated: number 
  }> {
    try {
      const response = await apiService.put<{ updated: number }>(`${this.baseUrl}/bulk`, {
        ids,
        updates
      });
      
      return {
        success: response.success,
        message: response.message || 'Coupons updated successfully',
        updated: response.data?.updated || 0
      };
    } catch (error: any) {
      console.error('Failed to bulk update coupons:', error);
      throw new Error(error.message || 'Failed to update coupons');
    }
  }

  /**
   * Export coupons to CSV
   */
  async exportCoupons(filters?: CouponFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiService.get(`${this.baseUrl}/export?${params.toString()}`, {
        responseType: 'blob'
      });

      return response.data as Blob;
    } catch (error: any) {
      console.error('Failed to export coupons:', error);
      throw new Error(error.message || 'Failed to export coupons');
    }
  }
}

// Export singleton instance
export const couponService = new CouponService();
export default couponService;