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

      const response = await apiService.get<PaginatedResponse<MenuCategory>>(`/menu/categories?${params.toString()}`);
      
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
      console.error('Failed to get menu categories:', error);
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
      const response = await apiService.get<MenuCategory[]>(`/menu/venues/${venueId}/categories`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get venue categories:', error);
      return [];
    }
  }

  async getMenuCategory(categoryId: string): Promise<MenuCategory | null> {
    try {
      const response = await apiService.get<MenuCategory>(`/menu/categories/${categoryId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get menu category:', error);
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

      const response = await apiService.get<PaginatedResponse<MenuItem>>(`/menu/items?${params.toString()}`);
      
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
      console.error('Failed to get menu items:', error);
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
      const params = categoryId ? `?category_id=${categoryId}` : '';
      const response = await apiService.get<MenuItem[]>(`/menu/venues/${venueId}/items${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get venue menu items:', error);
      return [];
    }
  }

  async getMenuItem(itemId: string): Promise<MenuItem | null> {
    try {
      const response = await apiService.get<MenuItem>(`/menu/items/${itemId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get menu item:', error);
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
      console.error('Failed to search menu items:', error);
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

  // Format price
  formatPrice(price: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
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

    return maxTime + 5; // Add 5 minutes for order processing
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