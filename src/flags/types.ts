/**
 * Feature Flag Types
 * 
 * This file contains all TypeScript interfaces and types for the feature flag system.
 * Each flag interface represents the available flags for a specific page or feature.
 */

// Base flag interface that all page flags extend
export interface BaseFlags {
  // Global flags that apply to all pages
  enableDebugMode: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorReporting: boolean;
}

// Dashboard page flags
export interface DashboardFlags extends BaseFlags {
  // Dashboard tabs visibility
  showOverviewTab: boolean;
  showSalesAnalyticsTab: boolean;
  showMenuPerformanceTab: boolean;
  showTablesOrdersTab: boolean;
  showPaymentsTab: boolean;
  
  // Dashboard components
  showDashboardStats: boolean;
  showRealTimeUpdates: boolean;
  showQuickActions: boolean;
  showRecentActivity: boolean;
  showPerformanceCharts: boolean;
  
  // Individual chart controls
  showRevenueChart: boolean;
  showOrderStatusChart: boolean;
  showSalesMetrics: boolean;
  showAnalyticsCharts: boolean;
  
  // Dashboard features
  enableDataExport: boolean;
  enableAdvancedFilters: boolean;
  enableCustomDateRange: boolean;
  enableNotifications: boolean;
}

// Menu Management page flags
export interface MenuFlags extends BaseFlags {
  // Menu management features
  showAddMenuItem: boolean;
  showEditMenuItem: boolean;
  showDeleteMenuItem: boolean;
  showMenuItemImage: boolean;
  showQuickImageUpload: boolean;
  showMenuItemAvailability: boolean;
  
  // Category management
  showAddCategory: boolean;
  showEditCategory: boolean;
  showDeleteCategory: boolean;
  showCategoryStats: boolean;
  
  // Menu features
  showMenuStats: boolean;
  showMenuFilters: boolean;
  showBulkActions: boolean;
  showMenuExport: boolean;
  showPriceHistory: boolean;
  showIngredientManagement: boolean;
  
  // Advanced features
  enableMenuTemplates: boolean;
  enableMenuScheduling: boolean;
  enableSeasonalMenus: boolean;
  enableNutritionalInfo: boolean;
}

// User Management page flags
export interface UserFlags extends BaseFlags {
  // User management actions
  showAddUser: boolean;
  showEditUser: boolean;
  showDeleteUser: boolean;
  showUserPasswordUpdate: boolean;
  showUserStatusToggle: boolean;
  
  // User features
  showUserStats: boolean;
  showUserFilters: boolean;
  showUserExport: boolean;
  showUserActivity: boolean;
  showUserPermissions: boolean;
  showUserRoles: boolean;
  
  // Advanced user features
  enableBulkUserActions: boolean;
  enableUserImport: boolean;
  enableUserAuditLog: boolean;
  enableUserNotifications: boolean;
}

// Table Management page flags
export interface TableFlags extends BaseFlags {
  // Table management actions
  showAddTable: boolean;
  showEditTable: boolean;
  showDeleteTable: boolean;
  showTableQRCode: boolean;
  showTableStatus: boolean;
  
  // Table features
  showTableStats: boolean;
  showTableAreas: boolean;
  showTableFilters: boolean;
  showTableLayout: boolean;
  showTableReservations: boolean;
  
  // Advanced table features
  enableTableMerging: boolean;
  enableTableScheduling: boolean;
  enableWaitlistManagement: boolean;
  enableTableAnalytics: boolean;
}

// Orders Management page flags
export interface OrderFlags extends BaseFlags {
  // Order management actions
  showOrderDetails: boolean;
  showOrderStatusUpdate: boolean;
  showOrderCancel: boolean;
  showOrderRefund: boolean;
  showOrderPrint: boolean;
  
  // Order features
  showOrderStats: boolean;
  showOrderFilters: boolean;
  showOrderTracking: boolean;
  showOrderHistory: boolean;
  showOrderNotes: boolean;
  
  // Advanced order features
  enableOrderModification: boolean;
  enableOrderSplitting: boolean;
  enableOrderMerging: boolean;
  enableOrderAnalytics: boolean;
  enableKitchenDisplay: boolean;
}

// Settings page flags
export interface SettingsFlags extends BaseFlags {
  // Venue settings
  showVenueSettings: boolean;
  showVenueHours: boolean;
  showVenueContact: boolean;
  showVenueTheme: boolean;
  showVenueImages: boolean;
  
  // System settings
  showNotificationSettings: boolean;
  showPaymentSettings: boolean;
  showTaxSettings: boolean;
  showPrintSettings: boolean;
  showIntegrationSettings: boolean;
  
  // Advanced settings
  enableAdvancedSettings: boolean;
  enableSystemMaintenance: boolean;
  enableDataBackup: boolean;
  enableSystemLogs: boolean;
}

// Sidebar navigation flags
export interface SidebarFlags extends BaseFlags {
  // Navigation items
  showDashboardNav: boolean;
  showOrdersNav: boolean;
  showMenuNav: boolean;
  showTablesNav: boolean;
  showCouponsNav: boolean;
  showUsersNav: boolean;
  showPermissionsNav: boolean;
  showSettingsNav: boolean;
  showWorkspaceNav: boolean;
  
  // Sidebar features
  showVenueStatus: boolean;
  showUserProfile: boolean;
  showQuickActions: boolean;
  showNotificationBadges: boolean;
  
  // Sidebar behavior
  enableSidebarCollapse: boolean;
  enableSidebarSearch: boolean;
  enableSidebarTooltips: boolean;
}

// Coupons Management page flags
export interface CouponFlags extends BaseFlags {
  // Coupon management actions
  showAddCoupon: boolean;
  showEditCoupon: boolean;
  showDeleteCoupon: boolean;
  showCouponPreview: boolean;
  showCouponActivation: boolean;
  
  // Coupon features
  showCouponStats: boolean;
  showCouponFilters: boolean;
  showCouponUsage: boolean;
  showCouponAnalytics: boolean;
  
  // Advanced coupon features
  enableBulkCouponActions: boolean;
  enableCouponTemplates: boolean;
  enableCouponScheduling: boolean;
  enableCouponLimits: boolean;
}

// Authentication page flags
export interface AuthFlags extends BaseFlags {
  // Login features
  showRememberMe: boolean;
  showForgotPassword: boolean;
  showSocialLogin: boolean;
  showPasswordStrength: boolean;
  
  // Registration features
  showRegistration: boolean;
  showEmailVerification: boolean;
  showTermsAndConditions: boolean;
  showPrivacyPolicy: boolean;
  
  // Security features
  enableTwoFactorAuth: boolean;
  enableCaptcha: boolean;
  enablePasswordHistory: boolean;
  enableAccountLockout: boolean;
}

// Global UI component flags
export interface UIFlags extends BaseFlags {
  // Header components
  showAppHeader: boolean;
  showUserMenu: boolean;
  showNotificationCenter: boolean;
  showThemeToggle: boolean;
  showSearchBar: boolean;
  
  // Footer components
  showAppFooter: boolean;
  showFooterLinks: boolean;
  showFooterCopyright: boolean;
  
  // Common UI elements
  showLoadingSpinners: boolean;
  showProgressBars: boolean;
  showTooltips: boolean;
  showBreadcrumbs: boolean;
  showHelpButtons: boolean;
  
  // Advanced UI features
  enableAnimations: boolean;
  enableTransitions: boolean;
  enableSoundEffects: boolean;
  enableKeyboardShortcuts: boolean;
}

// Combined flags interface for the entire application
export interface AppFlags extends BaseFlags {
  dashboard: DashboardFlags;
  menu: MenuFlags;
  users: UserFlags;
  tables: TableFlags;
  orders: OrderFlags;
  settings: SettingsFlags;
  sidebar: SidebarFlags;
  coupons: CouponFlags;
  auth: AuthFlags;
  ui: UIFlags;
}

// Flag context type
export interface FlagContextType {
  flags: AppFlags;
  updateFlag: (path: string, value: boolean) => void;
  resetFlags: () => void;
  loadFlags: () => void;
  saveFlags: () => void;
}

// Flag update payload
export interface FlagUpdatePayload {
  path: string;
  value: boolean;
  timestamp: number;
  user?: string;
}

// Flag history entry
export interface FlagHistoryEntry {
  id: string;
  path: string;
  oldValue: boolean;
  newValue: boolean;
  timestamp: number;
  user: string;
  reason?: string;
}