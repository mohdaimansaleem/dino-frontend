// Core User and Authentication Types
export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  first_name: string; // Backend compatibility
  last_name: string;  // Backend compatibility
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  role: UserRole;
  profileImageUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  addresses?: UserAddress[];
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  loginCount?: number;
  totalOrders?: number;
  totalSpent?: number;
  workspaceId?: string;
  workspace_id?: string; // Backend compatibility
  venueId?: string;
  venue_id?: string; // Backend compatibility
}

export interface UserAddress {
  id?: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  spiceLevel: 'mild' | 'medium' | 'hot' | 'extra_hot';
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export type UserRole = 'customer' | 'admin' | 'cafe_owner' | 'staff' | 'superadmin' | 'operator';

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

// Venue Types
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

// Menu Types
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

// Table Types
export interface Table {
  id: string;
  table_number: string;
  venue_id: string;
  capacity: number;
  table_status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_order';
  qr_code: string;
  location: {
    section?: string;
    floor?: string;
    position?: string;
  };
  features: string[];
  current_order_id?: string;
  last_cleaned?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Order Types
export interface OrderItem {
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  customizations?: Record<string, any>;
}

export interface Order {
  id: string;
  order_number: string;
  venue_id: string;
  table_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  service_charge: number;
  discount_amount: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  special_instructions?: string;
  estimated_preparation_time?: number;
  created_at: string;
  updated_at: string;
}

// Cart Types (Frontend only)
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

// Workspace Types
export interface Workspace {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  subscription_plan: 'free' | 'basic' | 'premium' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'suspended' | 'cancelled';
  settings: {
    timezone: string;
    currency: string;
    language: string;
    date_format: string;
    max_venues: number;
    max_users: number;
  };
  billing_info?: {
    billing_email: string;
    billing_address: any;
    payment_method?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Analytics Types
export interface DashboardAnalytics {
  venue_id: string;
  period: string;
  revenue: {
    total: number;
    today: number;
    yesterday: number;
    this_week: number;
    this_month: number;
    growth_rate: number;
  };
  orders: {
    total: number;
    today: number;
    pending: number;
    completed: number;
    cancelled: number;
    average_order_value: number;
  };
  customers: {
    total: number;
    new_today: number;
    returning: number;
    satisfaction_rate: number;
  };
  popular_items: Array<{
    menu_item_id: string;
    menu_item_name: string;
    order_count: number;
    revenue: number;
    rating: number;
  }>;
  peak_hours: Array<{
    hour: number;
    order_count: number;
    revenue: number;
  }>;
  table_utilization: {
    total_tables: number;
    occupied: number;
    available: number;
    utilization_rate: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Notification Types
export interface AppNotification {
  id: string;
  recipient_id: string;
  recipient_type: 'user' | 'venue' | 'admin';
  notification_type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  read_at?: string;
}

export type NotificationType = 
  | 'order_placed'
  | 'order_confirmed' 
  | 'order_ready'
  | 'order_delivered'
  | 'payment_received'
  | 'system_alert';

// Context Types
export interface AuthContextType {
  user: UserProfile | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

// Filter Types
export interface MenuFilters {
  category?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  spice_level?: string;
  price_range?: {
    min: number;
    max: number;
  };
  search_query?: string;
}