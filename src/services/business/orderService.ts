import { apiService } from '../../utils/api';
import { 
  Order,
  OrderCreate,
  OrderUpdate,
  OrderItem,
  OrderItemCreate,
  PublicOrderCreate,
  CustomerCreate,
  OrderValidation,
  OrderReceipt,
  LiveOrderData,
  VenueAnalyticsData,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderType,
  PaginatedResponse,
  ApiResponse,
  OrderFilters
} from '../../types/api';

// Remove duplicate type definitions - they're now in types/api.ts

class OrderService {
  // Get orders with filtering (excluding cancelled orders)
  async getOrders(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.venue_id) params.append('venue_id', filters.venue_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.payment_status) params.append('payment_status', filters.payment_status);
      if (filters?.order_type) params.append('order_type', filters.order_type);

      const response = await apiService.get<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
      
      if (response.data) {
        // Filter out cancelled orders from the data
        const filteredData = response.data.data.filter(order => order.status !== 'cancelled');
        
        return {
          ...response.data,
          data: filteredData,
          total: filteredData.length
        };
      }
      
      return {
        success: true,
        data: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    } catch (error) {
      return {
        success: true,
        data: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    }
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const response = await apiService.get<Order>(`/orders/${orderId}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Create new order
  async createOrder(orderData: OrderCreate): Promise<ApiResponse<Order>> {
    try {
      return await apiService.post<Order>('/orders', orderData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create order');
    }
  }

  // Create public order (from QR scan)
  async createPublicOrder(orderData: PublicOrderCreate): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 OrderService: Creating public order with data:', orderData);
      const response = await apiService.post<any>('/orders/public/create-order', orderData);
      console.log('🔍 OrderService: Raw API response:', response);
      
      // Handle different response formats
      if (response && (response.success || response.data)) {
        console.log('✅ OrderService: Order created successfully');
        return response;
      } else {
        console.error('❌ OrderService: Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('❌ OrderService: Error creating order:', error);
      
      // Check if it's actually a successful response with different format
      if (error.response?.status === 200 || error.response?.status === 201) {
        console.log('🔍 OrderService: Checking if error is actually success...');
        const responseData = error.response?.data;
        
        if (responseData && (responseData.id || responseData.order_number || responseData.order_id)) {
          console.log('✅ OrderService: Order actually succeeded despite error format');
          return {
            success: true,
            data: responseData,
            message: 'Order created successfully'
          };
        }
      }
      
      // Extract meaningful error message
      let errorMessage = 'Failed to create order';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Handle validation errors
          errorMessage = error.response.data.detail.map((err: any) => err.msg || err.message).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Update order
  async updateOrder(orderId: string, orderData: OrderUpdate): Promise<ApiResponse<Order>> {
    try {
      return await apiService.put<Order>(`/orders/${orderId}`, orderData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update order');
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<ApiResponse<void>> {
    try {
      console.log(`🔍 OrderService: Updating order ${orderId} status to ${status}`);
      const response = await apiService.put<void>(`/orders/${orderId}/status?new_status=${status}`);
      console.log('✅ OrderService: Order status updated successfully');
      return response;
    } catch (error: any) {
      console.error('❌ OrderService: Failed to update order status:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update order status');
    }
  }

  // Confirm order
  async confirmOrder(orderId: string, estimatedMinutes?: number): Promise<ApiResponse<void>> {
    try {
      const params = estimatedMinutes ? `?estimated_minutes=${estimatedMinutes}` : '';
      return await apiService.post<void>(`/orders/${orderId}/confirm${params}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to confirm order');
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<void>> {
    try {
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      return await apiService.post<void>(`/orders/${orderId}/cancel${params}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to cancel order');
    }
  }

  // Get venue orders (excluding cancelled orders)
  async getVenueOrders(venueId: string, filters?: {
    status?: OrderStatus;
    limit?: number;
  }): Promise<Order[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiService.get<Order[]>(`/orders/venues/${venueId}/orders?${params.toString()}`);
      const orders = response.data || [];
      
      // Filter out cancelled orders
      return orders.filter(order => order.status !== 'cancelled');
    } catch (error) {
      return [];
    }
  }

  // Get customer orders
  async getCustomerOrders(customerId: string, limit?: number): Promise<Order[]> {
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await apiService.get<Order[]>(`/orders/customers/${customerId}/orders${params}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  // Get order analytics
  async getOrderAnalytics(venueId: string, startDate?: string, endDate?: string): Promise<VenueAnalyticsData | null> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiService.get<VenueAnalyticsData>(`/orders/venues/${venueId}/analytics?${params.toString()}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Get live order status
  async getLiveOrderStatus(venueId: string): Promise<LiveOrderData | null> {
    try {
      const response = await apiService.get<LiveOrderData>(`/orders/venues/${venueId}/live`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // QR Code and Public Access Methods

  // Access menu via QR code
  async accessMenuByQR(qrCode: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/orders/public/qr/${qrCode}`);
      return response.data || null;
    } catch (error) {
      throw error;
    }
  }

  // Check venue operating status
  async checkVenueStatus(venueId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/orders/public/venue/${venueId}/status`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Validate order before creation
  async validateOrder(orderData: any): Promise<OrderValidation> {
    try {
      const response = await apiService.post<OrderValidation>('/orders/public/validate-order', orderData);
      return response.data || {
        is_valid: false,
        venue_open: false,
        items_available: [],
        items_unavailable: [],
        estimated_total: 0,
        errors: ['Validation failed']
      };
    } catch (error) {
      return {
        is_valid: false,
        venue_open: false,
        items_available: [],
        items_unavailable: [],
        estimated_total: 0,
        errors: ['Validation failed']
      };
    }
  }

  // Track order status (public)
  async trackOrderStatus(orderId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/orders/public/${orderId}/status`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Get order receipt
  async getOrderReceipt(orderId: string): Promise<OrderReceipt | null> {
    try {
      const response = await apiService.get<OrderReceipt>(`/orders/public/${orderId}/receipt`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Submit order feedback
  async submitOrderFeedback(orderId: string, rating: number, feedback?: string): Promise<ApiResponse<void>> {
    try {
      const params = new URLSearchParams();
      params.append('rating', rating.toString());
      if (feedback) params.append('feedback', feedback);

      return await apiService.post<void>(`/orders/public/${orderId}/feedback?${params.toString()}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to submit feedback');
    }
  }

  // Utility Methods

  // Calculate order total
  calculateOrderTotal(items: OrderItemCreate[], taxRate: number = 0.18, discountAmount: number = 0): {
    subtotal: number;
    taxAmount: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * (item as any).unit_price || 0), 0);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      total
    };
  }

  // Get order status color
  getOrderStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#f97316',
      ready: '#10b981',
      out_for_delivery: '#8b5cf6',
      delivered: '#059669',
      served: '#059669',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  // Get payment status color
  getPaymentStatusColor(status: PaymentStatus): string {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      paid: '#10b981',
      failed: '#ef4444',
      refunded: '#6b7280',
      partially_refunded: '#f97316'
    };
    return colors[status] || '#6b7280';
  }

  // Format order status for display
  formatOrderStatus(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      served: 'Served',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  }

  // Format payment status for display
  formatPaymentStatus(status: PaymentStatus): string {
    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      paid: 'Paid',
      failed: 'Failed',
      refunded: 'Refunded',
      partially_refunded: 'Partially Refunded'
    };
    return labels[status] || status;
  }

  // Check if order can be cancelled
  canCancelOrder(order: Order): boolean {
    return ['pending', 'confirmed'].includes(order.status);
  }

  // Check if order can be modified
  canModifyOrder(order: Order): boolean {
    return ['pending'].includes(order.status);
  }

  // Get estimated delivery time
  getEstimatedDeliveryTime(order: Order): string | null {
    if (order.estimated_ready_time) {
      const estimatedTime = new Date(order.estimated_ready_time);
      const now = new Date();
      const diffMinutes = Math.ceil((estimatedTime.getTime() - now.getTime()) / (1000 * 60));
      
      if (diffMinutes > 0) {
        return `${diffMinutes} minutes`;
      } else {
        return 'Ready';
      }
    }
    return null;
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }
}

export const orderService = new OrderService();

// Export types for components
export type { 
  Order, 
  OrderStatus, 
  PaymentStatus, 
  PaymentMethod 
} from '../../types/api';