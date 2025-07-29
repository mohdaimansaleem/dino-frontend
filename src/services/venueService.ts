import { apiService } from './api';
import { ApiResponse } from '../types';

export interface Venue {
  id: string;
  name: string;
  description: string;
  workspace_id: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  business_hours: {
    [key: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };
  cuisine_types: string[];
  features: string[];
  image_urls: string[];
  logo_url?: string;
  is_active: boolean;
  settings: {
    tax_rate: number;
    service_charge_rate: number;
    currency: string;
    timezone: string;
    auto_accept_orders: boolean;
    max_tables: number;
  };
  created_at: string;
  updated_at: string;
}

export interface VenueCreate {
  name: string;
  description: string;
  workspace_id: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  business_hours: Record<string, any>;
  cuisine_types: string[];
  features: string[];
  settings: {
    tax_rate: number;
    service_charge_rate: number;
    currency: string;
    timezone: string;
    auto_accept_orders: boolean;
    max_tables: number;
  };
}

class VenueService {
  async getVenues(workspaceId?: string): Promise<Venue[]> {
    try {
      const params = workspaceId ? { workspace_id: workspaceId } : {};
      const response = await apiService.get<Venue[]>('/venues', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch venues');
      }
    } catch (error: any) {
      console.error('Get venues error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch venues');
    }
  }

  async getVenue(venueId: string): Promise<Venue> {
    try {
      const response = await apiService.get<Venue>(`/venues/${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch venue');
      }
    } catch (error: any) {
      console.error('Get venue error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch venue');
    }
  }

  async createVenue(venueData: VenueCreate): Promise<Venue> {
    try {
      const response = await apiService.post<Venue>('/venues', venueData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create venue');
      }
    } catch (error: any) {
      console.error('Create venue error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create venue');
    }
  }

  async updateVenue(venueId: string, venueData: Partial<VenueCreate>): Promise<Venue> {
    try {
      const response = await apiService.put<Venue>(`/venues/${venueId}`, venueData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update venue');
      }
    } catch (error: any) {
      console.error('Update venue error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update venue');
    }
  }

  async deleteVenue(venueId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/venues/${venueId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete venue');
      }
    } catch (error: any) {
      console.error('Delete venue error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete venue');
    }
  }

  async activateVenue(venueId: string): Promise<void> {
    try {
      const response = await apiService.post(`/venues/${venueId}/activate`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to activate venue');
      }
    } catch (error: any) {
      console.error('Activate venue error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to activate venue');
    }
  }

  async deactivateVenue(venueId: string): Promise<void> {
    try {
      const response = await apiService.post(`/venues/${venueId}/deactivate`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to deactivate venue');
      }
    } catch (error: any) {
      console.error('Deactivate venue error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to deactivate venue');
    }
  }

  async uploadVenueImages(venueId: string, files: File[]): Promise<string[]> {
    try {
      const response = await apiService.uploadFiles<{ image_urls: string[] }>(
        `/venues/${venueId}/images`,
        files
      );
      
      if (response.success && response.data) {
        return response.data.image_urls;
      } else {
        throw new Error(response.message || 'Failed to upload venue images');
      }
    } catch (error: any) {
      console.error('Upload venue images error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to upload venue images');
    }
  }

  async uploadVenueLogo(venueId: string, file: File): Promise<string> {
    try {
      const response = await apiService.uploadFile<{ logo_url: string }>(
        `/venues/${venueId}/logo`,
        file
      );
      
      if (response.success && response.data) {
        return response.data.logo_url;
      } else {
        throw new Error(response.message || 'Failed to upload venue logo');
      }
    } catch (error: any) {
      console.error('Upload venue logo error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to upload venue logo');
    }
  }

  async getVenueAnalytics(venueId: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await apiService.get(`/venues/${venueId}/analytics`, params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch venue analytics');
      }
    } catch (error: any) {
      console.error('Get venue analytics error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch venue analytics');
    }
  }
}

export const venueService = new VenueService();