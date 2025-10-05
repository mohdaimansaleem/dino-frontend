/**
 * API Types for Dino Multi-Venue Platform
 * 
 * These types match the backend API response formats exactly
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  error_code?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// =============================================================================
// AUTHENTICATION & USER TYPES
// =============================================================================

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  // Legacy camelCase properties for compatibility
  firstName?: string;
  lastName?: string;
  role: UserRole;
  workspace_id?: string;
  venue_id?: string;
  // Legacy camelCase properties for compatibility
  workspaceId?: string;
  venueId?: string;
  is_active: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  created_at: string;
  updated_at?: string;
  createdAt?: Date;
  updatedAt?: Date;
  date_of_birth?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  // Additional legacy properties
  permissions?: any[];
  name?: string;
  profileImageUrl?: string;
  addresses?: any[];
  preferences?: any;
  lastLogin?: Date;
  loginCount?: number;
  totalOrders?: number;
  totalSpent?: number;
}

export interface UserRegistration {
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  role_id?: string;
  workspace_id: string;
  venue_id?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export interface WorkspaceRegistration {
  workspace_name: string;
  workspace_description?: string;
  venue_name: string;
  venue_description?: string;
  venue_location: VenueLocation;
  venue_phone?: string;
  venue_email?: string;

  price_range: PriceRange;
  venue_type?: string;
  owner_email: string;
  owner_phone?: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_password: string;
  confirm_password: string;
}

export type UserRole = 'superadmin' | 'admin' | 'operator' | 'customer';
export type PriceRange = 'budget' | 'mid_range' | 'premium' | 'luxury';

// =============================================================================
// WORKSPACE TYPES
// =============================================================================

export interface Workspace {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  business_type: string;
  owner_id: string;
  venue_ids: string[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface WorkspaceCreate {
  display_name: string;
  description?: string;
  business_type: string;
}

export interface WorkspaceUpdate {
  display_name?: string;
  description?: string;
  is_active?: boolean;
}

export interface WorkspaceStatistics {
  workspace_id: string;
  workspace_name: string;
  total_venues: number;
  active_venues: number;
  total_users: number;
  active_users: number;
  total_orders: number;
  total_menu_items: number;
  created_at: string;
  is_active: boolean;
}

// =============================================================================
// VENUE TYPES
// =============================================================================

export interface Venue {
  id: string;
  name: string;
  description?: string;
  location: VenueLocation;
  phone?: string;
  email?: string;

  cuisine_types: string[];
  price_range: PriceRange;
  rating?: number;
  total_reviews?: number;
  is_active: boolean;
  is_open: boolean; // Required for venue status
  status?: string;
  workspace_id: string;
  owner_id?: string; // Added for compatibility
  operating_hours?: OperatingHours[];
  subscription_status?: string;
  theme?: string; // Venue theme (e.g., 'pet', 'default')
  created_at: string;
  updated_at?: string;
  createdAt?: string; // Legacy compatibility
  updatedAt?: string; // Legacy compatibility
  // Legacy compatibility fields
  address?: string; // For backward compatibility
  ownerId?: string; // For backward compatibility
  workspaceId?: string; // For backward compatibility
  isActive?: boolean; // For backward compatibility
  isOpen?: boolean; // For backward compatibility
}

export interface VenueLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export interface OperatingHours {
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  is_open: boolean;
  open_time?: string; // HH:MM:SS format
  close_time?: string; // HH:MM:SS format
  is_24_hours: boolean;
  break_start?: string;
  break_end?: string;
}

export interface VenueCreate {
  name: string;
  description?: string;
  location: VenueLocation;
  phone?: string;
  email?: string;

  cuisine_types: string[];
  price_range: PriceRange;
  operating_hours?: OperatingHours[];
  workspace_id: string;
  is_open?: boolean; // Optional for creation, defaults to false
}

export interface VenueUpdate {
  name?: string;
  description?: string;
  location?: Partial<VenueLocation>;
  phone?: string;
  email?: string;

  cuisine_types?: string[];
  price_range?: PriceRange;
  is_active?: boolean;
  is_open?: boolean;
  status?: string;
  theme?: string;
}

export interface VenueAnalytics {
  venue_id: string;
  total_menu_items: number;
  total_tables: number;
  recent_orders: number;
  total_customers: number;
  rating: number;
  total_reviews: number;
  subscription_status: string;
  is_active: boolean;
}

export interface VenueStatus {
  venue_id: string;
  is_open: boolean;
  current_status: string;
  next_opening?: string;
  next_closing?: string;
  break_time?: {
    start: string;
    end: string;
  };
  message?: string;
}

export interface WorkspaceVenue {
  id: string;
  name: string;
  description?: string;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
  };
  phone?: string;
  email?: string;
  is_active: boolean;
  is_open: boolean;
  status: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// MENU TYPES
// =============================================================================

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  venue_id: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  category_id: string;
  venue_id: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  spice_level?: 'mild' | 'medium' | 'hot' | 'extra_hot';
  preparation_time_minutes?: number;
  nutritional_info?: Record<string, any>;
  image_urls?: string[];
  is_available: boolean;
  created_at: string;
  updated_at?: string;
}

export interface MenuCategoryCreate {
  name: string;
  description?: string;
  venue_id: string;
}

export interface MenuCategoryUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface MenuItemCreate {
  name: string;
  description?: string;
  base_price: number;
  category_id: string;
  venue_id: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  spice_level?: 'mild' | 'medium' | 'hot' | 'extra_hot';
  preparation_time_minutes?: number;
  nutritional_info?: Record<string, any>;
}

export interface MenuItemUpdate {
  name?: string;
  description?: string;
  base_price?: number;
  category_id?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  spice_level?: 'mild' | 'medium' | 'hot' | 'extra_hot';
  preparation_time_minutes?: number;
  nutritional_info?: Record<string, any>;
  is_available?: boolean;
}

// =============================================================================
// TABLE TYPES
// =============================================================================

export interface Table {
  id: string;
  table_number: string;
  capacity: number;
  location?: string;
  venue_id: string;
  qr_code: string;
  table_status: TableStatus;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export type TableStatus = 'available' | 'reserved' | 'occupied' | 'maintenance' | 'out_of_service';

export interface TableCreate {
  table_number: string;
  capacity: number;
  location?: string;
  venue_id: string;
}

export interface TableUpdate {
  table_number?: string;
  capacity?: number;
  location?: string;
  table_status?: TableStatus;
  is_active?: boolean;
}

export interface TableQRCode {
  table_id: string;
  qr_code: string;
  qr_code_url?: string;
  venue_id: string;
  table_number: string;
}

export interface QRCodeVerification {
  table_id: string;
  venue_id: string;
  table_number: string;
  is_valid: boolean;
}

// =============================================================================
// ORDER TYPES
// =============================================================================

export interface Order {
  id: string;
  order_number: string;
  venue_id: string;
  table_id?: string;
  customer_id?: string;
  order_type: OrderType;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  special_instructions?: string;
  estimated_ready_time?: string;
  actual_ready_time?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  menu_item_id: string;
  menu_item_name: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery' | 'qr_scan' | 'walk_in' | 'online' | 'phone';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'served' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet' | 'net_banking';

export interface OrderCreate {
  venue_id: string;
  customer_id?: string;
  order_type: OrderType;
  table_id?: string;
  items: OrderItemCreate[];
  special_instructions?: string;
}

export interface OrderItemCreate {
  menu_item_id: string;
  quantity: number;
  special_instructions?: string;
}

export interface PublicOrderCreate {
  venue_id: string;
  table_id?: string;
  customer: CustomerCreate;
  items: OrderItemCreate[];
  order_type: OrderType;
  special_instructions?: string;
  estimated_guests?: number;
}

export interface CustomerCreate {
  name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  preferences?: Record<string, any>;
  dietary_restrictions?: string[];
  marketing_consent?: boolean;
}

export interface OrderUpdate {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  estimated_ready_time?: string;
  special_instructions?: string;
}

export interface OrderValidation {
  is_valid: boolean;
  venue_open: boolean;
  items_available: string[];
  items_unavailable: string[];
  estimated_total: number;
  estimated_preparation_time?: number;
  message?: string;
  errors: string[];
}

export interface OrderReceipt {
  order_id: string;
  order_number: string;
  venue: {
    name: string;
    address: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  order_date: string;
  table_number?: string;
}

// =============================================================================
// DASHBOARD & ANALYTICS TYPES
// =============================================================================

export interface DashboardData {
  user_role: UserRole;
  workspace_id: string;
  venue_id?: string;
  summary: DashboardSummary;
  [key: string]: any; // Additional role-specific data
}

export interface DashboardSummary {
  [key: string]: number | string;
}

export interface SuperAdminDashboard extends DashboardData {
  summary: {
    total_venues: number;
    active_venues: number;
    total_orders: number;
    total_revenue: number;
  };
  all_venues: Venue[];
  workspace_analytics: any;
  user_management: any;
  alerts: any[];
  quick_actions: any[];
}

export interface AdminDashboard extends DashboardData {
  summary: {
    today_orders: number;
    today_revenue: number;
    active_tables: number;
    occupied_tables: number;
  };
  venue_analytics: any;
  staff_performance: any;
  inventory_alerts: any[];
}

export interface OperatorDashboard extends DashboardData {
  summary: {
    active_orders: number;
    pending_orders: number;
    ready_orders: number;
    occupied_tables: number;
  };
  active_orders: Order[];
  table_status: Table[];
  today_summary: any;
}

export interface LiveOrderData {
  venue_id: string;
  timestamp: string;
  summary: {
    total_active_orders: number;
    pending_orders: number;
    preparing_orders: number;
    ready_orders: number;
  };
  orders_by_status: Record<string, Order[]>;
}

export interface VenueAnalyticsData {
  venue_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  status_breakdown: Record<OrderStatus, number>;
  payment_breakdown: Record<PaymentStatus, number>;
}

// =============================================================================
// USER MANAGEMENT TYPES
// =============================================================================

export interface User {
  id: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  workspace_id: string;
  venue_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface VenueUser {
  id: string;
  email: string;
  phone?: string;
  user_name: string; // Combined first_name + last_name
  first_name: string;
  last_name: string;
  role: UserRole;
  role_display_name: string; // Human readable role name
  last_logged_in?: string; // ISO date string
  status: 'active' | 'inactive'; // User status
  is_active: boolean;
  venue_id: string;
  workspace_id: string;
  created_at: string;
  updated_at?: string;
}

export interface UserCreate {
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  role_id?: string;
  workspace_id: string;
  venue_id?: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  is_active?: boolean;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export interface ValidationResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WorkspaceValidation {
  workspace_name: string;
  owner_email: string;
}

// =============================================================================
// PUBLIC ORDERING TYPES
// =============================================================================

export interface PublicMenuData {
  venue: Venue;
  table: Table;
  categories: MenuCategory[];
  items: MenuItem[];
}

// =============================================================================
// FILTER & QUERY TYPES
// =============================================================================

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface VenueFilters extends PaginationParams {
  search?: string;
  cuisine_type?: string;
  price_range?: PriceRange;
  subscription_status?: string;
  is_active?: boolean;
}

export interface MenuFilters extends PaginationParams {
  venue_id?: string;
  category_id?: string;
  is_available?: boolean;
  is_vegetarian?: boolean;
  spice_level?: string;
}

export interface OrderFilters extends PaginationParams {
  venue_id?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  order_type?: OrderType;
}

export interface TableFilters extends PaginationParams {
  venue_id?: string;
  table_status?: TableStatus;
  is_active?: boolean;
}

export interface UserFilters extends PaginationParams {
  workspace_id?: string;
  venue_id?: string;
  role?: UserRole;
  is_active?: boolean;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ApiError {
  success: false;
  error: string;
  error_code: string;
  details?: {
    field?: string;
    message?: string;
  };
  timestamp: string;
}

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  VENUE_CLOSED: 'VENUE_CLOSED',
  ITEM_UNAVAILABLE: 'ITEM_UNAVAILABLE',
  INVALID_QR_CODE: 'INVALID_QR_CODE',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export interface AppNotification {
  id: string;
  recipient_id: string;
  recipient_type: 'user' | 'venue' | 'admin';
  notification_type: NotificationTypeEnum;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  read_at?: string;
  // Legacy camelCase properties for compatibility
  recipientId?: string;
  recipientType?: 'user' | 'venue' | 'admin';
  notificationType?: NotificationTypeEnum;
  isRead?: boolean;
  createdAt?: Date;
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