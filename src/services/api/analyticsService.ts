import { apiService } from '../../utils/api';
import { ApiResponse } from '../../types/api';

// Analytics-related types
export interface DashboardAnalytics {
  venue_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
    active_orders: number;
    customer_count: number;
    table_turnover_rate: number;
  };
  revenue_trend: RevenueDataPoint[];
  order_status_breakdown: OrderStatusBreakdown[];
  popular_items: PopularItem[];
  hourly_performance: HourlyPerformance[];
  cafe_performance_metrics: PerformanceMetric[];
  payment_method_breakdown: PaymentMethodBreakdown[];
  customer_satisfaction: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: RatingDistribution[];
  };
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  average_order_value: number;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PopularItem {
  menu_item_id: string;
  name: string;
  category: string;
  orders: number;
  revenue: number;
  percentage_of_total: number;
  image_url?: string;
}

export interface HourlyPerformance {
  hour: string;
  orders: number;
  revenue: number;
  average_order_value: number;
  peak_indicator: boolean;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  max_value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  percentage_change: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  table_number: string;
  table_id: string;
  items_count: number;
  total_amount: number;
  status: string;
  created_at: string;
  time_ago: string;
  customer_name?: string;
}

export interface LiveMetrics {
  venue_id: string;
  timestamp: string;
  active_orders: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  served_orders_today: number;
  current_revenue_today: number;
  tables_occupied: number;
  total_tables: number;
  average_wait_time: number;
  kitchen_efficiency: number;
}

export interface SalesReport {
  venue_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    average_order_value: number;
    revenue_growth: number;
    order_growth: number;
  };
  daily_breakdown: DailySales[];
  category_performance: CategoryPerformance[];
  top_selling_items: PopularItem[];
  payment_analysis: PaymentMethodBreakdown[];
  customer_insights: CustomerInsights;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  average_order_value: number;
  day_of_week: string;
}

export interface CategoryPerformance {
  category_id: string;
  category_name: string;
  revenue: number;
  orders: number;
  items_sold: number;
  percentage_of_total_revenue: number;
  growth_rate: number;
}

export interface CustomerInsights {
  new_customers: number;
  returning_customers: number;
  customer_retention_rate: number;
  average_customer_lifetime_value: number;
  most_popular_order_time: string;
  average_dining_duration: number;
}

export interface InventoryAnalytics {
  venue_id: string;
  low_stock_items: LowStockItem[];
  top_consuming_items: ConsumptionItem[];
  waste_analysis: WasteAnalysis;
  cost_analysis: CostAnalysis;
}

export interface LowStockItem {
  menu_item_id: string;
  name: string;
  current_stock: number;
  minimum_threshold: number;
  days_until_stockout: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ConsumptionItem {
  menu_item_id: string;
  name: string;
  quantity_consumed: number;
  revenue_generated: number;
  profit_margin: number;
}

export interface WasteAnalysis {
  total_waste_cost: number;
  waste_percentage: number;
  top_wasted_items: WastedItem[];
  waste_trend: WasteTrendPoint[];
}

export interface WastedItem {
  menu_item_id: string;
  name: string;
  quantity_wasted: number;
  cost_impact: number;
  reason: string;
}

export interface WasteTrendPoint {
  date: string;
  waste_amount: number;
  waste_cost: number;
}

export interface CostAnalysis {
  total_food_cost: number;
  food_cost_percentage: number;
  labor_cost: number;
  labor_cost_percentage: number;
  overhead_cost: number;
  net_profit_margin: number;
}

class AnalyticsService {
  // Dashboard Analytics

  // Get comprehensive dashboard analytics
  async getDashboardAnalytics(venueId: string, period?: {
    start_date?: string;
    end_date?: string;
  }): Promise<DashboardAnalytics | null> {
    try {
      const params = new URLSearchParams();
      if (period?.start_date) params.append('start_date', period.start_date);
      if (period?.end_date) params.append('end_date', period.end_date);

      const response = await apiService.get<DashboardAnalytics>(
        `/analytics/venues/${venueId}/dashboard?${params.toString()}`
      );
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Get recent orders for dashboard
  async getRecentOrders(venueId: string, limit: number = 10): Promise<RecentOrder[]> {
    try {
      const response = await apiService.get<RecentOrder[]>(
        `/analytics/venues/${venueId}/recent-orders?limit=${limit}`
      );
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  // Get live metrics for real-time dashboard updates
  async getLiveMetrics(venueId: string): Promise<LiveMetrics | null> {
    try {
      const response = await apiService.get<LiveMetrics>(
        `/analytics/venues/${venueId}/live-metrics`
      );
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Sales Analytics

  // Get comprehensive sales report
  async getSalesReport(venueId: string, period: {
    start_date: string;
    end_date: string;
  }): Promise<SalesReport | null> {
    try {
      const params = new URLSearchParams();
      params.append('start_date', period.start_date);
      params.append('end_date', period.end_date);

      const response = await apiService.get<SalesReport>(
        `/analytics/venues/${venueId}/sales-report?${params.toString()}`
      );
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Get revenue trend data
  async getRevenueTrend(venueId: string, period: {
    start_date: string;
    end_date: string;
  }, granularity: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<RevenueDataPoint[]> {
    try {
      const params = new URLSearchParams();
      params.append('start_date', period.start_date);
      params.append('end_date', period.end_date);
      params.append('granularity', granularity);

      const response = await apiService.get<RevenueDataPoint[]>(
        `/analytics/venues/${venueId}/revenue-trend?${params.toString()}`
      );
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  // Get popular items analytics
  async getPopularItems(venueId: string, period?: {
    start_date?: string;
    end_date?: string;
  }, limit: number = 10): Promise<PopularItem[]> {
    try {
      const params = new URLSearchParams();
      if (period?.start_date) params.append('start_date', period.start_date);
      if (period?.end_date) params.append('end_date', period.end_date);
      params.append('limit', limit.toString());

      const response = await apiService.get<PopularItem[]>(
        `/analytics/venues/${venueId}/popular-items?${params.toString()}`
      );
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  // Performance Analytics

  // Get hourly performance data
  async getHourlyPerformance(venueId: string, date?: string): Promise<HourlyPerformance[]> {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);

      const response = await apiService.get<HourlyPerformance[]>(
        `/analytics/venues/${venueId}/hourly-performance?${params.toString()}`
      );
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(venueId: string, period?: {
    start_date?: string;
    end_date?: string;
  }): Promise<PerformanceMetric[]> {
    try {
      const params = new URLSearchParams();
      if (period?.start_date) params.append('start_date', period.start_date);
      if (period?.end_date) params.append('end_date', period.end_date);

      const response = await apiService.get<PerformanceMetric[]>(
        `/analytics/venues/${venueId}/performance-metrics?${params.toString()}`
      );
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  // Customer Analytics

  // Get customer insights
  async getCustomerInsights(venueId: string, period: {
    start_date: string;
    end_date: string;
  }): Promise<CustomerInsights | null> {
    try {
      const params = new URLSearchParams();
      params.append('start_date', period.start_date);
      params.append('end_date', period.end_date);

      const response = await apiService.get<CustomerInsights>(
        `/analytics/venues/${venueId}/customer-insights?${params.toString()}`
      );
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Get customer satisfaction data
  async getCustomerSatisfaction(venueId: string, period?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: RatingDistribution[];
  } | null> {
    try {
      const params = new URLSearchParams();
      if (period?.start_date) params.append('start_date', period.start_date);
      if (period?.end_date) params.append('end_date', period.end_date);

      const response = await apiService.get<any>(
        `/analytics/venues/${venueId}/customer-satisfaction?${params.toString()}`
      );
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Inventory Analytics

  // Get inventory analytics
  async getInventoryAnalytics(venueId: string): Promise<InventoryAnalytics | null> {
    try {
      const response = await apiService.get<InventoryAnalytics>(
        `/analytics/venues/${venueId}/inventory`
      );
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Export and Reporting

  // Export analytics data
  async exportAnalytics(venueId: string, reportType: 'sales' | 'performance' | 'inventory' | 'customer', 
    period: { start_date: string; end_date: string }, 
    format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob | null> {
    try {
      const params = new URLSearchParams();
      params.append('report_type', reportType);
      params.append('start_date', period.start_date);
      params.append('end_date', period.end_date);
      params.append('format', format);

      // Note: getBlob method would need to be implemented in apiService
      // For now, we'll use a regular get request and handle the blob response
      const response = await apiService.get<any>(
        `/analytics/venues/${venueId}/export?${params.toString()}`
      );
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // Utility Methods

  // Format currency for display
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Format percentage
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  // Calculate percentage change
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  // Get trend indicator
  getTrendIndicator(change: number): 'up' | 'down' | 'stable' {
    if (change > 2) return 'up';
    if (change < -2) return 'down';
    return 'stable';
  }

  // Format time duration
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  // Get status color for metrics
  getMetricStatusColor(metric: PerformanceMetric): string {
    const percentage = (metric.value / metric.max_value) * 100;
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  // Generate date range for analytics
  generateDateRange(days: number): { start_date: string; end_date: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  }

  // Get default analytics period (last 7 days)
  getDefaultPeriod(): { start_date: string; end_date: string } {
    return this.generateDateRange(7);
  }

  // Get comparison period (previous period of same length)
  getComparisonPeriod(period: { start_date: string; end_date: string }): { start_date: string; end_date: string } {
    const startDate = new Date(period.start_date);
    const endDate = new Date(period.end_date);
    const periodLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const comparisonEndDate = new Date(startDate);
    comparisonEndDate.setDate(comparisonEndDate.getDate() - 1);
    
    const comparisonStartDate = new Date(comparisonEndDate);
    comparisonStartDate.setDate(comparisonStartDate.getDate() - periodLength + 1);

    return {
      start_date: comparisonStartDate.toISOString().split('T')[0],
      end_date: comparisonEndDate.toISOString().split('T')[0]
    };
  }

  // Validate date range
  validateDateRange(startDate: string, endDate: string): { isValid: boolean; error?: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start > end) {
      return { isValid: false, error: 'Start date must be before end date' };
    }

    if (end > now) {
      return { isValid: false, error: 'End date cannot be in the future' };
    }

    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      return { isValid: false, error: 'Date range cannot exceed 365 days' };
    }

    return { isValid: true };
  }
}

export const analyticsService = new AnalyticsService();