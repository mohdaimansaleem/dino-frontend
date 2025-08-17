/**
 * Storage Constants
 * 
 * Centralized storage key definitions for localStorage and sessionStorage
 */

export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'dino_auth_token',
  REFRESH_TOKEN: 'dino_refresh_token',
  USER_DATA: 'dino_user_data',
  
  // User Preferences
  THEME: 'dino_theme',
  LANGUAGE: 'dino_language',
  
  // Application State
  CURRENT_WORKSPACE: 'dino_current_workspace',
  CURRENT_VENUE: 'dino_current_venue',
  LAST_ROUTE: 'dino_last_route',
  
  // Cart and Orders
  CART_ITEMS: 'dino_cart_items',
  DRAFT_ORDER: 'dino_draft_order',
  
  // Settings
  NOTIFICATION_SETTINGS: 'dino_notification_settings',
  DISPLAY_SETTINGS: 'dino_display_settings',
  
  // Cache
  MENU_CACHE: 'dino_menu_cache',
  VENUE_CACHE: 'dino_venue_cache',
  
  // Session
  SESSION_ID: 'dino_session_id',
  
  // Legacy keys (for cleanup only - no longer used)
  DINO_AVATAR: 'dinoAvatar',
  DINO_NAME: 'dinoName',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];