import { apiService } from './api';
import { 
  MenuItem, 
  MenuCategory, 
  MenuItemCreate, 
  MenuItemUpdate,
  MenuCategoryCreate,
  MenuCategoryUpdate,
  ApiResponse 
} from '../types';

class MenuService {
  // Menu Categories
  async getMenuCategories(cafeId: string): Promise<MenuCategory[]> {
    const response = await apiService.get<MenuCategory[]>(`/menu/categories/${cafeId}`);
    return response.data || [];
  }

  async createMenuCategory(categoryData: MenuCategoryCreate): Promise<ApiResponse<MenuCategory>> {
    return await apiService.post<MenuCategory>('/menu/categories', categoryData);
  }

  async updateMenuCategory(categoryId: string, categoryData: MenuCategoryUpdate): Promise<ApiResponse<MenuCategory>> {
    return await apiService.put<MenuCategory>(`/menu/categories/${categoryId}`, categoryData);
  }

  async deleteMenuCategory(categoryId: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/menu/categories/${categoryId}`);
  }

  // Menu Items
  async getMenuItems(cafeId: string, filters?: {
    category?: string;
    isVeg?: boolean;
    availableOnly?: boolean;
  }): Promise<MenuItem[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isVeg !== undefined) params.append('is_veg', filters.isVeg.toString());
    if (filters?.availableOnly !== undefined) params.append('available_only', filters.availableOnly.toString());

    const response = await apiService.get<MenuItem[]>(`/menu/items/${cafeId}?${params.toString()}`);
    return response.data || [];
  }

  async getMenuItem(itemId: string): Promise<MenuItem> {
    const response = await apiService.get<MenuItem>(`/menu/items/detail/${itemId}`);
    return response.data!;
  }

  async createMenuItem(itemData: MenuItemCreate): Promise<ApiResponse<MenuItem>> {
    return await apiService.post<MenuItem>('/menu/items', itemData);
  }

  async updateMenuItem(itemId: string, itemData: MenuItemUpdate): Promise<ApiResponse<MenuItem>> {
    return await apiService.put<MenuItem>(`/menu/items/${itemId}`, itemData);
  }

  async deleteMenuItem(itemId: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/menu/items/${itemId}`);
  }

  async uploadMenuItemImage(itemId: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ image_url: string }>> {
    return await apiService.uploadFile<{ image_url: string }>(
      `/menu/items/${itemId}/image`,
      file,
      onProgress
    );
  }

  async reorderMenuItems(cafeId: string, itemOrders: Array<{ id: string; order: number }>): Promise<ApiResponse<void>> {
    return await apiService.post<void>('/menu/items/reorder', {
      cafe_id: cafeId,
      item_orders: itemOrders,
    });
  }

  // Helper methods for filtering
  filterMenuItems(items: MenuItem[], filters: {
    searchQuery?: string;
    category?: string;
    isVeg?: boolean;
    priceRange?: { min: number; max: number };
  }): MenuItem[] {
    let filteredItems = [...items];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.ingredients?.some(ingredient => ingredient.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category) {
      filteredItems = filteredItems.filter(item => item.category === filters.category);
    }

    // Veg filter
    if (filters.isVeg !== undefined) {
      filteredItems = filteredItems.filter(item => item.isVeg === filters.isVeg);
    }

    // Price range filter
    if (filters.priceRange) {
      filteredItems = filteredItems.filter(item =>
        item.price >= filters.priceRange!.min && item.price <= filters.priceRange!.max
      );
    }

    return filteredItems;
  }

  // Group items by category
  groupItemsByCategory(items: MenuItem[]): Record<string, MenuItem[]> {
    return items.reduce((groups, item) => {
      const category = item.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as Record<string, MenuItem[]>);
  }

  // Get price range from items
  getPriceRange(items: MenuItem[]): { min: number; max: number } {
    if (items.length === 0) {
      return { min: 0, max: 100 };
    }

    const prices = items.map(item => item.price);
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
    return item.isAvailable;
  }

  // Get estimated preparation time for multiple items
  getEstimatedTime(items: Array<{ menuItem: MenuItem; quantity: number }>): number {
    let maxTime = 0;
    
    items.forEach(({ menuItem, quantity }) => {
      const itemTime = menuItem.preparationTime * quantity;
      maxTime = Math.max(maxTime, itemTime);
    });

    return maxTime + 5; // Add 5 minutes for order processing
  }
}

export const menuService = new MenuService();