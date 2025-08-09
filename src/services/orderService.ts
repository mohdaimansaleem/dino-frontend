import { apiService } from './api';
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
} from '../types/api';

// Remove duplicate type definitions - they're now in types/api.ts

class OrderService {
  // Get orders with filtering
  async getOrders(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    try {
      const params: any = {};
      if (venueId) params.venue_id = venueId;
      if (status) params.status = status;
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.venue_id) params.append('venue_id', filters.venue_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.payment_status) params.append('payment_status', filters.payment_status);
      if (filters?.order_type) params.append('order_type', filters.order_type);

      const response = await apiService.get<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
      
      return response.data || {
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

  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiService.get<Order>(`/orders/${orderId}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await apiService.post<Order>('/orders', orderData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error: any) {
      console.error('Create order error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create order');
    }
  }

  async createPublicOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await apiService.post<Order>('/orders/public/create-order', orderData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error: any) {
      console.error('Create public order error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create order');
    }
  }

  async updateOrderStatus(orderId: string, statusData: UpdateOrderStatusData): Promise<Order> {
    try {
      return await apiService.put<Order>(`/orders/${orderId}`, orderData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update order');
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/orders/${orderId}/status`, { new_status: status });
    } catch (error: any) {
      console.error('Update order status error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update order status');
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
      const response = await apiService.put(`/orders/${orderId}/cancel`, { reason });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel order');
      }
    } catch (error: any) {
      console.error('Cancel order error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to cancel order');
    }
  }

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiService.get<Order[]>(`/orders/venues/${venueId}/orders?${params.toString()}`);
      return response.data || [];
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
    const colors = {
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
    const labels = {
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
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch table orders');
      }
    } catch (error: any) {
      console.error('Get table orders error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch table orders');
    }
  }

  async getActiveOrders(venueId: string): Promise<Order[]> {
    try {
      const response = await apiService.get<Order[]>('/orders', {
        venue_id: venueId,
        status: 'pending,confirmed,preparing,ready'
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch active orders');
      }
    } catch (error: any) {
      console.error('Get active orders error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch active orders');
    }
  }

  async getOrderHistory(venueId?: string, limit?: number): Promise<Order[]> {
    try {
      const params: any = {};
      if (venueId) params.venue_id = venueId;
      if (limit) params.limit = limit;
      
      const response = await apiService.get<Order[]>('/orders/history', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch order history');
      }
    } catch (error: any) {
      console.error('Get order history error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch order history');
    }
  }

  async updatePaymentStatus(orderId: string, paymentStatus: Order['payment_status'], paymentMethod?: string): Promise<void> {
    try {
      const response = await apiService.put(`/orders/${orderId}/payment`, {
        payment_status: paymentStatus,
        payment_method: paymentMethod
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update payment status');
      }
    } catch (error: any) {
      console.error('Update payment status error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update payment status');
    }
  }

  async addOrderNote(orderId: string, note: string): Promise<void> {
    try {
      const response = await apiService.post(`/orders/${orderId}/notes`, { note });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to add order note');
      }
    } catch (error: any) {
      console.error('Add order note error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to add order note');
    }
  }

  async getOrderAnalytics(venueId: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = { venue_id: venueId };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await apiService.get('/orders/analytics', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch order analytics');
      }
    } catch (error: any) {
      console.error('Get order analytics error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch order analytics');
    }
  }

  // Real-time order updates
  subscribeToOrderUpdates(venueId: string, callback: (order: Order) => void): () => void {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll implement polling as a fallback
    const interval = setInterval(async () => {
      try {
        const orders = await this.getActiveOrders(venueId);
        orders.forEach(callback);
      } catch (error) {
        console.error('Error polling order updates:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }
}

export const orderService = new OrderService();

// Export types for components
export type { 
  Order, 
  OrderStatus, 
  PaymentStatus, 
  PaymentMethod 
} from '../types/api';