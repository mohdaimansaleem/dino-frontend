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