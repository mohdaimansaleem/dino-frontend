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