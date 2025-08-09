import { apiService } from './api';
import { 
  MenuItem, 
  MenuCategory, 
  MenuItemCreate, 
  MenuItemUpdate,
  MenuCategoryCreate,
  MenuCategoryUpdate,
  ApiResponse,
  PaginatedResponse,
  MenuFilters
} from '../types/api';

class MenuService {
  // Menu Categories
  async getMenuCategories(filters?: MenuFilters): Promise<PaginatedResponse<MenuCategory>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.venue_id) params.append('venue_id', filters.venue_id);
      if (filters?.is_available !== undefined) params.append('is_active', filters.is_available.toString());

      const response = await apiService.get<any>(`/menu/categories?${params.toString()}`);
      
      console.log('Raw API response for categories:', response);
      console.log('Response structure:', {
        hasSuccess: 'success' in response,
        hasData: 'data' in response,
        dataType: typeof response.data,
        isDataArray: Array.isArray(response.data),
        responseKeys: Object.keys(response),
        hasTotal: 'total' in response,
        hasPage: 'page' in response,
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
      });
      
      // Handle different response formats
      
      // Case 1: Response is the PaginatedResponse directly (most common case)
      if (response && response.success && Array.isArray(response.data) && 'total' in response && 'page' in response) {
        console.log('Case 1: Response is already paginated response');
        console.log('Categories found:', response.data.length);
        return response as PaginatedResponse<MenuCategory>;
      }
      
      // Case 2: API service wrapped the response - response.data contains the PaginatedResponse
      if (response && response.success && response.data && typeof response.data === 'object' && 'data' in response.data) {
        console.log('Case 2: Found paginated response in response.data');
        return response.data as PaginatedResponse<MenuCategory>;
      }
      
      // Case 3: Response.data is the array directly
      if (response && response.success && Array.isArray(response.data)) {
        console.log('Case 3: Response.data is array, creating paginated response');
        return {
          success: true,
          data: response.data,
          total: response.data.length,
          page: 1,
          page_size: response.data.length,
          total_pages: 1,
          has_next: false,
          has_prev: false
        };
      }
      
      console.log('No matching case, using fallback');
      // Fallback if no data
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
      console.error('Error fetching menu categories:', error);
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

  async getVenueCategories(venueId: string): Promise<MenuCategory[]> {
    try {
      // Try public endpoint first
      const response = await apiService.get<MenuCategory[]>(`/menu/public/venues/${venueId}/categories`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to load venue categories:', error);
      return [];
    }
  }

  async getMenuCategory(categoryId: string): Promise<MenuCategory | null> {
    try {
      const response = await apiService.get<MenuCategory>(`/menu/categories/${categoryId}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  async createMenuCategory(categoryData: MenuCategoryCreate): Promise<ApiResponse<MenuCategory>> {
    try {
      return await apiService.post<MenuCategory>('/menu/categories', categoryData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create category');
    }
  }

  async updateMenuCategory(categoryId: string, categoryData: Partial<MenuCategoryCreate>): Promise<ApiResponse<MenuCategory>> {
    try {
      return await apiService.put<MenuCategory>(`/menu/categories/${categoryId}`, categoryData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update category');
    }
  }

  async deleteMenuCategory(categoryId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/menu/categories/${categoryId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete category');
    }
  }

  // Menu Items
  async getMenuItems(filters?: MenuFilters): Promise<PaginatedResponse<MenuItem>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.venue_id) params.append('venue_id', filters.venue_id);
      if (filters?.category_id) params.append('category_id', filters.category_id);
      if (filters?.is_available !== undefined) params.append('is_available', filters.is_available.toString());
      if (filters?.is_vegetarian !== undefined) params.append('is_vegetarian', filters.is_vegetarian.toString());
      if (filters?.spice_level) params.append('spice_level', filters.spice_level);

      const response = await apiService.get<any>(`/menu/items?${params.toString()}`);
      
      console.log('Raw API response for menu items:', response);
      
      // Handle different response formats
      
      // Case 1: Response is the PaginatedResponse directly (most common case)
      if (response && response.success && Array.isArray(response.data) && 'total' in response && 'page' in response) {
        console.log('Case 1: Response is already paginated response');
        console.log('Menu items found:', response.data.length);
        return response as PaginatedResponse<MenuItem>;
      }
      
      // Case 2: API service wrapped the response - response.data contains the PaginatedResponse
      if (response && response.success && response.data && typeof response.data === 'object' && 'data' in response.data) {
        console.log('Case 2: Found paginated response in response.data');
        return response.data as PaginatedResponse<MenuItem>;
      }
      
      // Case 3: Response.data is the array directly
      if (response && response.success && Array.isArray(response.data)) {
        console.log('Case 3: Response.data is array, creating paginated response');
        return {
          success: true,
          data: response.data,
          total: response.data.length,
          page: 1,
          page_size: response.data.length,
          total_pages: 1,
          has_next: false,
          has_prev: false
        };
      }
      
      // Fallback if no data
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
      console.error('Error fetching menu items:', error);
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

  async getVenueMenuItems(venueId: string, categoryId?: string): Promise<MenuItem[]> {
    try {
      // Try public endpoint first
      const params = categoryId ? `?category_id=${categoryId}` : '';
      const response = await apiService.get<MenuItem[]>(`/menu/public/venues/${venueId}/items${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to load venue menu items:', error);
      return [];
    }
  }

  async getMenuItem(itemId: string): Promise<MenuItem | null> {
    try {
      const response = await apiService.get<MenuItem>(`/menu/items/${itemId}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  async createMenuItem(itemData: MenuItemCreate): Promise<ApiResponse<MenuItem>> {
    try {
      return await apiService.post<MenuItem>('/menu/items', itemData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create menu item');
    }
  }

  async updateMenuItem(itemId: string, itemData: MenuItemUpdate): Promise<ApiResponse<MenuItem>> {
    try {
      return await apiService.put<MenuItem>(`/menu/items/${itemId}`, itemData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update menu item');
    }
  }

  async deleteMenuItem(itemId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/menu/items/${itemId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete menu item');
    }
  }

  async searchMenuItems(venueId: string, query: string): Promise<MenuItem[]> {
    try {
      if (query.length < 2) return [];
      
      const response = await apiService.get<MenuItem[]>(`/menu/venues/${venueId}/search?q=${encodeURIComponent(query)}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  async uploadMenuItemImage(itemId: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ image_url: string }>> {
    try {
      return await apiService.uploadFile<{ image_url: string }>(
        `/menu/items/${itemId}/image`,
        file,
        onProgress
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to upload image');
    }
  }

  // Helper methods for filtering
  filterMenuItems(items: MenuItem[], filters: {
    searchQuery?: string;
    category_id?: string;
    is_vegetarian?: boolean;
    spice_level?: string;
    priceRange?: { min: number; max: number };
  }): MenuItem[] {
    let filteredItems = [...items];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category_id) {
      filteredItems = filteredItems.filter(item => item.category_id === filters.category_id);
    }

    // Vegetarian filter
    if (filters.is_vegetarian !== undefined) {
      filteredItems = filteredItems.filter(item => item.is_vegetarian === filters.is_vegetarian);
    }

    // Spice level filter
    if (filters.spice_level) {
      filteredItems = filteredItems.filter(item => item.spice_level === filters.spice_level);
    }

    // Price range filter
    if (filters.priceRange) {
      filteredItems = filteredItems.filter(item =>
        item.base_price >= filters.priceRange!.min && item.base_price <= filters.priceRange!.max
      );
    }

    return filteredItems;
  }

  // Group items by category
  groupItemsByCategory(items: MenuItem[], categories: MenuCategory[]): Record<string, { category: MenuCategory; items: MenuItem[] }> {
    const categoryMap = categories.reduce((map, cat) => {
      map[cat.id] = cat;
      return map;
    }, {} as Record<string, MenuCategory>);

    return items.reduce((groups, item) => {
      const categoryId = item.category_id || 'other';
      const category = categoryMap[categoryId] || { id: 'other', name: 'Other', venue_id: item.venue_id, is_active: true, created_at: '' };
      
      if (!groups[categoryId]) {
        groups[categoryId] = { category, items: [] };
      }
      groups[categoryId].items.push(item);
      return groups;
    }, {} as Record<string, { category: MenuCategory; items: MenuItem[] }>);
  }

  // Get price range from items
  getPriceRange(items: MenuItem[]): { min: number; max: number } {
    if (items.length === 0) {
      return { min: 0, max: 100 };
    }

    const prices = items.map(item => item.base_price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  async createMenuItem(itemData: MenuItemCreate): Promise<MenuItem> {
    try {
      const response = await apiService.post<MenuItem>('/menu/items', itemData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create menu item');
      }
    } catch (error: any) {
      console.error('Create menu item error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create menu item');
    }
  }

  // Check if item is available
  isItemAvailable(item: MenuItem): boolean {
    return item.is_available;
  }

  // Get estimated preparation time for multiple items
  getEstimatedTime(items: Array<{ menuItem: MenuItem; quantity: number }>): number {
    let maxTime = 0;
    
    items.forEach(({ menuItem, quantity }) => {
      const itemTime = (menuItem.preparation_time_minutes || 15) * Math.ceil(quantity / 2); // Parallel cooking
      maxTime = Math.max(maxTime, itemTime);
    });

  async searchMenuItems(venueId: string, query: string): Promise<MenuItem[]> {
    try {
      const response = await apiService.get<MenuItem[]>(`/menu/venues/${venueId}/search`, { q: query });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to search menu items');
      }
    } catch (error: any) {
      console.error('Search menu items error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to search menu items');
    }
  }

  async updateItemAvailability(itemId: string, isAvailable: boolean): Promise<void> {
    try {
      const response = await apiService.put(`/menu/items/${itemId}`, { is_available: isAvailable });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update item availability');
      }
    } catch (error: any) {
      console.error('Update item availability error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update item availability');
    }
  }

  async bulkUpdateAvailability(itemIds: string[], isAvailable: boolean): Promise<void> {
    try {
      const response = await apiService.post('/menu/items/bulk-update-availability', {
        item_ids: itemIds,
        is_available: isAvailable,
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to bulk update availability');
      }
    } catch (error: any) {
      console.error('Bulk update availability error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to bulk update availability');
    }
  }

  async uploadCategoryImage(categoryId: string, file: File): Promise<string> {
    try {
      const response = await apiService.uploadFile<{ image_url: string }>(
        `/menu/categories/${categoryId}/image`,
        file
      );
      
      if (response.success && response.data) {
        return response.data.image_url;
      } else {
        throw new Error(response.message || 'Failed to upload category image');
      }
    } catch (error: any) {
      console.error('Upload category image error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to upload category image');
    }
  }

  async uploadItemImages(itemId: string, files: File[]): Promise<string[]> {
    try {
      const response = await apiService.uploadFiles<{ image_urls: string[] }>(
        `/menu/items/${itemId}/images`,
        files
      );
      
      if (response.success && response.data) {
        return response.data.image_urls;
      } else {
        throw new Error(response.message || 'Failed to upload item images');
      }
    } catch (error: any) {
      console.error('Upload item images error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to upload item images');
    }
  }

  // Get spice level options
  getSpiceLevelOptions(): Array<{ value: string; label: string; emoji: string }> {
    return [
      { value: 'mild', label: 'Mild', emoji: '🌶️' },
      { value: 'medium', label: 'Medium', emoji: '🌶️🌶️' },
      { value: 'hot', label: 'Hot', emoji: '🌶️🌶️🌶️' },
      { value: 'extra_hot', label: 'Extra Hot', emoji: '🌶️🌶️🌶️🌶️' }
    ];
  }

  // Format spice level for display
  formatSpiceLevel(spiceLevel?: string): string {
    const levels = {
      mild: 'Mild 🌶️',
      medium: 'Medium 🌶️🌶️',
      hot: 'Hot 🌶️🌶️🌶️',
      extra_hot: 'Extra Hot 🌶️🌶️🌶️🌶️'
    };
    return levels[spiceLevel as keyof typeof levels] || 'Not specified';
  }

  // Validate menu item data
  validateMenuItemData(itemData: MenuItemCreate | MenuItemUpdate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if ('name' in itemData) {
      if (!itemData.name || itemData.name.trim().length < 2) {
        errors.push('Item name must be at least 2 characters long');
      }
      if (itemData.name && itemData.name.length > 100) {
        errors.push('Item name must be less than 100 characters');
      }
    }

    if ('base_price' in itemData) {
      if (!itemData.base_price || itemData.base_price <= 0) {
        errors.push('Price must be greater than 0');
      }
      if (itemData.base_price && itemData.base_price > 10000) {
        errors.push('Price must be less than 10,000');
      }
    }

    if ('preparation_time_minutes' in itemData && itemData.preparation_time_minutes) {
      if (itemData.preparation_time_minutes < 1 || itemData.preparation_time_minutes > 120) {
        errors.push('Preparation time must be between 1 and 120 minutes');
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

export const menuService = new MenuService();