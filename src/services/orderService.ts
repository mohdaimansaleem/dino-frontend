import { apiService } from './api';
import { ApiResponse } from '../types';

export interface OrderItem {
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  customizations?: Record<string, any>;
}

export interface Order {
  id: string;
  order_number: string;
  venue_id: string;
  table_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  service_charge: number;
  discount_amount: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  special_instructions?: string;
  estimated_preparation_time?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  venue_id: string;
  table_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  items: {
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
    customizations?: Record<string, any>;
  }[];
  special_instructions?: string;
  payment_method?: string;
}

export interface UpdateOrderStatusData {
  status: Order['status'];
  estimated_preparation_time?: number;
}

class OrderService {
  async getOrders(venueId?: string, status?: string): Promise<Order[]> {
    try {
      const params: any = {};
      if (venueId) params.venue_id = venueId;
      if (status) params.status = status;
      
      const response = await apiService.get<Order[]>('/orders', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch orders');
      }
    } catch (error: any) {
      console.error('Get orders error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch orders');
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiService.get<Order>(`/orders/${orderId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch order');
      }
    } catch (error: any) {
      console.error('Get order error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch order');
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
      const response = await apiService.put<Order>(`/orders/${orderId}/status`, statusData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update order status');
      }
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
      const response = await apiService.get<Order[]>(`/orders/table/${tableId}`);
      
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