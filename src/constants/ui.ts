// UI Layout Constants
export const UI_LAYOUT = {
  HEADER_HEIGHT: 64,
  SIDEBAR_WIDTH: 240,
  CONTAINER_MAX_WIDTH: 'xl' as const,
  CARD_BORDER_RADIUS: 2,
  BUTTON_BORDER_RADIUS: 1,
  SPACING: {
    XS: 1,
    SM: 2,
    MD: 3,
    LG: 4,
    XL: 6,
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

// Animation Durations (in milliseconds)
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  CHART_REFRESH: 10000, // 10 seconds
  LOADING_DELAY: 800,
  NAVIGATION_DELAY: 100,
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