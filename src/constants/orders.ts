// Order Status Constants
export const ORDER_STATUS = {
  ORDERED: 'ordered',
  PROCESSING: 'processing', 
  READY: 'ready',
  SERVED: 'served',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Order Status Colors
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.ORDERED]: '#1976d2',
  [ORDER_STATUS.PROCESSING]: '#42a5f5', 
  [ORDER_STATUS.READY]: '#64b5f6',
  [ORDER_STATUS.SERVED]: '#90caf9',
  [ORDER_STATUS.CANCELLED]: '#f44336',
} as const;

// Order Status Icons (Material-UI icon names)
export const ORDER_STATUS_ICONS = {
  [ORDER_STATUS.ORDERED]: 'Assignment',
  [ORDER_STATUS.PROCESSING]: 'Restaurant',
  [ORDER_STATUS.READY]: 'CheckCircle',
  [ORDER_STATUS.SERVED]: 'LocalShipping',
  [ORDER_STATUS.CANCELLED]: 'Cancel',
} as const;

// Order Status Labels
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.ORDERED]: 'Ordered',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.READY]: 'Ready',
  [ORDER_STATUS.SERVED]: 'Served',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
} as const;

// Payment Status Constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Payment Status Colors
export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: 'warning',
  [PAYMENT_STATUS.PAID]: 'success',
  [PAYMENT_STATUS.FAILED]: 'error',
  [PAYMENT_STATUS.REFUNDED]: 'info',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  ONLINE: 'online',
  WALLET: 'wallet',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

// Payment Method Labels
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Cash',
  [PAYMENT_METHODS.CARD]: 'Card',
  [PAYMENT_METHODS.UPI]: 'UPI',
  [PAYMENT_METHODS.ONLINE]: 'Online',
  [PAYMENT_METHODS.WALLET]: 'Wallet',
} as const;

// Order Timing
export const ORDER_TIMING = {
  DEFAULT_PREP_TIME: 15, // minutes
  MAX_PREP_TIME: 60, // minutes
  MIN_PREP_TIME: 5, // minutes
  ESTIMATED_DELIVERY: 30, // minutes
} as const;

// Order Limits
export const ORDER_LIMITS = {
  MIN_ORDER_VALUE: 100, // INR
  MAX_ITEMS_PER_ORDER: 50,
  MAX_QUANTITY_PER_ITEM: 10,
} as const;