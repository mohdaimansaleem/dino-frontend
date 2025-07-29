import { apiService } from './api';
import { ApiResponse } from '../types';

// Venue-related types
export interface Venue {
  id: string;
  name: string;
  description: string;
  workspace_id: string;
  admin_id?: string;
  owner_id?: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
    landmark?: string;
  };
  phone: string;
  email: string;
  website?: string;
  logo_url?: string;
  cuisine_types: string[];
  price_range: 'budget' | 'mid_range' | 'premium' | 'luxury';
  operating_hours: OperatingHours[];
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'suspended';
  status: 'active' | 'inactive' | 'maintenance' | 'closed';
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  features?: string[];
  created_at: string;
  updated_at: string;
}

export interface OperatingHours {
  day_of_week: number; // 0=Monday, 6=Sunday
  is_open: boolean;
  open_time?: string;
  close_time?: string;
  is_24_hours: boolean;
  break_start?: string;
  break_end?: string;
}

export interface VenueCreate {
  name: string;
  description: string;
  workspace_id: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
    landmark?: string;
  };
  phone: string;
  email: string;
  website?: string;
  cuisine_types: string[];
  price_range: 'budget' | 'mid_range' | 'premium' | 'luxury';
  operating_hours?: OperatingHours[];
  subscription_plan?: 'basic' | 'premium' | 'enterprise';
}

export interface VenueUpdate {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cuisine_types?: string[];
  price_range?: 'budget' | 'mid_range' | 'premium' | 'luxury';
  operating_hours?: OperatingHours[];
  subscription_plan?: 'basic' | 'premium' | 'enterprise';
  subscription_status?: 'active' | 'inactive' | 'suspended';
  status?: 'active' | 'inactive' | 'maintenance' | 'closed';
  is_active?: boolean;
}

export interface VenueAnalytics {
  venue_id: string;
  total_menu_items: number;
  total_tables: number;
  total_orders_today: number;
  total_revenue_today: number;
  total_customers: number;
  average_order_value: number;
  popular_items: Array<{
    menu_item_id: string;
    menu_item_name: string;
    order_count: number;
    revenue: number;
  }>;
  table_utilization: number;
  customer_satisfaction: number;
}

class VenueService {
  // Get all venues (with filtering)
  async getVenues(filters?: {
    workspace_id?: string;
    subscription_status?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<Venue[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.workspace_id) params.append('workspace_id', filters.workspace_id);
      if (filters?.subscription_status) params.append('subscription_status', filters.subscription_status);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await apiService.get<Venue[]>(`/venues?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get venues:', error);
      return [];
    }
  }

  // Get public venues (no authentication required)
  async getPublicVenues(filters?: {
    search?: string;
    cuisine_type?: string;
    price_range?: string;
    page?: number;
    page_size?: number;
  }): Promise<{
    venues: Venue[];
    total: number;
    page: number;
    total_pages: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.cuisine_type) params.append('cuisine_type', filters.cuisine_type);
      if (filters?.price_range) params.append('price_range', filters.price_range);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());

      const response = await apiService.get<any>(`/venues/public?${params.toString()}`);
      
      if (response.success && response.data) {
        return {
          venues: response.data.data || response.data,
          total: response.data.total || 0,
          page: response.data.page || 1,
          total_pages: response.data.total_pages || 1
        };
      }
      
      return { venues: [], total: 0, page: 1, total_pages: 1 };
    } catch (error) {
      console.error('Failed to get public venues:', error);
      return { venues: [], total: 0, page: 1, total_pages: 1 };
    }
  }

  // Get venue by ID
  async getVenue(venueId: string): Promise<Venue | null> {
    try {
      const response = await apiService.get<Venue>(`/venues/${venueId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get venue:', error);
      return null;
    }
  }

  // Get public venue by ID
  async getPublicVenue(venueId: string): Promise<Venue | null> {
    try {
      const response = await apiService.get<Venue>(`/venues/public/${venueId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get public venue:', error);
      return null;
    }
  }

  // Create new venue
  async createVenue(venueData: VenueCreate): Promise<ApiResponse<Venue>> {
    try {
      return await apiService.post<Venue>('/venues', venueData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create venue');
    }
  }

  // Update venue
  async updateVenue(venueId: string, venueData: VenueUpdate): Promise<ApiResponse<Venue>> {
    try {
      return await apiService.put<Venue>(`/venues/${venueId}`, venueData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update venue');
    }
  }

  // Delete venue (soft delete)
  async deleteVenue(venueId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/venues/${venueId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete venue');
    }
  }

  // Activate venue
  async activateVenue(venueId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/venues/${venueId}/activate`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to activate venue');
    }
  }

  // Deactivate venue
  async deactivateVenue(venueId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/venues/${venueId}/deactivate`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to deactivate venue');
    }
  }

  // Get user's venues
  async getMyVenues(): Promise<Venue[]> {
    try {
      const response = await apiService.get<Venue[]>('/venues/my-venues');
      return response.data || [];
    } catch (error) {
      console.error('Failed to get user venues:', error);
      return [];
    }
  }

  // Search venues
  async searchVenues(query: string): Promise<Venue[]> {
    try {
      const response = await apiService.get<Venue[]>(`/venues/search/text?q=${encodeURIComponent(query)}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to search venues:', error);
      return [];
    }
  }

  // Get venues by subscription status
  async getVenuesBySubscription(status: 'active' | 'inactive' | 'suspended'): Promise<Venue[]> {
    try {
      const response = await apiService.get<Venue[]>(`/venues/filter/subscription/${status}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get venues by subscription:', error);
      return [];
    }
  }

  // Get venue analytics
  async getVenueAnalytics(venueId: string): Promise<VenueAnalytics | null> {
    try {
      const response = await apiService.get<VenueAnalytics>(`/venues/${venueId}/analytics`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get venue analytics:', error);
      return null;
    }
  }

  // Upload venue logo
  async uploadVenueLogo(venueId: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ logo_url: string }>> {
    try {
      return await apiService.uploadFile<{ logo_url: string }>(
        `/venues/${venueId}/logo`,
        file,
        onProgress
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to upload logo');
    }
  }

  // Update operating hours
  async updateOperatingHours(venueId: string, operatingHours: OperatingHours[]): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/venues/${venueId}/hours`, operatingHours);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update operating hours');
    }
  }

  // Get operating hours
  async getOperatingHours(venueId: string): Promise<OperatingHours[]> {
    try {
      const response = await apiService.get<OperatingHours[]>(`/venues/${venueId}/hours`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get operating hours:', error);
      return [];
    }
  }

  // Update subscription
  async updateSubscription(
    venueId: string, 
    subscriptionPlan: 'basic' | 'premium' | 'enterprise',
    subscriptionStatus: 'active' | 'inactive' | 'suspended'
  ): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/venues/${venueId}/subscription`, {
        subscription_plan: subscriptionPlan,
        subscription_status: subscriptionStatus
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update subscription');
    }
  }

  // Check if venue is currently open
  isVenueOpen(venue: Venue): boolean {
    if (!venue.is_active || venue.status !== 'active') {
      return false;
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0=Sunday, 1=Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Convert Sunday (0) to our format (6)
    const dayOfWeek = currentDay === 0 ? 6 : currentDay - 1;

    const todayHours = venue.operating_hours.find(h => h.day_of_week === dayOfWeek);
    
    if (!todayHours || !todayHours.is_open) {
      return false;
    }

    if (todayHours.is_24_hours) {
      return true;
    }

    if (!todayHours.open_time || !todayHours.close_time) {
      return false;
    }

    // Check if currently in break time
    if (todayHours.break_start && todayHours.break_end) {
      if (currentTime >= todayHours.break_start && currentTime <= todayHours.break_end) {
        return false;
      }
    }

    // Check if within operating hours
    if (todayHours.close_time < todayHours.open_time) {
      // Crosses midnight
      return currentTime >= todayHours.open_time || currentTime <= todayHours.close_time;
    } else {
      return currentTime >= todayHours.open_time && currentTime <= todayHours.close_time;
    }
  }

  // Get next opening/closing time
  getNextOperatingTime(venue: Venue): { type: 'opens' | 'closes'; time: string } | null {
    if (!venue.operating_hours.length) return null;

    const now = new Date();
    const currentDay = now.getDay();
    const dayOfWeek = currentDay === 0 ? 6 : currentDay - 1;

    const todayHours = venue.operating_hours.find(h => h.day_of_week === dayOfWeek);
    
    if (todayHours && todayHours.is_open && !todayHours.is_24_hours) {
      const currentTime = now.toTimeString().slice(0, 5);
      
      if (this.isVenueOpen(venue)) {
        return { type: 'closes', time: todayHours.close_time || '' };
      } else if (todayHours.open_time && currentTime < todayHours.open_time) {
        return { type: 'opens', time: todayHours.open_time };
      }
    }

    // Find next opening day
    for (let i = 1; i <= 7; i++) {
      const nextDay = (dayOfWeek + i) % 7;
      const nextDayHours = venue.operating_hours.find(h => h.day_of_week === nextDay);
      
      if (nextDayHours && nextDayHours.is_open && nextDayHours.open_time) {
        return { type: 'opens', time: nextDayHours.open_time };
      }
    }

    return null;
  }

  // Format venue address
  formatAddress(location: Venue['location']): string {
    const parts = [
      location.address,
      location.city,
      location.state,
      location.postal_code,
      location.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  // Get venue features as formatted list
  getVenueFeatures(venue: Venue): string[] {
    const features = venue.features || [];
    const defaultFeatures = [];

    // Add features based on venue data
    if (venue.cuisine_types.length > 0) {
      defaultFeatures.push(`Cuisine: ${venue.cuisine_types.join(', ')}`);
    }

    if (venue.price_range) {
      const priceLabels = {
        budget: 'Budget Friendly',
        mid_range: 'Mid Range',
        premium: 'Premium',
        luxury: 'Luxury'
      };
      defaultFeatures.push(priceLabels[venue.price_range]);
    }

    if (venue.rating > 0) {
      defaultFeatures.push(`${venue.rating}★ (${venue.total_reviews} reviews)`);
    }

    return [...features, ...defaultFeatures];
  }
}

export const venueService = new VenueService();