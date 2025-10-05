import { apiService } from '../../utils/api';
import { 
  Venue, 
  VenueCreate, 
  VenueUpdate, 
  VenueAnalytics,
  VenueStatus,
  WorkspaceVenue,
  OperatingHours,
  PaginatedResponse,
  ApiResponse,
  VenueFilters
} from '../../types/api';

class VenueService {
  // =============================================================================
  // PUBLIC VENUE METHODS (No authentication required)
  // =============================================================================

  /**
   * Get public venues with filtering and pagination
   */
  async getPublicVenues(filters?: VenueFilters): Promise<PaginatedResponse<Venue>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.cuisine_type) params.append('cuisine_type', filters.cuisine_type);
      if (filters?.price_range) params.append('price_range', filters.price_range);

      const response = await apiService.get<PaginatedResponse<Venue>>(`/venues/public?${params.toString()}`);
      
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

  /**
   * Get public venue details by ID
   */
  async getPublicVenue(venueId: string): Promise<Venue | null> {
    try {
      const response = await apiService.get<Venue>(`/venues/public/${venueId}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // =============================================================================
  // AUTHENTICATED VENUE METHODS
  // =============================================================================

  /**
   * Get venues (filtered by user permissions)
   */
  async getVenues(filters?: VenueFilters): Promise<PaginatedResponse<Venue>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.subscription_status) params.append('subscription_status', filters.subscription_status);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

      const response = await apiService.get<PaginatedResponse<Venue>>(`/venues?${params.toString()}`);
      
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

  /**
   * Get venue by ID
   */
  async getVenue(venueId: string): Promise<Venue | null> {
    try {
      const response = await apiService.get<Venue>(`/venues/${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching venue:', error);
      return null;
    }
  }

  /**
   * Get venues by workspace ID (Venus API) - SINGLE API CALL ONLY
   */
  async getVenuesByWorkspace(workspaceId: string): Promise<WorkspaceVenue[]> {
    try {
      console.log('🏢 VenueService: Making SINGLE API call to get venues for workspace:', workspaceId);
      
      // PRIMARY API CALL: Try the specific workspace venues endpoint
      const response = await apiService.get<WorkspaceVenue[]>(`/venues/workspace/${workspaceId}/venues`);
      
      if (response.success && response.data) {
        console.log('✅ VenueService: Successfully fetched venues from workspace endpoint:', response.data.length);
        return response.data;
      }
      
      console.log('⚠️ VenueService: Workspace venues endpoint returned no data');
      return [];
    } catch (error) {
      console.error('❌ VenueService: Error fetching workspace venues from primary endpoint:', error);
      
      // FALLBACK API CALL: Try getting all venues and filter by workspace
      try {
        console.log('🔄 VenueService: Trying fallback - getting all venues and filtering by workspace');
        const allVenuesResponse = await this.getVenues({ page_size: 100 });
        
        if (allVenuesResponse.success && allVenuesResponse.data) {
          // Filter venues by workspace_id and convert to WorkspaceVenue format
          const workspaceVenues = allVenuesResponse.data
            .filter(venue => venue.workspace_id === workspaceId)
            .map(venue => ({
              id: venue.id,
              name: venue.name,
              description: venue.description,
              location: {
                city: venue.location.city,
                state: venue.location.state,
                country: venue.location.country,
                address: venue.location.address
              },
              phone: venue.phone,
              email: venue.email,
              is_active: venue.is_active,
              is_open: venue.is_open,
              status: venue.status || (venue.is_active ? 'active' : 'inactive'),
              subscription_status: venue.subscription_status || 'active',
              created_at: venue.created_at,
              updated_at: venue.updated_at || venue.created_at
            } as WorkspaceVenue));
          
          console.log('✅ VenueService: Fallback successful, found venues:', workspaceVenues.length);
          return workspaceVenues;
        }
      } catch (fallbackError) {
        console.error('❌ VenueService: Error in fallback venue fetching:', fallbackError);
      }
      
      console.log('❌ VenueService: All venue fetching attempts failed, returning empty array');
      return [];
    }
  }

  /**
   * Create a new venue
   */
  async createVenue(venueData: VenueCreate): Promise<ApiResponse<Venue>> {
    try {
      return await apiService.post<Venue>('/venues', venueData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create venue');
    }
  }

  /**
   * Update venue information
   */
  async updateVenue(venueId: string, venueData: VenueUpdate): Promise<ApiResponse<Venue>> {
    try {
      console.log('🔄 VenueService: Updating venue:', {
        venueId,
        updateData: venueData,
        endpoint: `/venues/${venueId}`
      });
      
      const response = await apiService.put<Venue>(`/venues/${venueId}`, venueData);
      
      console.log('✅ VenueService: Venue update response:', {
        success: response.success,
        venueData: response.data,
        venueStatus: response.data ? {
          is_active: response.data.is_active,
          is_open: response.data.is_open,
          status: response.data.status
        } : null
      });
      
      return response;
    } catch (error: any) {
      console.error('❌ VenueService: Error updating venue:', {
        venueId,
        updateData: venueData,
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update venue');
    }
  }

  /**
   * Delete venue permanently (hard delete)
   */
  async deleteVenue(venueId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/venues/${venueId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete venue');
    }
  }

  /**
   * Deactivate venue (soft delete)
   */
  async deactivateVenue(venueId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/venues/${venueId}/deactivate`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to deactivate venue');
    }
  }

  /**
   * Activate deactivated venue
   */
  async activateVenue(venueId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/venues/${venueId}/activate`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to activate venue');
    }
  }

  /**
   * Open venue for orders
   */
  async openVenue(venueId: string): Promise<ApiResponse<Venue>> {
    try {
      console.log('🔄 VenueService: Opening venue for orders:', venueId);
      
      // Try specific endpoint first
      try {
        const response = await apiService.post<Venue>(`/venues/${venueId}/open`);
        console.log('✅ VenueService: Venue opened via specific endpoint');
        return response;
      } catch (specificError) {
        console.log('⚠️ VenueService: Specific open endpoint not available, using update method');
        
        // Fallback to update method
        return await this.updateVenue(venueId, { is_open: true });
      }
    } catch (error: any) {
      console.error('❌ VenueService: Error opening venue:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to open venue');
    }
  }

  /**
   * Close venue for orders
   */
  async closeVenue(venueId: string): Promise<ApiResponse<Venue>> {
    try {
      console.log('🔄 VenueService: Closing venue for orders:', venueId);
      
      // Try specific endpoint first
      try {
        const response = await apiService.post<Venue>(`/venues/${venueId}/close`);
        console.log('✅ VenueService: Venue closed via specific endpoint');
        return response;
      } catch (specificError) {
        console.log('⚠️ VenueService: Specific close endpoint not available, using update method');
        
        // Fallback to update method
        return await this.updateVenue(venueId, { is_open: false });
      }
    } catch (error: any) {
      console.error('❌ VenueService: Error closing venue:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to close venue');
    }
  }

  /**
   * Get venue analytics
   */
  async getVenueAnalytics(venueId: string): Promise<VenueAnalytics | null> {
    try {
      const response = await apiService.get<VenueAnalytics>(`/venues/${venueId}/analytics`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // =============================================================================
  // OPERATING HOURS MANAGEMENT
  // =============================================================================

  /**
   * Get venue operating hours
   */
  async getOperatingHours(venueId: string): Promise<OperatingHours[]> {
    try {
      const response = await apiService.get<OperatingHours[]>(`/venues/${venueId}/hours`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Update venue operating hours
   */
  async updateOperatingHours(venueId: string, hours: OperatingHours[]): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/venues/${venueId}/hours`, hours);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update operating hours');
    }
  }

  /**
   * Check if venue is currently open
   */
  async checkVenueStatus(venueId: string): Promise<VenueStatus | null> {
    try {
      const response = await apiService.get<VenueStatus>(`/venues/${venueId}/status`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Format venue address for display
   */
  formatAddress(venue: Venue): string {
    const { location } = venue;
    const parts = [
      location.address,
      location.city,
      location.state,
      location.postal_code,
      location.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  /**
   * Calculate distance between two coordinates (in km)
   */
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return Math.round(d * 100) / 100; // Round to 2 decimal places
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Get venues near a location
   */
  async getVenuesNearLocation(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 10,
    filters?: Omit<VenueFilters, 'page' | 'page_size'>
  ): Promise<(Venue & { distance: number })[]> {
    try {
      // Get all venues (you might want to implement server-side location filtering)
      const response = await this.getPublicVenues({ ...filters, page_size: 100 });
      const venues = response.data;

      // Calculate distances and filter
      const venuesWithDistance = venues
        .map(venue => {
          if (venue.location.latitude && venue.location.longitude) {
            const distance = this.calculateDistance(
              latitude,
              longitude,
              venue.location.latitude,
              venue.location.longitude
            );
            return { ...venue, distance };
          }
          return null;
        })
        .filter((venue): venue is Venue & { distance: number } => 
          venue !== null && venue.distance <= radiusKm
        )
        .sort((a, b) => a.distance - b.distance);

      return venuesWithDistance;
    } catch (error) {
      return [];
    }
  }

  /**
   * Format price range for display
   */
  formatPriceRange(priceRange: string): string {
    const ranges = {
      budget: '$ - Budget Friendly',
      mid_range: '$$ - Mid Range',
      premium: '$$$ - Premium',
      luxury: '$$$$ - Luxury'
    };
    return ranges[priceRange as keyof typeof ranges] || priceRange;
  }

  /**
   * Get cuisine type display name
   */
  formatCuisineType(cuisineType: string): string {
    const cuisines = {
      indian: 'Indian',
      chinese: 'Chinese',
      italian: 'Italian',
      mexican: 'Mexican',
      american: 'American',
      thai: 'Thai',
      japanese: 'Japanese',
      mediterranean: 'Mediterranean',
      fusion: 'Fusion',
      continental: 'Continental',
      fast_food: 'Fast Food',
      venue: 'Venue',
      bakery: 'Bakery',
      desserts: 'Desserts',
      beverages: 'Beverages'
    };
    return cuisines[cuisineType as keyof typeof cuisines] || cuisineType;
  }

  /**
   * Check if venue is currently open based on operating hours
   */
  isVenueOpen(operatingHours: OperatingHours[]): boolean {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS format

    const todayHours = operatingHours.find(hours => hours.day_of_week === currentDay);
    
    if (!todayHours || !todayHours.is_open) {
      return false;
    }

    if (todayHours.is_24_hours) {
      return true;
    }

    if (!todayHours.open_time || !todayHours.close_time) {
      return false;
    }

    // Check if current time is within operating hours
    const isWithinHours = currentTime >= todayHours.open_time && currentTime <= todayHours.close_time;
    
    // Check if it's during break time
    if (isWithinHours && todayHours.break_start && todayHours.break_end) {
      const isDuringBreak = currentTime >= todayHours.break_start && currentTime <= todayHours.break_end;
      return !isDuringBreak;
    }

    return isWithinHours;
  }

  /**
   * Get next opening/closing time
   */
  getNextStatusChange(operatingHours: OperatingHours[]): {
    type: 'opening' | 'closing' | 'break_start' | 'break_end';
    time: string;
    day: string;
  } | null {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 8);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Check today's hours first
    const todayHours = operatingHours.find(hours => hours.day_of_week === currentDay);
    
    if (todayHours && todayHours.is_open && !todayHours.is_24_hours) {
      // Check if we're before opening
      if (todayHours.open_time && currentTime < todayHours.open_time) {
        return {
          type: 'opening',
          time: todayHours.open_time,
          day: 'Today'
        };
      }
      
      // Check if we're during break
      if (todayHours.break_start && todayHours.break_end && 
          currentTime >= todayHours.break_start && currentTime < todayHours.break_end) {
        return {
          type: 'break_end',
          time: todayHours.break_end,
          day: 'Today'
        };
      }
      
      // Check if we're before break
      if (todayHours.break_start && currentTime < todayHours.break_start) {
        return {
          type: 'break_start',
          time: todayHours.break_start,
          day: 'Today'
        };
      }
      
      // Check if we're before closing
      if (todayHours.close_time && currentTime < todayHours.close_time) {
        return {
          type: 'closing',
          time: todayHours.close_time,
          day: 'Today'
        };
      }
    }

    // Look for next opening day
    for (let i = 1; i <= 7; i++) {
      const nextDay = (currentDay + i) % 7;
      const nextDayHours = operatingHours.find(hours => hours.day_of_week === nextDay);
      
      if (nextDayHours && nextDayHours.is_open && nextDayHours.open_time) {
        return {
          type: 'opening',
          time: nextDayHours.open_time,
          day: i === 1 ? 'Tomorrow' : days[nextDay]
        };
      }
    }

    return null;
  }

  /**
   * Validate venue data before creation/update
   */
  validateVenueData(venueData: VenueCreate | VenueUpdate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if ('name' in venueData) {
      if (!venueData.name || venueData.name.trim().length < 2) {
        errors.push('Venue name must be at least 2 characters long');
      }
      if (venueData.name && venueData.name.length > 100) {
        errors.push('Venue name must be less than 100 characters');
      }
    }

    if ('location' in venueData && venueData.location) {
      if (!venueData.location.address || venueData.location.address.trim().length < 5) {
        errors.push('Address must be at least 5 characters long');
      }
      if (!venueData.location.city || venueData.location.city.trim().length < 2) {
        errors.push('City is required');
      }
      if (!venueData.location.country || venueData.location.country.trim().length < 2) {
        errors.push('Country is required');
      }
    }

    if ('phone' in venueData && venueData.phone) {
      if (!/^[+]?[\d\s\-()]{10,}$/.test(venueData.phone)) {
        errors.push('Please enter a valid phone number');
      }
    }

    if ('email' in venueData && venueData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(venueData.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Generate default operating hours (9 AM to 10 PM, Monday to Sunday)
   */
  generateDefaultOperatingHours(): OperatingHours[] {
    return Array.from({ length: 7 }, (_, index) => ({
      day_of_week: index,
      is_open: true,
      open_time: '09:00:00',
      close_time: '22:00:00',
      is_24_hours: false
    }));
  }
}

export const venueService = new VenueService();