import { useState, useEffect, useCallback } from 'react';
import { menuService } from '../services/business';
import { venueService } from '../services/business';
import { tableService } from '../services/business';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { canUserAccessVenue, debugVenueAssignment } from '../utils/venueUtils';
import { logger } from '../utils/logger';
import { Venue } from '../types/api';

export interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  calories?: number;
  spicyLevel?: number;
  isVeg?: boolean;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
  discount?: number;
  preparationTime: number;
  isAvailable: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  nutritionInfo?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  allergens?: string[];
  customizations?: string[];
}

export interface CategoryType {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  icon?: string;
  color?: string;
  image?: string;
  itemCount?: number;
}

interface UseMenuDataOptions {
  venueId?: string;
  tableId?: string;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseMenuDataResult {
  // Data
  menuItems: MenuItemType[];
  categories: CategoryType[];
  restaurant: Venue | null;
  tableName: string;
  
  // Loading states
  loading: boolean;
  menuLoading: boolean;
  categoriesLoading: boolean;
  restaurantLoading: boolean;
  
  // Error states
  error: string | null;
  venueNotAcceptingOrders: {
    show: boolean;
    venueName?: string;
    venueStatus?: string;
    message?: string;
  };
  
  // Actions
  refetch: () => Promise<void>;
  refreshMenu: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshRestaurant: () => Promise<void>;
}

export function useMenuData(options: UseMenuDataOptions = {}): UseMenuDataResult {
  const {
    venueId,
    tableId,
    enableAutoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const { user } = useAuth();
  const { userData } = useUserData();

  // Local state
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [restaurant, setRestaurant] = useState<Venue | null>(null);
  const [tableName, setTableName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [venueNotAcceptingOrders, setVenueNotAcceptingOrders] = useState<{
    show: boolean;
    venueName?: string;
    venueStatus?: string;
    message?: string;
  }>({ show: false });

  console.log('🔍 useMenuDataSimple called with:', { venueId, tableId, enableAutoRefresh });

  // Helper function to get category icon
  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('starter') || name.includes('appetizer')) return '🥗';
    if (name.includes('main') || name.includes('curry')) return '🍛';
    if (name.includes('dessert') || name.includes('sweet')) return '🍰';
    if (name.includes('drink') || name.includes('beverage')) return '🥤';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('burger')) return '🍔';
    if (name.includes('noodle') || name.includes('pasta')) return '🍜';
    if (name.includes('rice')) return '🍚';
    if (name.includes('bread') || name.includes('roti')) return '🍞';
    return '🍽️';
  };

  // Handle menu loading errors
  const handleMenuError = useCallback((err: any) => {
    let errorMessage = 'Unable to load menu items at this time.';
    
    if (err.response?.status === 404) {
      errorMessage = 'Menu not found for this restaurant. Please check if you scanned the correct QR code.';
    } else if (err.response?.status === 403) {
      errorMessage = 'You don\'t have permission to view this menu. Please contact the restaurant staff.';
    } else if (err.response?.status >= 500) {
      errorMessage = 'Our servers are experiencing issues. Please try again in a few minutes.';
    } else if (err.message?.includes('Network')) {
      errorMessage = 'Connection problem. Please check your internet connection and try again.';
    }
    
    setError(errorMessage);
  }, []);

  // Load restaurant data
  const loadRestaurant = useCallback(async () => {
    if (!venueId) return;
    
    console.log('🔍 Loading restaurant data for venueId:', venueId);
    setRestaurantLoading(true);
    
    try {
      const venueData = await venueService.getPublicVenue(venueId);
      console.log('🏪 Restaurant data loaded:', venueData);
      
      if (venueData) {
        setRestaurant(venueData);
        logger.info('Restaurant data loaded successfully', { venueName: venueData.name });
      } else {
        setError('Restaurant not found. Please check the QR code or link.');
      }
    } catch (err: any) {
      console.error('❌ Restaurant loading error:', err);
      logger.error('Failed to load restaurant data', { venueId, error: err });
      setError('Restaurant not found. Please check the QR code or link.');
    } finally {
      setRestaurantLoading(false);
    }
  }, [venueId]);

  // Load categories data
  const loadCategories = useCallback(async () => {
    if (!venueId) return;
    
    console.log('🔍 Loading categories data for venueId:', venueId, 'tableId:', tableId);
    setCategoriesLoading(true);
    
    try {
      const categoriesData = await menuService.getVenueCategories(venueId, tableId);
      console.log('📂 Categories data loaded:', categoriesData);
      
      const mappedCategories: CategoryType[] = categoriesData.map((cat: any, index: number) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        order: index + 1,
        active: cat.is_active,
        icon: getCategoryIcon(cat.name),
        itemCount: 0, // Will be calculated after menu items are loaded
      }));
      
      setCategories(mappedCategories);
      logger.info('Categories loaded successfully', { count: mappedCategories.length });
    } catch (err: any) {
      console.error('❌ Categories loading error:', err);
      logger.error('Failed to load categories', { venueId, error: err });
      
      // Handle specific error types
      if (err.type === 'venue_not_accepting_orders') {
        setVenueNotAcceptingOrders({
          show: true,
          venueName: err.venueName,
          message: err.message
        });
      } else {
        handleMenuError(err);
      }
    } finally {
      setCategoriesLoading(false);
    }
  }, [venueId, tableId, handleMenuError]);

  // Load menu items data
  const loadMenuItems = useCallback(async () => {
    if (!venueId) return;
    
    console.log('🔍 Loading menu items data for venueId:', venueId, 'tableId:', tableId);
    setMenuLoading(true);
    
    try {
      const menuData = await menuService.getVenueMenuItems(venueId, undefined, tableId);
      console.log('🍽️ Menu items data loaded:', menuData);
      
      const mappedMenuItems: MenuItemType[] = menuData.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.base_price,
        category: item.category_id, // This maps to the category ID
        image: item.image_urls?.[0] || '',
        isAvailable: item.is_available,
        preparationTime: item.preparation_time_minutes || 15,
        calories: item.calories || undefined,
        spicyLevel: item.spice_level === 'mild' ? 1 : item.spice_level === 'medium' ? 2 : item.spice_level === 'hot' ? 3 : 0,
        isVeg: item.is_vegetarian || false,
        rating: item.average_rating || undefined,
        reviewCount: item.rating_count || 0,
        isPopular: item.is_popular || false,
        isNew: item.is_new || false,
        isTrending: item.is_trending || false,
        originalPrice: item.original_price || undefined,
        discount: item.discount_percentage || undefined,
        nutritionInfo: item.nutrition_info ? {
          protein: item.nutrition_info.protein || undefined,
          carbs: item.nutrition_info.carbs || undefined,
          fat: item.nutrition_info.fat || undefined,
        } : undefined,
        allergens: item.allergens || [],
        customizations: item.customizations || [],
      }));
      
      setMenuItems(mappedMenuItems);
      
      // Update category item counts
      setCategories(prev => prev.map(category => ({
        ...category,
        itemCount: mappedMenuItems.filter(item => item.category === category.id).length,
      })));
      
      logger.info('Menu items loaded successfully', { count: mappedMenuItems.length });
    } catch (err: any) {
      console.error('❌ Menu items loading error:', err);
      logger.error('Failed to load menu items', { venueId, error: err });
      
      // Handle specific error types
      if (err.type === 'venue_not_accepting_orders') {
        setVenueNotAcceptingOrders({
          show: true,
          venueName: err.venueName,
          message: err.message
        });
      } else {
        handleMenuError(err);
      }
    } finally {
      setMenuLoading(false);
    }
  }, [venueId, tableId, handleMenuError]);

  // Load table information
  const loadTable = useCallback(async () => {
    if (!tableId) return;
    
    try {
      const tableData = await tableService.getTable(tableId);
      if (tableData) {
        setTableName(tableData.table_number || tableData.id);
      } else {
        setTableName(tableId);
      }
    } catch (tableError) {
      logger.warn('Failed to load table data', { tableId, error: tableError });
      setTableName(tableId);
    }
  }, [tableId]);

  // Load all data
  const loadAllData = useCallback(async () => {
    if (!venueId) return;
    
    setLoading(true);
    setError(null);
    setVenueNotAcceptingOrders({ show: false });
    
    try {
      await Promise.all([
        loadRestaurant(),
        loadCategories(),
        loadMenuItems(),
        loadTable(),
      ]);
    } catch (err) {
      console.error('Error loading menu data:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId, loadRestaurant, loadCategories, loadMenuItems, loadTable]);

  // Initial load
  useEffect(() => {
    if (venueId) {
      loadAllData();
    }
  }, [venueId, loadAllData]);

  // Validate venue access
  useEffect(() => {
    if (venueId && user && userData) {
      debugVenueAssignment(userData, user, 'useMenuDataSimple');
      
      if (!canUserAccessVenue(userData, user, venueId)) {
        logger.warn('User may not have access to this venue, but continuing with public access', {
          userId: user.id,
          venueId,
        });
      }
    }
  }, [venueId, user, userData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!enableAutoRefresh || !venueId) return;

    const interval = setInterval(() => {
      logger.debug('Auto-refreshing menu data');
      loadMenuItems();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enableAutoRefresh, venueId, refreshInterval, loadMenuItems]);

  // Update overall loading state
  useEffect(() => {
    const isLoading = restaurantLoading || categoriesLoading || menuLoading;
    console.log('🔍 Loading state update:', {
      restaurantLoading,
      categoriesLoading,
      menuLoading,
      combinedLoading: isLoading,
      venueId,
      tableId,
      hasRestaurant: !!restaurant,
      categoriesCount: categories.length,
      menuItemsCount: menuItems.length
    });
    setLoading(isLoading);
  }, [restaurantLoading, categoriesLoading, menuLoading, venueId, tableId, restaurant, categories.length, menuItems.length]);

  // Refetch functions
  const refetch = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const refreshMenu = useCallback(async () => {
    await loadMenuItems();
  }, [loadMenuItems]);

  const refreshCategories = useCallback(async () => {
    await loadCategories();
  }, [loadCategories]);

  const refreshRestaurant = useCallback(async () => {
    await loadRestaurant();
  }, [loadRestaurant]);

  return {
    // Data
    menuItems,
    categories,
    restaurant,
    tableName,
    
    // Loading states
    loading,
    menuLoading,
    categoriesLoading,
    restaurantLoading,
    
    // Error states
    error,
    venueNotAcceptingOrders,
    
    // Actions
    refetch,
    refreshMenu,
    refreshCategories,
    refreshRestaurant,
  };
}

export default useMenuData;