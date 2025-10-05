import { apiService } from '../../utils/api';
import { ApiResponse } from '../../types/api';

// Order tracking related types
export interface OrderTracking {
  order_id: string;
  order_number: string;
  venue_id: string;
  table_id?: string;
  table_number?: string;
  customer: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
  };
  status: OrderTrackingStatus;
  payment_status: PaymentTrackingStatus;
  items: OrderTrackingItem[];
  pricing: {
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    delivery_fee: number;
    total_amount: number;
  };
  timeline: OrderStatusTimeline[];
  estimated_ready_time?: string;
  actual_ready_time?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderTrackingItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
  special_instructions?: string;
  is_veg: boolean;
  category: string;
}

export interface OrderStatusTimeline {
  status: OrderTrackingStatus;
  timestamp: string;
  message: string;
  estimated_time?: number; // minutes
  actual_time?: number; // minutes
  is_current: boolean;
  is_completed: boolean;
  icon: string;
  color: string;
}

export type OrderTrackingStatus = 
  | 'placed'
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery'
  | 'delivered'
  | 'served' 
  | 'cancelled';

export type PaymentTrackingStatus = 
  | 'pending' 
  | 'processing'
  | 'paid' 
  | 'failed' 
  | 'refunded';

export interface LiveOrderUpdate {
  order_id: string;
  status: OrderTrackingStatus;
  estimated_ready_time?: string;
  message?: string;
  timestamp: string;
}

export interface OrderEstimate {
  order_id: string;
  estimated_preparation_time: number; // minutes
  estimated_ready_time: string;
  queue_position?: number;
  kitchen_load: 'low' | 'medium' | 'high';
  factors: EstimationFactor[];
}

export interface EstimationFactor {
  factor: string;
  impact: number; // minutes
  description: string;
}

export interface KitchenStatus {
  venue_id: string;
  current_load: 'low' | 'medium' | 'high';
  active_orders: number;
  average_preparation_time: number;
  queue_length: number;
  estimated_wait_time: number;
  last_updated: string;
}

export interface DeliveryTracking {
  order_id: string;
  delivery_partner?: {
    name: string;
    phone: string;
    vehicle_type: string;
    rating: number;
  };
  pickup_time?: string;
  estimated_delivery_time?: string;
  current_location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  delivery_route?: RoutePoint[];
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
}

export interface CustomerNotification {
  id: string;
  order_id: string;
  customer_id?: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

export type NotificationType = 
  | 'order_confirmed'
  | 'preparation_started'
  | 'order_ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'delay_notification'
  | 'cancellation';

export type NotificationChannel = 
  | 'sms'
  | 'email'
  | 'push'
  | 'whatsapp';

export interface FeedbackRequest {
  order_id: string;
  customer_id?: string;
  rating: number; // 1-5
  feedback_text?: string;
  categories: FeedbackCategory[];
  would_recommend: boolean;
  delivery_rating?: number;
  food_quality_rating?: number;
  service_rating?: number;
  submitted_at: string;
}

export interface FeedbackCategory {
  category: string;
  rating: number;
  comments?: string;
}

class TrackingService {
  // Order Tracking

  // Get order tracking information
  async getOrderTracking(orderId: string): Promise<OrderTracking | null> {
    try {
      const response = await apiService.get<OrderTracking>(`/tracking/orders/${orderId}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Get order tracking by order number (public endpoint)
  async getOrderTrackingByNumber(orderNumber: string): Promise<OrderTracking | null> {
    try {
      const response = await apiService.get<OrderTracking>(`/tracking/public/orders/${orderNumber}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Get multiple orders tracking for a customer
  async getCustomerOrdersTracking(customerId: string, limit?: number): Promise<OrderTracking[]> {
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await apiService.get<OrderTracking[]>(`/tracking/customers/${customerId}/orders${params}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  // Get venue orders tracking
  async getVenueOrdersTracking(venueId: string, filters?: {
    status?: OrderTrackingStatus;
    date?: string;
    limit?: number;
  }): Promise<OrderTracking[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date) params.append('date', filters.date);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiService.get<OrderTracking[]>(
        `/tracking/venues/${venueId}/orders?${params.toString()}`
      );
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  // Live Updates and Real-time Tracking

  // Subscribe to order updates (WebSocket simulation)
  async subscribeToOrderUpdates(orderId: string, callback: (update: LiveOrderUpdate) => void): Promise<() => void> {
    try {
      // In a real implementation, this would establish a WebSocket connection
      // For now, we'll simulate with polling
      const pollInterval = setInterval(async () => {
        try {
          const response = await apiService.get<LiveOrderUpdate>(`/tracking/orders/${orderId}/live-updates`);
          if (response.data) {
            callback(response.data);
          }
        } catch (error) {
          }
      }, 30000); // Poll every 30 seconds

      // Return unsubscribe function
      return () => {
        clearInterval(pollInterval);
      };
    } catch (error) {
      return () => {}; // Return empty unsubscribe function
    }
  }

  // Get real-time kitchen status
  async getKitchenStatus(venueId: string): Promise<KitchenStatus | null> {
    try {
      const response = await apiService.get<KitchenStatus>(`/tracking/venues/${venueId}/kitchen-status`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Order Estimation

  // Get order preparation estimate
  async getOrderEstimate(orderId: string): Promise<OrderEstimate | null> {
    try {
      const response = await apiService.get<OrderEstimate>(`/tracking/orders/${orderId}/estimate`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Calculate estimated preparation time for new order
  async calculatePreparationTime(venueId: string, items: Array<{
    menu_item_id: string;
    quantity: number;
  }>): Promise<{
    estimated_time: number;
    factors: EstimationFactor[];
  } | null> {
    try {
      const response = await apiService.post<{
        estimated_time: number;
        factors: EstimationFactor[];
      }>(`/tracking/venues/${venueId}/estimate-preparation-time`, { items });
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Update order estimated time
  async updateOrderEstimate(orderId: string, estimatedMinutes: number): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/tracking/orders/${orderId}/estimate`, {
        estimated_minutes: estimatedMinutes
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update order estimate');
    }
  }

  // Delivery Tracking

  // Get delivery tracking information
  async getDeliveryTracking(orderId: string): Promise<DeliveryTracking | null> {
    try {
      const response = await apiService.get<DeliveryTracking>(`/tracking/orders/${orderId}/delivery`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Update delivery status
  async updateDeliveryStatus(orderId: string, status: DeliveryTracking['status'], location?: {
    latitude: number;
    longitude: number;
    address?: string;
  }): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/tracking/orders/${orderId}/delivery-status`, {
        status,
        location
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update delivery status');
    }
  }

  // Customer Notifications

  // Get order notifications
  async getOrderNotifications(orderId: string): Promise<CustomerNotification[]> {
    try {
      const response = await apiService.get<CustomerNotification[]>(`/tracking/orders/${orderId}/notifications`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  // Send custom notification
  async sendCustomNotification(orderId: string, notification: {
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    message: string;
  }): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/tracking/orders/${orderId}/notify`, notification);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to send notification');
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/tracking/notifications/${notificationId}/read`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to mark notification as read');
    }
  }

  // Feedback and Reviews

  // Submit order feedback
  async submitOrderFeedback(orderId: string, feedback: Omit<FeedbackRequest, 'order_id' | 'submitted_at'>): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/tracking/orders/${orderId}/feedback`, {
        ...feedback,
        order_id: orderId,
        submitted_at: new Date().toISOString()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to submit feedback');
    }
  }

  // Get order feedback
  async getOrderFeedback(orderId: string): Promise<FeedbackRequest | null> {
    try {
      const response = await apiService.get<FeedbackRequest>(`/tracking/orders/${orderId}/feedback`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Status Management

  // Update order status with tracking
  async updateOrderStatus(orderId: string, status: OrderTrackingStatus, message?: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/tracking/orders/${orderId}/status`, {
        status,
        message,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update order status');
    }
  }

  // Add custom timeline event
  async addTimelineEvent(orderId: string, event: {
    message: string;
    icon?: string;
    color?: string;
  }): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/tracking/orders/${orderId}/timeline`, {
        ...event,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to add timeline event');
    }
  }

  // Utility Methods

  // Get status display information
  getStatusDisplayInfo(status: OrderTrackingStatus): {
    label: string;
    color: string;
    icon: string;
    description: string;
  } {
    const statusInfo = {
      placed: {
        label: 'Order Placed',
        color: '#2196F3',
        icon: 'receipt',
        description: 'Your order has been received and is being processed'
      },
      confirmed: {
        label: 'Confirmed',
        color: '#4CAF50',
        icon: 'check_circle',
        description: 'Your order has been confirmed and will be prepared soon'
      },
      preparing: {
        label: 'Preparing',
        color: '#FF9800',
        icon: 'restaurant',
        description: 'Our chefs are preparing your delicious meal'
      },
      ready: {
        label: 'Ready',
        color: '#8BC34A',
        icon: 'done_all',
        description: 'Your order is ready for pickup or serving'
      },
      out_for_delivery: {
        label: 'Out for Delivery',
        color: '#9C27B0',
        icon: 'local_shipping',
        description: 'Your order is on the way to you'
      },
      delivered: {
        label: 'Delivered',
        color: '#4CAF50',
        icon: 'home',
        description: 'Your order has been delivered successfully'
      },
      served: {
        label: 'Served',
        color: '#4CAF50',
        icon: 'restaurant_menu',
        description: 'Your order has been served. Enjoy your meal!'
      },
      cancelled: {
        label: 'Cancelled',
        color: '#F44336',
        icon: 'cancel',
        description: 'Your order has been cancelled'
      }
    };

    return statusInfo[status] || statusInfo.placed;
  }

  // Calculate time elapsed since order
  getTimeElapsed(orderTime: string): string {
    const now = new Date();
    const orderDate = new Date(orderTime);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  // Calculate estimated delivery time
  getEstimatedDeliveryTime(orderTime: string, estimatedMinutes: number): string {
    const orderDate = new Date(orderTime);
    const estimatedTime = new Date(orderDate.getTime() + estimatedMinutes * 60000);
    
    return estimatedTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get progress percentage
  getProgressPercentage(status: OrderTrackingStatus): number {
    const statusOrder = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'served'];
    const currentIndex = statusOrder.indexOf(status);
    
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / statusOrder.length) * 100;
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

  // Format time
  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Check if order can be cancelled
  canCancelOrder(status: OrderTrackingStatus): boolean {
    return ['placed', 'confirmed'].includes(status);
  }

  // Check if order can be modified
  canModifyOrder(status: OrderTrackingStatus): boolean {
    return ['placed'].includes(status);
  }

  // Get next expected status
  getNextStatus(currentStatus: OrderTrackingStatus): OrderTrackingStatus | null {
    const statusFlow: Record<OrderTrackingStatus, OrderTrackingStatus | null> = {
      placed: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'served', // or 'out_for_delivery' for delivery orders
      out_for_delivery: 'delivered',
      delivered: null,
      served: null,
      cancelled: null
    };

    return statusFlow[currentStatus] || null;
  }

  // Validate tracking data
  validateTrackingData(tracking: Partial<OrderTracking>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!tracking.order_id) {
      errors.push('Order ID is required');
    }

    if (!tracking.customer?.name) {
      errors.push('Customer name is required');
    }

    if (!tracking.customer?.phone) {
      errors.push('Customer phone is required');
    }

    if (!tracking.items || tracking.items.length === 0) {
      errors.push('Order must have at least one item');
    }

    return { isValid: errors.length === 0, errors };
  }
}

export const trackingService = new TrackingService();