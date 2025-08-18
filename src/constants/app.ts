// API Configuration (imported from centralized config)
import { API_CONFIG as CENTRALIZED_API_CONFIG } from '../config/api';

// Application Configuration
export const APP_CONFIG = {
  NAME: 'Dino',
  VERSION: '1.0.0',
  DESCRIPTION: 'Revolutionizing restaurant ordering',
  COPYRIGHT: '© 2025 Dino. All rights reserved.',
  COMPANY: 'Dino',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'dino_token',
  USER: 'dino_user',
  REFRESH_TOKEN: 'dino_refresh_token',
  CART: 'dino_cart',
  PREFERENCES: 'dino_preferences',
  PERMISSIONS: 'dino_permissions',
} as const;

export const API_CONFIG = {
  BASE_URL: CENTRALIZED_API_CONFIG.BASE_URL,
  TIMEOUT: CENTRALIZED_API_CONFIG.TIMEOUT,
  RETRY_ATTEMPTS: CENTRALIZED_API_CONFIG.RETRY_ATTEMPTS,
  RETRY_DELAY: CENTRALIZED_API_CONFIG.RETRY_DELAY,
} as const;



// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ADMIN: '/admin',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_MENU: '/admin/menu',
  ADMIN_TABLES: '/admin/tables',
  ADMIN_SETTINGS: '/admin/settings',
  MENU: '/menu/:venueId/:tableId',
  CHECKOUT: '/checkout/:venueId/:tableId',
  ORDER_TRACKING: '/order-tracking/:orderId',
} as const;



// Default Values
export const DEFAULTS = {
  VENUE_ID: 'dino-venue-1',
  VENUE_NAME: 'Dino Venue',
  TABLE_ID: 'dt-001',
  CURRENCY: 'INR',
  LANGUAGE: 'en',
  TIMEZONE: 'Asia/Kolkata',
  COUNTRY: 'IN',
  REGION: 'India',
  ITEMS_PER_PAGE: 10,
  MAX_CART_ITEMS: 50,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;



// Feature Flags
export const FEATURES = {
  QR_CODE_GENERATION: true,
  REAL_TIME_UPDATES: true,
  ANALYTICS: true,
  NOTIFICATIONS: true,
  MULTI_LANGUAGE: false,
  DARK_MODE: false,
} as const;



// Business Rules (Indian Market)
export const BUSINESS_RULES = {
  MIN_ORDER_VALUE: 150, // INR
  FREE_DELIVERY_THRESHOLD: 500, // INR
  DELIVERY_FEE: 40, // INR
  TAX_RATE: 0.18, // 18% GST (Indian Standard)
  SERVICE_CHARGE_RATE: 0.10, // 10%
  MAX_DISCOUNT_PERCENTAGE: 50,
  ORDER_CANCELLATION_TIME: 5 * 60 * 1000, // 5 minutes
  CURRENCY_SYMBOL: '₹',
  CURRENCY_CODE: 'INR',
  PHONE_COUNTRY_CODE: '+91',
} as const;



// Time Formats
export const TIME_FORMATS = {
  DATE: 'DD/MM/YYYY',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIMESTAMP: 'DD/MM/YYYY HH:mm:ss',
} as const;



// Validation Rules (Indian Context)
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+91|91)?[6-9]\d{9}$/, // Indian mobile number format
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  PRICE_MIN: 10, // INR
  PRICE_MAX: 50000, // INR
  QUANTITY_MIN: 1,
  QUANTITY_MAX: 10,
  PIN_CODE_REGEX: /^[1-9][0-9]{5}$/, // Indian PIN code
  GST_REGEX: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, // GST number
} as const;

// ===================================================================
// UI CONFIGURATION & STYLING CONSTANTS
// ===================================================================

// Professional UI Layout Constants
export const UI_LAYOUT = {
  HEADER_HEIGHT: 64,
  SIDEBAR_WIDTH: 240,
  CONTAINER_MAX_WIDTH: 'xl' as const,
  CARD_BORDER_RADIUS: 12,
  BUTTON_BORDER_RADIUS: 8,
  INPUT_BORDER_RADIUS: 8,
  CHIP_BORDER_RADIUS: 6,
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
    XXXL: 64,
  },
  SHADOWS: {
    SUBTLE: '0 1px 3px rgba(0, 0, 0, 0.08)',
    SOFT: '0 2px 8px rgba(0, 0, 0, 0.1)',
    MEDIUM: '0 4px 16px rgba(0, 0, 0, 0.12)',
    STRONG: '0 8px 24px rgba(0, 0, 0, 0.15)',
    INTENSE: '0 12px 32px rgba(0, 0, 0, 0.18)',
  },
} as const;

// Breakpoints
export const BREAKPOINTS = {
  XS: 'xs' as const,
  SM: 'sm' as const,
  MD: 'md' as const,
  LG: 'lg' as const,
  XL: 'xl' as const,
} as const;

// Professional Animation Durations (in milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 200,
  SMOOTH: 300,
  SLOW: 500,
  CHART_REFRESH: 10000, // 10 seconds
  LOADING_DELAY: 800,
  NAVIGATION_DELAY: 100,
  HOVER: 200,
  FOCUS: 150,
  EASING: {
    STANDARD: 'cubic-bezier(0.4, 0, 0.2, 1)',
    PROFESSIONAL: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    ENTER: 'cubic-bezier(0.0, 0, 0.2, 1)',
    EXIT: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DRAWER: 1200,
  APP_BAR: 1100,
  MODAL: 1300,
  SNACKBAR: 1400,
  TOOLTIP: 1500,
  FLOATING_BUTTON: 1000,
  STICKY_CART: 1000,
} as const;

// Grid Sizes
export const GRID_SIZES = {
  FULL: 12,
  HALF: 6,
  THIRD: 4,
  QUARTER: 3,
  TWO_THIRDS: 8,
  THREE_QUARTERS: 9,
} as const;

// Icon Sizes
export const ICON_SIZES = {
  SMALL: 16,
  MEDIUM: 20,
  LARGE: 24,
  XLARGE: 32,
  XXLARGE: 40,
  XXXLARGE: 48,
  HERO: 64,
  MASSIVE: 80,
} as const;

// Common Dimensions
export const DIMENSIONS = {
  AVATAR: {
    SMALL: { width: 32, height: 32 },
    MEDIUM: { width: 48, height: 48 },
    LARGE: { width: 60, height: 60 },
  },
  CARD_IMAGE: {
    SMALL: { width: 80, height: 80 },
    MEDIUM: { width: 120, height: 120 },
    LARGE: { width: 200, height: 200 },
  },
  BUTTON_HEIGHT: {
    SMALL: 32,
    MEDIUM: 36,
    LARGE: 42,
  },
} as const;

// Typography
export const TYPOGRAPHY = {
  FONT_WEIGHTS: {
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    BOLD: 600,
    EXTRA_BOLD: 700,
  },
  LINE_HEIGHTS: {
    TIGHT: 1.2,
    NORMAL: 1.4,
    RELAXED: 1.6,
  },
} as const;

// ===================================================================
// COLOR CONSTANTS
// ===================================================================

// Professional Brand Colors
export const BRAND_COLORS = {
  PRIMARY: '#1565c0', // Professional blue
  SECONDARY: '#c62828', // Professional red
  SUCCESS: '#2e7d32', // Professional green
  WARNING: '#f57c00', // Professional orange
  ERROR: '#d32f2f', // Professional red
  INFO: '#0288d1', // Professional cyan
} as const;

// Status Colors
export const STATUS_COLORS = {
  AVAILABLE: '#4CAF50',
  OCCUPIED: '#F44336',
  RESERVED: '#FF9800',
  MAINTENANCE: '#9E9E9E',
  ACTIVE: '#2196F3',
  INACTIVE: '#757575',
} as const;

// Professional Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#1565c0',
  SECONDARY: '#1976d2',
  TERTIARY: '#42a5f5',
  QUATERNARY: '#64b5f6',
  GRADIENT_START: '#1565c0',
  GRADIENT_END: '#1976d2',
} as const;

// Background Colors
export const BACKGROUND_COLORS = {
  LIGHT_GREY: 'grey.50',
  MEDIUM_GREY: 'grey.100',
  DARK_GREY: 'grey.200',
  PRIMARY_LIGHT: 'primary.50',
  SUCCESS_LIGHT: 'success.50',
  WARNING_LIGHT: 'warning.50',
  ERROR_LIGHT: 'error.50',
  INFO_LIGHT: 'info.50',
} as const;

// Text Colors
export const TEXT_COLORS = {
  PRIMARY: 'text.primary',
  SECONDARY: 'text.secondary',
  DISABLED: 'text.disabled',
  WHITE: 'white',
  SUCCESS: 'success.main',
  WARNING: 'warning.main',
  ERROR: 'error.main',
  INFO: 'info.main',
} as const;

// Border Colors
export const BORDER_COLORS = {
  DIVIDER: 'divider',
  PRIMARY: 'primary.main',
  SUCCESS: 'success.main',
  WARNING: 'warning.main',
  ERROR: 'error.main',
  LIGHT: 'grey.300',
} as const;

// Veg/Non-Veg Indicator Colors
export const FOOD_INDICATOR_COLORS = {
  VEG: '#4CAF50',
  NON_VEG: '#F44336',
} as const;

// Professional Gradient Definitions (Minimal Usage)
export const GRADIENTS = {
  HEADER: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
  CARD: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  BUTTON: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
  SUBTLE: 'linear-gradient(180deg, rgba(21, 101, 192, 0.02) 0%, rgba(21, 101, 192, 0.04) 100%)',
} as const;

// ===================================================================
// ORDER MANAGEMENT CONSTANTS
// ===================================================================

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Order Types
export const ORDER_TYPES = {
  DINE_IN: 'dine_in',
  TAKEAWAY: 'takeaway',
  DELIVERY: 'delivery',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  WALLET: 'wallet',
  NET_BANKING: 'net_banking',
} as const;

// Order Priority
export const ORDER_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Table Status
export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance',
  CLEANING: 'cleaning',
} as const;

// ===================================================================
// ROLE & PERMISSION CONSTANTS
// ===================================================================

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const;

// Permissions
export const PERMISSIONS = {
  // Order Management
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDERS: 'create_orders',
  UPDATE_ORDERS: 'update_orders',
  DELETE_ORDERS: 'delete_orders',
  CANCEL_ORDERS: 'cancel_orders',
  REFUND_ORDERS: 'refund_orders',
  
  // Menu Management
  VIEW_MENU: 'view_menu',
  CREATE_MENU_ITEMS: 'create_menu_items',
  UPDATE_MENU_ITEMS: 'update_menu_items',
  DELETE_MENU_ITEMS: 'delete_menu_items',
  MANAGE_CATEGORIES: 'manage_categories',
  
  // Table Management
  VIEW_TABLES: 'view_tables',
  CREATE_TABLES: 'create_tables',
  UPDATE_TABLES: 'update_tables',
  DELETE_TABLES: 'delete_tables',
  ASSIGN_TABLES: 'assign_tables',
  
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  UPDATE_USERS: 'update_users',
  DELETE_USERS: 'delete_users',
  MANAGE_PERMISSIONS: 'manage_permissions',
  
  // Analytics & Reports
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  VIEW_REPORTS: 'view_reports',
  
  // System Settings
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_VENUE: 'manage_venue',
  SYSTEM_ADMIN: 'system_admin',
} as const;

// Role Permissions Mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.UPDATE_ORDERS,
    PERMISSIONS.CANCEL_ORDERS,
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.CREATE_MENU_ITEMS,
    PERMISSIONS.UPDATE_MENU_ITEMS,
    PERMISSIONS.DELETE_MENU_ITEMS,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.VIEW_TABLES,
    PERMISSIONS.CREATE_TABLES,
    PERMISSIONS.UPDATE_TABLES,
    PERMISSIONS.DELETE_TABLES,
    PERMISSIONS.ASSIGN_TABLES,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.UPDATE_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.MANAGE_VENUE,
  ],
  [USER_ROLES.MANAGER]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.UPDATE_ORDERS,
    PERMISSIONS.CANCEL_ORDERS,
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.UPDATE_MENU_ITEMS,
    PERMISSIONS.VIEW_TABLES,
    PERMISSIONS.UPDATE_TABLES,
    PERMISSIONS.ASSIGN_TABLES,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [USER_ROLES.OPERATOR]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDERS,
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.VIEW_TABLES,
    PERMISSIONS.ASSIGN_TABLES,
  ],
  [USER_ROLES.STAFF]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDERS,
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.VIEW_TABLES,
  ],
  [USER_ROLES.CUSTOMER]: [
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.CREATE_ORDERS,
  ],
} as const;

