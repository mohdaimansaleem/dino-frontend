/**
 * Dashboard Types for Real Database Data
 * 
 * These types represent the actual data structure that should come from the backend
 * based on real database schemas (venues, orders, menu_items, tables, users)
 */

export interface DashboardPeriod {
  start_date: string;
  end_date: string;
  period_type: 'today' | 'week' | 'month' | 'custom';
}

export interface VenueDashboardStats {
  // Today's metrics
  today: {
    orders_count: number;
    revenue: number;
    average_order_value: number;
    customers_served: number;
  };
  
  // Current status
  current: {
    tables_total: number;
    tables_occupied: number;
    tables_available: number;
    tables_reserved: number;
    menu_items_total: number;
    menu_items_active: number;
    staff_total: number;
    staff_active: number;
  };
  
  // Period comparison (vs previous period)
  comparison: {
    orders_growth: number; // percentage
    revenue_growth: number; // percentage
    customer_growth: number; // percentage
  };
}

export interface RecentOrder {
  id: string;
  order_number: string;
  table_number: string;
  customer_name?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  items_count: number;
  created_at: string;
  estimated_ready_time?: string;
}

export interface TopMenuItem {
  id: string;
  name: string;
  category_name: string;
  price: number;
  orders_count: number;
  total_revenue: number;
  percentage_of_total: number;
}

export interface RevenueDataPoint {
  date: string; // YYYY-MM-DD
  day_name: string; // Monday, Tuesday, etc.
  orders_count: number;
  revenue: number;
  customers_count: number;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TableStatusBreakdown {
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  count: number;
  percentage: number;
  color: string;
}

export interface StaffPerformance {
  user_id: string;
  name: string;
  role: string;
  orders_handled: number;
  revenue_generated: number;
  average_service_time: number; // in minutes
  customer_rating?: number;
}

export interface ComprehensiveDashboardData {
  venue_id: string;
  venue_name: string;
  period: DashboardPeriod;
  
  // Core statistics
  stats: VenueDashboardStats;
  
  // Recent activity
  recent_orders: RecentOrder[];
  
  // Analytics data
  revenue_trend: RevenueDataPoint[]; // Last 7 days
  order_status_breakdown: OrderStatusBreakdown[];
  table_status_breakdown: TableStatusBreakdown[];
  
  // Performance data
  top_menu_items: TopMenuItem[]; // Top 10
  staff_performance: StaffPerformance[]; // Top 5
  
  // Operational insights
  peak_hours: Array<{
    hour: number; // 0-23
    orders_count: number;
    revenue: number;
  }>;
  
  // Alerts and notifications
  alerts: Array<{
    type: 'warning' | 'info' | 'error';
    message: string;
    action_required: boolean;
  }>;
  
  // Last updated timestamp
  last_updated: string;
}

// Simplified response for different user roles
export interface AdminDashboardResponse extends ComprehensiveDashboardData {}

export interface OperatorDashboardResponse {
  venue_id: string;
  venue_name: string;
  
  // Operator-focused stats
  stats: {
    active_orders: number;
    pending_orders: number;
    preparing_orders: number;
    ready_orders: number;
    tables_occupied: number;
    tables_available: number;
  };
  
  // Real-time data
  active_orders: RecentOrder[];
  table_status_breakdown: TableStatusBreakdown[];
  
  // Operational alerts
  alerts: Array<{
    type: 'urgent' | 'normal';
    message: string;
    order_id?: string;
    table_id?: string;
  }>;
  
  last_updated: string;
}

export interface SuperAdminDashboardResponse {
  // System-wide statistics
  system_stats: {
    total_workspaces: number;
    total_venues: number;
    total_active_venues: number;
    total_users: number;
    total_orders_today: number;
    total_revenue_today: number;
  };
  
  // Workspace performance
  workspace_performance: Array<{
    workspace_id: string;
    workspace_name: string;
    venues_count: number;
    active_venues: number;
    today_orders: number;
    today_revenue: number;
    growth_percentage: number;
  }>;
  
  // Top performing venues
  top_venues: Array<{
    venue_id: string;
    venue_name: string;
    workspace_name: string;
    today_orders: number;
    today_revenue: number;
    monthly_growth: number;
  }>;
  
  // System alerts
  system_alerts: Array<{
    type: 'critical' | 'warning' | 'info';
    message: string;
    venue_id?: string;
    workspace_id?: string;
    requires_action: boolean;
  }>;
  
  last_updated: string;
}