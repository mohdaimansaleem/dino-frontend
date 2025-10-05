// Re-export all API types
export * from '../utils/api';

// Re-export specific types from api.ts for compatibility
export type { UserProfile } from './api';

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
  address: string;
  phone: string;
  email: string;
  ownerId: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy Cafe type (alias for Venue for backward compatibility)
export interface Cafe extends Venue {}
export type LegacyCafe = Cafe;

// Menu Types
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
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
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

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  variantName?: string;
  quantity: number;
  price: number;
  totalPrice?: number;
  specialInstructions?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'delivered'
  | 'served' 
  | 'cancelled';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded';

// Analytics Types
export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  popularItems: PopularItem[];
  revenueByDay: RevenueData[];
  ordersByStatus: StatusData[];
}

export interface PopularItem {
  menuItemId: string;
  menuItemName: string;
  orderCount: number;
  revenue: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusData {
  status: OrderStatus;
  count: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Filter Types
export interface MenuFilters {
  category?: string;
  isVeg?: boolean;
  priceRange?: {
    min: number;
    max: number;
  };
  searchQuery?: string;
}

// Notification types are now imported from api.ts

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