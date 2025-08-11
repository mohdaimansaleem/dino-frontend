/**
 * Local Storage Keys Constants
 * Centralized storage key definitions to avoid hardcoding throughout the app
 */

export const STORAGE_KEYS = {
  // Authentication related
  TOKEN: 'dino_token',
  REFRESH_TOKEN: 'dino_refresh_token',
  USER: 'dino_user',
  PERMISSIONS: 'dino_permissions',
  
  // User preferences
  THEME: 'dino_theme',
  LANGUAGE: 'dino_language',
  
  // App state
  LAST_WORKSPACE: 'dino_last_workspace',
  LAST_VENUE: 'dino_last_venue',
  
  // Cache keys
  CACHE_PREFIX: 'dino_cache_',
  
  // Settings
  USER_SETTINGS: 'dino_user_settings',
  APP_SETTINGS: 'dino_app_settings',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];