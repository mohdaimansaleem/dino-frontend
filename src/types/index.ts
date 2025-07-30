// Re-export API types for compatibility
export type {
  // Core API types
  ApiResponse as ApiResponseType,
  PaginatedResponse as PaginatedResponseType,
  
  // Authentication types
  AuthToken as ApiAuthToken,
  UserProfile as ApiUserProfile,
  UserRegistration as ApiUserRegistration,
  WorkspaceRegistration,
  
  // Workspace types
  Workspace,
  WorkspaceCreate,
  WorkspaceUpdate,
  WorkspaceStatistics,
  
  // Venue types
  Venue,
  VenueCreate,
  VenueUpdate,
  VenueAnalytics,
  VenueStatus,
  VenueLocation,
  OperatingHours,
  
  // Menu types
  MenuCategory as ApiMenuCategory,
  MenuItem as ApiMenuItem,
  MenuCategoryCreate as ApiMenuCategoryCreate,
  MenuItemCreate as ApiMenuItemCreate,
  MenuItemUpdate as ApiMenuItemUpdate,
  
  // Table types
  Table as ApiTable,
  TableCreate,
  TableUpdate,
  TableQRCode,
  QRCodeVerification,
  TableStatus,
  
  // Order types
  Order as ApiOrder,
  OrderCreate as ApiOrderCreate,
  OrderUpdate as ApiOrderUpdate,
  OrderItem as ApiOrderItem,
  OrderItemCreate as ApiOrderItemCreate,
  PublicOrderCreate,
  CustomerCreate,
  OrderValidation,
  OrderReceipt,
  OrderStatus as ApiOrderStatus,
  PaymentStatus as ApiPaymentStatus,
  PaymentMethod as ApiPaymentMethod,
  OrderType,
  
  // Dashboard types
  DashboardData,
  SuperAdminDashboard,
  AdminDashboard,
  OperatorDashboard,
  LiveOrderData,
  VenueAnalyticsData,
  
  // User types
  User as ApiUser,
  UserCreate as ApiUserCreate,
  UserUpdate as ApiUserUpdate,
  UserRole as ApiUserRole,
  
  // Validation types
  ValidationResponse,
  WorkspaceValidation,
  
  // Filter types
  PaginationParams as ApiPaginationParams,
  VenueFilters as ApiVenueFilters,
  MenuFilters as ApiMenuFilters,
  OrderFilters,
  TableFilters,
  UserFilters,
  
  // Error types
  ApiError,
  ErrorCode
} from './api';

// Legacy User and Authentication Types (for backward compatibility)
export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  name?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  role: UserRole;
  permissions: Permission[];
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
  workspace_id?: string; // Add for compatibility
  cafeId?: string;
  venue_id?: string; // Add for compatibility
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

export interface UserRegistration {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  role?: 'customer' | 'admin' | 'cafe_owner' | 'staff';
  addresses?: UserAddress[];
  preferences?: UserPreferences;
  termsAccepted: boolean;
  marketingConsent: boolean;
}

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

export type UserRole = 'customer' | 'admin' | 'cafe_owner' | 'staff' | 'superadmin' | 'operator';
export type UserRoleName = UserRole;

// Additional User Types
export interface User extends UserProfile {}

export interface UserCreate extends UserRegistration {}

export interface Token extends AuthToken {}

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

// Cafe Types
export interface Cafe {
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
  cafeId: string;
  order: number; // for drag-drop ordering
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  cafeId: string;
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
  cafeId: string;
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
  cafeId: string;
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
  cafeId: string;
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
  cafeId: string;
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

// Enhanced Notification Types
export interface AppNotification {
  id: string;
  recipientId: string;
  recipientType: 'user' | 'cafe' | 'admin';
  notificationType: NotificationTypeEnum;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  readAt?: Date;
}

export type NotificationTypeEnum = 
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

// Context Types
export interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserRegistration) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
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