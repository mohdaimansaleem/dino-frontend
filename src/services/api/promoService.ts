import { apiService } from '../../utils/api';
import { ApiResponse } from '../../types/api';

// Promo code related types
export interface PromoCode {
  id: string;
  code: string;
  name: string;
  description: string;
  type: PromoType;
  discount_type: DiscountType;
  discount_value: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  user_usage_limit?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  venue_id: string;
  applicable_items?: string[]; // Menu item IDs
  applicable_categories?: string[]; // Category IDs
  excluded_items?: string[]; // Menu item IDs to exclude
  terms_and_conditions?: string;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeCreate {
  code: string;
  name: string;
  description: string;
  type: PromoType;
  discount_type: DiscountType;
  discount_value: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  user_usage_limit?: number;
  valid_from: string;
  valid_until: string;
  venue_id: string;
  applicable_items?: string[];
  applicable_categories?: string[];
  excluded_items?: string[];
  terms_and_conditions?: string;
}

export interface PromoCodeUpdate {
  name?: string;
  description?: string;
  discount_value?: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  user_usage_limit?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
  applicable_items?: string[];
  applicable_categories?: string[];
  excluded_items?: string[];
  terms_and_conditions?: string;
}

export type PromoType = 
  | 'percentage' 
  | 'fixed_amount' 
  | 'free_delivery' 
  | 'buy_one_get_one' 
  | 'free_item';

export type DiscountType = 
  | 'order_total' 
  | 'specific_items' 
  | 'category' 
  | 'delivery_fee';

export interface PromoValidation {
  is_valid: boolean;
  promo_code?: PromoCode;
  discount_amount: number;
  final_amount: number;
  error_message?: string;
  warnings?: string[];
  applied_to_items?: PromoApplicationItem[];
}

export interface PromoApplicationItem {
  menu_item_id: string;
  menu_item_name: string;
  original_price: number;
  discounted_price: number;
  discount_amount: number;
  quantity: number;
}

export interface PromoUsage {
  id: string;
  promo_code_id: string;
  promo_code: string;
  order_id: string;
  customer_id?: string;
  discount_amount: number;
  order_total: number;
  used_at: string;
  venue_id: string;
}

export interface PromoAnalytics {
  promo_code_id: string;
  promo_code: string;
  period: {
    start_date: string;
    end_date: string;
  };
  total_usage: number;
  total_discount_given: number;
  total_revenue_generated: number;
  average_order_value: number;
  conversion_rate: number;
  top_using_customers: PromoCustomerUsage[];
  usage_trend: PromoUsageTrend[];
  performance_metrics: {
    roi: number;
    customer_acquisition_cost: number;
    customer_lifetime_value: number;
  };
}

export interface PromoCustomerUsage {
  customer_id: string;
  customer_name: string;
  usage_count: number;
  total_discount_received: number;
  total_orders: number;
}

export interface PromoUsageTrend {
  date: string;
  usage_count: number;
  discount_amount: number;
  revenue_generated: number;
}

export interface BulkPromoCreate {
  base_code: string;
  name_template: string;
  description: string;
  type: PromoType;
  discount_type: DiscountType;
  discount_value: number;
  quantity: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  usage_limit_per_code?: number;
  user_usage_limit?: number;
  valid_from: string;
  valid_until: string;
  venue_id: string;
}

class PromoService {
  // Promo Code Management

  // Get all promo codes for a venue
  async getPromoCodes(venueId: string, filters?: {
    is_active?: boolean;
    type?: PromoType;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<{
    promo_codes: PromoCode[];
    total: number;
    page: number;
    total_pages: number;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('venue_id', venueId);
      
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters?.type) params.append('type', filters.type);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());

      const response = await apiService.get<any>(`/promo-codes?${params.toString()}`);
      
      if (response.success && response.data) {
        return {
          promo_codes: response.data.data || response.data,
          total: response.data.total || 0,
          page: response.data.page || 1,
          total_pages: response.data.total_pages || 1
        };
      }
      
      return { promo_codes: [], total: 0, page: 1, total_pages: 1 };
    } catch (error) {
      return { promo_codes: [], total: 0, page: 1, total_pages: 1 };
    }
  }

  // Get active promo codes for public use
  async getActivePromoCodes(venueId: string): Promise<PromoCode[]> {
    try {
      const response = await apiService.get<PromoCode[]>(`/promo-codes/public/active?venue_id=${venueId}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  // Get promo code by ID
  async getPromoCode(promoCodeId: string): Promise<PromoCode | null> {
    try {
      const response = await apiService.get<PromoCode>(`/promo-codes/${promoCodeId}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Get promo code by code string
  async getPromoCodeByCode(code: string, venueId: string): Promise<PromoCode | null> {
    try {
      const response = await apiService.get<PromoCode>(`/promo-codes/by-code/${code}?venue_id=${venueId}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Create new promo code
  async createPromoCode(promoData: PromoCodeCreate): Promise<ApiResponse<PromoCode>> {
    try {
      return await apiService.post<PromoCode>('/promo-codes', promoData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create promo code');
    }
  }

  // Update promo code
  async updatePromoCode(promoCodeId: string, promoData: PromoCodeUpdate): Promise<ApiResponse<PromoCode>> {
    try {
      return await apiService.put<PromoCode>(`/promo-codes/${promoCodeId}`, promoData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update promo code');
    }
  }

  // Delete promo code
  async deletePromoCode(promoCodeId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/promo-codes/${promoCodeId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete promo code');
    }
  }

  // Toggle promo code status
  async togglePromoCodeStatus(promoCodeId: string, isActive: boolean): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/promo-codes/${promoCodeId}/status`, { is_active: isActive });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update promo code status');
    }
  }

  // Promo Code Validation and Application

  // Validate promo code for an order
  async validatePromoCode(code: string, orderData: {
    venue_id: string;
    items: Array<{
      menu_item_id: string;
      quantity: number;
      unit_price: number;
    }>;
    subtotal: number;
    customer_id?: string;
  }): Promise<PromoValidation> {
    try {
      const response = await apiService.post<PromoValidation>('/promo-codes/validate', {
        code,
        ...orderData
      });
      
      return response.data || {
        is_valid: false,
        discount_amount: 0,
        final_amount: orderData.subtotal,
        error_message: 'Validation failed'
      };
    } catch (error: any) {
      return {
        is_valid: false,
        discount_amount: 0,
        final_amount: orderData.subtotal,
        error_message: error.response?.data?.detail || 'Invalid promo code'
      };
    }
  }

  // Apply promo code to order (during checkout)
  async applyPromoCode(code: string, orderId: string): Promise<ApiResponse<{
    discount_amount: number;
    final_amount: number;
  }>> {
    try {
      return await apiService.post<{
        discount_amount: number;
        final_amount: number;
      }>(`/promo-codes/apply`, { code, order_id: orderId });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to apply promo code');
    }
  }

  // Remove promo code from order
  async removePromoCode(orderId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/promo-codes/remove/${orderId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to remove promo code');
    }
  }

  // Bulk Operations

  // Create multiple promo codes
  async createBulkPromoCodes(bulkData: BulkPromoCreate): Promise<ApiResponse<PromoCode[]>> {
    try {
      return await apiService.post<PromoCode[]>('/promo-codes/bulk-create', bulkData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create bulk promo codes');
    }
  }

  // Bulk update promo codes
  async bulkUpdatePromoCodes(promoCodeIds: string[], updateData: PromoCodeUpdate): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>('/promo-codes/bulk-update', {
        promo_code_ids: promoCodeIds,
        update_data: updateData
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to bulk update promo codes');
    }
  }

  // Bulk delete promo codes
  async bulkDeletePromoCodes(promoCodeIds: string[]): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>('/promo-codes/bulk-delete', {
        data: { promo_code_ids: promoCodeIds }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to bulk delete promo codes');
    }
  }

  // Analytics and Reporting

  // Get promo code usage analytics
  async getPromoAnalytics(promoCodeId: string, period: {
    start_date: string;
    end_date: string;
  }): Promise<PromoAnalytics | null> {
    try {
      const params = new URLSearchParams();
      params.append('start_date', period.start_date);
      params.append('end_date', period.end_date);

      const response = await apiService.get<PromoAnalytics>(
        `/promo-codes/${promoCodeId}/analytics?${params.toString()}`
      );
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Get promo code usage history
  async getPromoUsageHistory(promoCodeId: string, filters?: {
    customer_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
  }): Promise<{
    usage_history: PromoUsage[];
    total: number;
    page: number;
    total_pages: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.customer_id) params.append('customer_id', filters.customer_id);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());

      const response = await apiService.get<any>(
        `/promo-codes/${promoCodeId}/usage-history?${params.toString()}`
      );
      
      if (response.success && response.data) {
        return {
          usage_history: response.data.data || response.data,
          total: response.data.total || 0,
          page: response.data.page || 1,
          total_pages: response.data.total_pages || 1
        };
      }
      
      return { usage_history: [], total: 0, page: 1, total_pages: 1 };
    } catch (error) {
      return { usage_history: [], total: 0, page: 1, total_pages: 1 };
    }
  }

  // Get venue promo performance summary
  async getVenuePromoPerformance(venueId: string, period: {
    start_date: string;
    end_date: string;
  }): Promise<{
    total_promo_codes: number;
    active_promo_codes: number;
    total_usage: number;
    total_discount_given: number;
    total_revenue_with_promos: number;
    top_performing_promos: Array<{
      promo_code: string;
      usage_count: number;
      discount_given: number;
      revenue_generated: number;
    }>;
  } | null> {
    try {
      const params = new URLSearchParams();
      params.append('start_date', period.start_date);
      params.append('end_date', period.end_date);

      const response = await apiService.get<any>(
        `/promo-codes/venues/${venueId}/performance?${params.toString()}`
      );
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Utility Methods

  // Generate unique promo code
  generatePromoCode(prefix: string = '', length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix.toUpperCase();
    
    for (let i = 0; i < length - prefix.length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  }

  // Validate promo code format
  validatePromoCodeFormat(code: string): { isValid: boolean; error?: string } {
    if (!code || code.trim().length === 0) {
      return { isValid: false, error: 'Promo code cannot be empty' };
    }

    if (code.length < 3 || code.length > 20) {
      return { isValid: false, error: 'Promo code must be between 3 and 20 characters' };
    }

    if (!/^[A-Z0-9]+$/.test(code.toUpperCase())) {
      return { isValid: false, error: 'Promo code can only contain letters and numbers' };
    }

    return { isValid: true };
  }

  // Calculate discount amount
  calculateDiscount(promoCode: PromoCode, orderAmount: number): number {
    switch (promoCode.discount_type) {
      case 'order_total':
        if (promoCode.type === 'percentage') {
          const discount = (orderAmount * promoCode.discount_value) / 100;
          return promoCode.maximum_discount_amount 
            ? Math.min(discount, promoCode.maximum_discount_amount)
            : discount;
        } else {
          return Math.min(promoCode.discount_value, orderAmount);
        }
      
      case 'delivery_fee':
        return promoCode.discount_value; // Assuming this is the delivery fee amount
      
      default:
        return 0;
    }
  }

  // Check if promo code is currently valid
  isPromoCodeValid(promoCode: PromoCode): { isValid: boolean; reason?: string } {
    const now = new Date();
    const validFrom = new Date(promoCode.valid_from);
    const validUntil = new Date(promoCode.valid_until);

    if (!promoCode.is_active) {
      return { isValid: false, reason: 'Promo code is inactive' };
    }

    if (now < validFrom) {
      return { isValid: false, reason: 'Promo code is not yet active' };
    }

    if (now > validUntil) {
      return { isValid: false, reason: 'Promo code has expired' };
    }

    if (promoCode.usage_limit && promoCode.usage_count >= promoCode.usage_limit) {
      return { isValid: false, reason: 'Promo code usage limit reached' };
    }

    return { isValid: true };
  }

  // Format discount for display
  formatDiscount(promoCode: PromoCode): string {
    if (promoCode.type === 'percentage') {
      return `${promoCode.discount_value}% OFF`;
    } else if (promoCode.type === 'fixed_amount') {
      return `₹${promoCode.discount_value} OFF`;
    } else if (promoCode.type === 'free_delivery') {
      return 'FREE DELIVERY';
    } else if (promoCode.type === 'buy_one_get_one') {
      return 'BUY 1 GET 1';
    } else if (promoCode.type === 'free_item') {
      return 'FREE ITEM';
    }
    return 'DISCOUNT';
  }

  // Get promo code status color
  getPromoCodeStatusColor(promoCode: PromoCode): string {
    const validity = this.isPromoCodeValid(promoCode);
    if (!validity.isValid) {
      return '#f44336'; // Red
    }
    
    const now = new Date();
    const validUntil = new Date(promoCode.valid_until);
    const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 3) {
      return '#ff9800'; // Orange
    }
    
    return '#4caf50'; // Green
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get days until expiry
  getDaysUntilExpiry(validUntil: string): number {
    const now = new Date();
    const expiryDate = new Date(validUntil);
    return Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}

export const promoService = new PromoService();