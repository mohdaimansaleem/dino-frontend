import { apiService } from './api';
import { ApiResponse } from '../types';

// Order-related types
export interface Order {
  id: string;
  order_number: string;
  venue_id: string;
  table_id?: string;
  customer_id: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  special_instructions?: string;
  estimated_ready_time?: string;
  actual_ready_time?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  menu_item_id: string;
  menu_item_name: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

export interface OrderCreate {
  venue_id: string;
  table_id?: string;
  customer_id: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  items: OrderItemCreate[];
  special_instructions?: string;
}

export interface OrderItemCreate {
  menu_item_id: string;
  variant_id?: string;
  quantity: number;
  customizations?: Record<string, any>;
  special_instructions?: string;
}

export interface PublicOrderCreate {
  venue_id: string;
  table_id?: string;
  customer: CustomerCreate;
  items: OrderItemCreate[];
  order_type: 'qr_scan' | 'walk_in' | 'online' | 'phone';
  special_instructions?: string;
  estimated_guests?: number;
}

export interface CustomerCreate {
  name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  preferences?: Record<string, any>;
  dietary_restrictions?: string[];
  marketing_consent?: boolean;
}

export interface OrderUpdate {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  estimated_ready_time?: string;
  special_instructions?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery'
  | 'delivered'
  | 'served' 
  | 'cancelled';

export type PaymentStatus = 
  | 'pending' 
  | 'processing'
  | 'paid' 
  | 'failed' 
  | 'refunded'
  | 'partially_refunded';

export type PaymentMethod = 
  | 'cash'
  | 'card'
  | 'upi'
  | 'wallet'
  | 'net_banking';

export interface OrderAnalytics {
  venue_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  status_breakdown: Record<OrderStatus, number>;
  payment_breakdown: Record<PaymentStatus, number>;
}

export interface LiveOrderData {
  venue_id: string;
  timestamp: string;
  summary: {
    total_active_orders: number;
    pending_orders: number;
    preparing_orders: number;
    ready_orders: number;
  };
  orders_by_status: Record<string, Order[]>;
}

export interface OrderValidation {
  is_valid: boolean;
  venue_open: boolean;
  items_available: string[];
  items_unavailable: string[];
  estimated_total: number;
  estimated_preparation_time?: number;
  message?: string;
  errors: string[];
}

export interface OrderReceipt {
  order_id: string;
  order_number: string;
  venue: {
    name: string;
    address: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  order_date: string;
  table_number?: number;
}

class OrderService {
  // Get orders with filtering
  async getOrders(filters?: {
    venue_id?: string;
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    order_type?: string;
    page?: number;
    page_size?: number;
  }): Promise<{
    orders: Order[];
    total: number;
    page: number;
    total_pages: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.venue_id) params.append('venue_id', filters.venue_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.payment_status) params.append('payment_status', filters.payment_status);
      if (filters?.order_type) params.append('order_type', filters.order_type);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());

      const response = await apiService.get<any>(`/orders?${params.toString()}`);
      
      if (response.success && response.data) {
        return {
          orders: response.data.data || response.data,
          total: response.data.total || 0,
          page: response.data.page || 1,
          total_pages: response.data.total_pages || 1
        };
      }
      
      return { orders: [], total: 0, page: 1, total_pages: 1 };
    } catch (error) {
      console.error('Failed to get orders:', error);
      return { orders: [], total: 0, page: 1, total_pages: 1 };
    }
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const response = await apiService.get<Order>(`/orders/${orderId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get order:', error);
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
      return await apiService.post<any>('/orders/public/create-order', orderData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create order');
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
      return await apiService.put<void>(`/orders/${orderId}/status`, { status });
    } catch (error: any) {
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

  // Get venue orders
  async getVenueOrders(venueId: string, filters?: {
    status?: OrderStatus;
    limit?: number;
  }): Promise<Order[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiService.get<Order[]>(`/orders/venues/${venueId}/orders?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get venue orders:', error);
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
      console.error('Failed to get customer orders:', error);
      return [];
    }
  }

  // Get order analytics
  async getOrderAnalytics(venueId: string, startDate?: string, endDate?: string): Promise<OrderAnalytics | null> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiService.get<OrderAnalytics>(`/orders/venues/${venueId}/analytics?${params.toString()}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get order analytics:', error);
      return null;
    }
  }

  // Get live order status
  async getLiveOrderStatus(venueId: string): Promise<LiveOrderData | null> {
    try {
      const response = await apiService.get<LiveOrderData>(`/orders/venues/${venueId}/live`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get live order status:', error);
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
      console.error('Failed to access menu by QR:', error);
      throw error;
    }
  }

  // Check venue operating status
  async checkVenueStatus(venueId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/orders/public/venue/${venueId}/status`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to check venue status:', error);
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
      console.error('Failed to validate order:', error);
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
      console.error('Failed to track order status:', error);
      return null;
    }
  }

  // Get order receipt
  async getOrderReceipt(orderId: string): Promise<OrderReceipt | null> {
    try {
      const response = await apiService.get<OrderReceipt>(`/orders/public/${orderId}/receipt`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get order receipt:', error);
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