import { apiService } from './api';
import { ApiResponse } from '../types';

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  venue_id: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  base_price: number;
  venue_id: string;
  category_id: string;
  image_urls: string[];
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  spice_level: 'mild' | 'medium' | 'hot' | 'very_hot';
  preparation_time_minutes: number;
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  is_available: boolean;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategoryCreate {
  name: string;
  description: string;
  venue_id: string;
  image_url?: string;
}

export interface MenuItemCreate {
  name: string;
  description: string;
  base_price: number;
  venue_id: string;
  category_id: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  spice_level?: 'mild' | 'medium' | 'hot' | 'very_hot';
  preparation_time_minutes?: number;
  nutritional_info?: object;
}

class MenuService {
  // Categories
  async getCategories(venueId?: string): Promise<MenuCategory[]> {
    try {
      const params = venueId ? { venue_id: venueId } : {};
      const response = await apiService.get<MenuCategory[]>('/menu/categories', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch categories');
      }
    } catch (error: any) {
      console.error('Get categories error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch categories');
    }
  }

  async getVenueCategories(venueId: string): Promise<MenuCategory[]> {
    try {
      const response = await apiService.get<MenuCategory[]>(`/menu/venues/${venueId}/categories`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch venue categories');
      }
    } catch (error: any) {
      console.error('Get venue categories error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch venue categories');
    }
  }

  async createCategory(categoryData: MenuCategoryCreate): Promise<MenuCategory> {
    try {
      const response = await apiService.post<MenuCategory>('/menu/categories', categoryData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create category');
      }
    } catch (error: any) {
      console.error('Create category error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create category');
    }
  }

  async updateCategory(categoryId: string, categoryData: Partial<MenuCategoryCreate>): Promise<MenuCategory> {
    try {
      const response = await apiService.put<MenuCategory>(`/menu/categories/${categoryId}`, categoryData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update category');
      }
    } catch (error: any) {
      console.error('Update category error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update category');
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/menu/categories/${categoryId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete category');
      }
    } catch (error: any) {
      console.error('Delete category error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete category');
    }
  }

  // Menu Items
  async getMenuItems(venueId?: string, categoryId?: string): Promise<MenuItem[]> {
    try {
      const params: any = {};
      if (venueId) params.venue_id = venueId;
      if (categoryId) params.category_id = categoryId;
      
      const response = await apiService.get<MenuItem[]>('/menu/items', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch menu items');
      }
    } catch (error: any) {
      console.error('Get menu items error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch menu items');
    }
  }

  async getVenueMenuItems(venueId: string, categoryId?: string): Promise<MenuItem[]> {
    try {
      const params = categoryId ? { category_id: categoryId } : {};
      const response = await apiService.get<MenuItem[]>(`/menu/venues/${venueId}/items`, params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch venue menu items');
      }
    } catch (error: any) {
      console.error('Get venue menu items error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch venue menu items');
    }
  }

  async getMenuItem(itemId: string): Promise<MenuItem> {
    try {
      const response = await apiService.get<MenuItem>(`/menu/items/${itemId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch menu item');
      }
    } catch (error: any) {
      console.error('Get menu item error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch menu item');
    }
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

  async updateMenuItem(itemId: string, itemData: Partial<MenuItemCreate>): Promise<MenuItem> {
    try {
      const response = await apiService.put<MenuItem>(`/menu/items/${itemId}`, itemData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update menu item');
      }
    } catch (error: any) {
      console.error('Update menu item error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update menu item');
    }
  }

  async deleteMenuItem(itemId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/menu/items/${itemId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete menu item');
      }
    } catch (error: any) {
      console.error('Delete menu item error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete menu item');
    }
  }

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
}

export const menuService = new MenuService();