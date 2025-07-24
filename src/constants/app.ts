// Application Configuration
export const APP_CONFIG = {
  NAME: 'Dino E-Menu',
  VERSION: '1.0.0',
  DESCRIPTION: 'Revolutionizing restaurant ordering',
  COPYRIGHT: '© 2024 Dino E-Menu. All rights reserved.',
  COMPANY: 'Dino E-Menu',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'dino_token',
  USER: 'dino_user',
  REFRESH_TOKEN: 'dino_refresh_token',
  DEMO_MODE: 'dino_demo_mode',
  CART: 'dino_cart',
  PREFERENCES: 'dino_preferences',
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
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
  MENU: '/menu/:cafeId/:tableId',
  CHECKOUT: '/checkout/:cafeId/:tableId',
  ORDER_TRACKING: '/order-tracking/:orderId',
} as const;

// Default Values
export const DEFAULTS = {
  CAFE_ID: 'dino-cafe-1',
  TABLE_ID: 'dt-001',
  CURRENCY: 'INR',
  LANGUAGE: 'en',
  TIMEZONE: 'Asia/Kolkata',
  ITEMS_PER_PAGE: 10,
  MAX_CART_ITEMS: 50,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

// Feature Flags
export const FEATURES = {
  DEMO_MODE: true,
  QR_CODE_GENERATION: true,
  REAL_TIME_UPDATES: true,
  ANALYTICS: true,
  NOTIFICATIONS: true,
  MULTI_LANGUAGE: false,
  DARK_MODE: false,
} as const;

// Business Rules
export const BUSINESS_RULES = {
  MIN_ORDER_VALUE: 100, // INR
  FREE_DELIVERY_THRESHOLD: 500, // INR
  DELIVERY_FEE: 50, // INR
  TAX_RATE: 0.18, // 18% GST
  SERVICE_CHARGE_RATE: 0.10, // 10%
  MAX_DISCOUNT_PERCENTAGE: 50,
  ORDER_CANCELLATION_TIME: 5 * 60 * 1000, // 5 minutes
} as const;

// Time Formats
export const TIME_FORMATS = {
  DATE: 'DD/MM/YYYY',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIMESTAMP: 'DD/MM/YYYY HH:mm:ss',
} as const;

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[\d\s\-()]{10,}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  PRICE_MIN: 1,
  PRICE_MAX: 10000,
  QUANTITY_MIN: 1,
  QUANTITY_MAX: 10,
} as const;