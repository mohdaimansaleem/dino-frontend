// Re-export all API types
export * from './api';

export interface UserAddress {
  id?: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
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

// UserRegistration is now imported from api.ts

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRoleObject {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export type UserRole = 'customer' | 'admin' | 'venue_owner' | 'staff' | 'superadmin' | 'operator';
export type UserRoleName = UserRole;

// Additional User Types - using API types as primary
// User and UserCreate are now imported from api.ts

// AuthToken is now imported from api.ts

// Legacy Venue Types (deprecated - use Venue from api.ts)
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

// Legacy Cafe type (alias for Venue for backward compatibility)
export interface Cafe extends Venue {}
export type LegacyCafe = Cafe;

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
  price: number;
  category: string;
  isVeg: boolean;
  image?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  ingredients?: string[];
  allergens?: string[];
  venueId: string;
  order: number; // for drag-drop ordering
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  venueId: string;
}

export interface MenuItemCreate {
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  image?: string;
  isAvailable?: boolean;
  preparationTime: number;
  ingredients?: string[];
  allergens?: string[];
  venueId: string;
}

export interface MenuItemUpdate {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  isVeg?: boolean;
  image?: string;
  isAvailable?: boolean;
  preparationTime?: number;
  ingredients?: string[];
  allergens?: string[];
}

export interface MenuCategoryCreate {
  name: string;
  description?: string;
  order: number;
  venueId: string;
}

export interface MenuCategoryUpdate {
  name?: string;
  description?: string;
  order?: number;
}

// Table Types
export interface Table {
  id: string;
  tableNumber: number;
  qrCode: string;
  qrCodeUrl: string;
  venueId: string;
  venueName?: string;
  isActive: boolean;
  createdAt: Date;
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
  orderNumber?: string;
  venueId: string;
  tableId: string;
  customerId?: string;
  customerPhone?: string;
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  specialInstructions?: string;
  estimatedTime: number;
  createdAt: Date;
  updatedAt: Date;
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
  recipientId: string;
  recipientType: 'user' | 'venue' | 'admin';
  notificationType: NotificationTypeEnum;
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

export type NotificationType = NotificationTypeEnum;

// Enhanced Transaction Types
export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  transactionType: 'payment' | 'refund' | 'adjustment';
  paymentMethod: PaymentMethod;
  paymentGateway?: string;
  gatewayTransactionId?: string;
  status: PaymentStatus;
  description?: string;
  createdAt: Date;
  processedAt?: Date;
  refundedAmount: number;
}

export type PaymentMethod = 
  | 'cash'
  | 'card'
  | 'upi'
  | 'wallet'
  | 'net_banking';

// Context Types - AuthContextType is defined in AuthContext.tsx

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