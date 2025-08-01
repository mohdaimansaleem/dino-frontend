// Page Titles
export const PAGE_TITLES = {
  ADMIN_DASHBOARD: 'Dashboard',
  OPERATOR_DASHBOARD: 'Orders Dashboard',
  ORDERS_MANAGEMENT: 'Orders Management',
  MENU_MANAGEMENT: 'Menu Management',
  TABLE_MANAGEMENT: 'Table Management',
  CAFE_SETTINGS: 'Cafe Settings',
  CUSTOMER_MENU: 'Menu',
  CHECKOUT: 'Checkout',
  LOGIN: 'Sign In',
  REGISTER: 'Create Account',
} as const;

// App Titles
export const APP_TITLES = {
  DINO_ADMIN: 'Dino Admin',
  DINO_OPERATOR: 'Dino Operator',
  DINO_E_MENU: 'Dino',
  DINO_CAFE: 'Dino Cafe',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_UPDATED: 'Order status updated successfully',
  TABLE_CREATED: 'Table added successfully',
  TABLE_UPDATED: 'Table updated successfully',
  TABLE_DELETED: 'Table deleted successfully',
  MENU_ITEM_CREATED: 'Menu item added successfully',
  MENU_ITEM_UPDATED: 'Menu item updated successfully',
  MENU_ITEM_DELETED: 'Menu item deleted successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  CAFE_STATUS_UPDATED: 'Cafe status updated successfully',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION: 'Please check your input and try again.',
  ORDER_FAILED: 'Failed to place order. Please try again.',
  LOAD_FAILED: 'Failed to load data. Please refresh the page.',
  SAVE_FAILED: 'Failed to save changes. Please try again.',
  DELETE_FAILED: 'Failed to delete item. Please try again.',
  INVALID_PROMO: 'Invalid promo code',
  CART_EMPTY: 'Your cart is empty',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
} as const;

// Warning Messages
export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
  DELETE_CONFIRMATION: 'Are you sure you want to delete this item?',
  CLEAR_CART: 'Are you sure you want to clear your cart?',
  LOGOUT_CONFIRMATION: 'Are you sure you want to logout?',
} as const;

// Info Messages
export const INFO_MESSAGES = {
  LOADING: 'Loading...',
  NO_DATA: 'No data available',
  NO_ORDERS: 'No orders found',
  NO_ITEMS: 'No items found',
  EMPTY_CART: 'Your cart is empty',
  DEMO_MODE: 'Running in demo mode',
  ESTIMATED_TIME: 'Estimated time: 25-30 minutes',
  EXTRA_CHARGES: 'Extra charges may apply',
} as const;

// Button Labels
export const BUTTON_LABELS = {
  ADD: 'Add',
  EDIT: 'Edit',
  DELETE: 'Delete',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  SUBMIT: 'Submit',
  CONTINUE: 'Continue',
  BACK: 'Back',
  NEXT: 'Next',
  VIEW: 'View',
  VIEW_ALL: 'View All',
  ADD_TO_CART: 'ADD',
  VIEW_CART: 'VIEW CART',
  PLACE_ORDER: 'Place Order',
  LOGIN: 'Sign In',
  REGISTER: 'Create Account',
  LOGOUT: 'Logout',
  REFRESH: 'Refresh',
  APPLY: 'Apply',
  REMOVE: 'Remove',
  UPDATE: 'Update',
  CREATE: 'Create',
  CLOSE: 'Close',
  CONFIRM: 'Confirm',
  SKIP_LOGIN: 'Skip Login (Demo Mode)',
} as const;

// Placeholder Texts
export const PLACEHOLDERS = {
  SEARCH_ORDERS: 'Search orders, tables, menu items...',
  SEARCH_MENU: 'Search for dishes...',
  SEARCH_TABLES: 'Search tables...',
  EMAIL: 'Enter your email',
  PASSWORD: 'Enter your password',
  NAME: 'Enter your name',
  PHONE: 'Enter your phone number',
  SPECIAL_INSTRUCTIONS: 'Any special requests for this item...',
  ORDER_NOTES: 'Any special requests for your order...',
  PROMO_CODE: 'Enter promo code',
} as const;

// Labels
export const LABELS = {
  EMAIL: 'Email Address',
  PASSWORD: 'Password',
  CONFIRM_PASSWORD: 'Confirm Password',
  NAME: 'Full Name',
  PHONE: 'Phone Number',
  TABLE: 'Table',
  ORDER_ID: 'Order ID',
  STATUS: 'Status',
  TOTAL: 'Total',
  SUBTOTAL: 'Subtotal',
  TAX: 'Tax',
  DELIVERY_FEE: 'Delivery Fee',
  PAYMENT_STATUS: 'Payment Status',
  PAYMENT_METHOD: 'Payment Method',
  ESTIMATED_TIME: 'Estimated Time',
  SPECIAL_INSTRUCTIONS: 'Special Instructions',
  QUANTITY: 'Quantity',
  PRICE: 'Price',
  CATEGORY: 'Category',
  FILTER: 'Filter',
  SORT: 'Sort',
} as const;

// Access Control Messages
export const ACCESS_MESSAGES = {
  ACCESS_DENIED: 'Access Denied',
  NO_PERMISSION: "You don't have permission to access this page",
  OPERATOR_RESTRICTION: 'As an operator, you only have access to the Orders page.',
  CONTACT_ADMIN: 'If you believe this is an error, please contact your administrator.',
  CURRENT_ROLE: 'Current Role:',
} as const;

// Demo Mode Messages
export const DEMO_MESSAGES = {
  SELECT_ROLE: 'Demo Mode - Select Role:',
  LOGIN_AS_ADMIN: 'Login as Admin (Demo)',
  LOGIN_AS_OPERATOR: 'Login as Operator (Demo)',
  DEMO_MODE_INDICATOR: '🧪 DEMO MODE',
} as const;