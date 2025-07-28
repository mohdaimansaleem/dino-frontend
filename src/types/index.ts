// Enhanced User and Authentication Types
export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  name?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  role: 'customer' | 'admin' | 'cafe_owner' | 'staff';
  profileImageUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  addresses: UserAddress[];
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin?: Date;
  loginCount: number;
  totalOrders: number;
  totalSpent: number;
  workspaceId?: string;
  cafeId?: string;
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

export type UserRole = 'customer' | 'admin' | 'cafe_owner' | 'staff';

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