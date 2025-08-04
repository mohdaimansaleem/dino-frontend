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
  CART: 'dino_cart',
  PREFERENCES: 'dino_preferences',
} as const;

// API Configuration (imported from centralized config)
import { API_CONFIG as CENTRALIZED_API_CONFIG } from '../config/api';

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
  MENU: '/menu/:cafeId/:tableId',
  CHECKOUT: '/checkout/:cafeId/:tableId',
  ORDER_TRACKING: '/order-tracking/:orderId',
} as const;

// Default Values
export const DEFAULTS = {
  CAFE_ID: 'dino-cafe-1',
  CAFE_NAME: 'Dino Cafe',
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
  DEMO_MODE: false, // Disabled for production
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