/**
 * Settings Page Feature Flags
 * 
 * This file controls all features and components visible on the settings page.
 * Set any flag to false to hide that feature from users in production.
 */

import { SettingsFlags } from './types';

export const settingsFlags: SettingsFlags = {
  // Global flags
  enableDebugMode: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,

  // Venue settings - Control venue-related settings
  showVenueSettings: true,         // Shows basic venue information settings
  showVenueHours: true,            // Shows operating hours configuration
  showVenueContact: true,          // Shows contact information settings
  showVenueTheme: true,            // Shows theme and branding customization
  showVenueImages: true,           // Shows venue image upload and management

  // System settings - Control system-wide settings
  showNotificationSettings: true,  // Shows notification preferences and configuration
  showPaymentSettings: true,       // Shows payment gateway and method settings
  showTaxSettings: true,           // Shows tax configuration and rates
  showPrintSettings: true,         // Shows printer and receipt settings
  showIntegrationSettings: false,  // Shows third-party integration settings

  // Advanced settings - Premium/advanced functionality
  enableAdvancedSettings: false,   // Enables advanced configuration options
  enableSystemMaintenance: false,  // Enables system maintenance and cleanup tools
  enableDataBackup: false,         // Enables data backup and restore functionality
  enableSystemLogs: false,         // Enables system log viewing and management
};

/**
 * Venue Settings Descriptions:
 * 
 * showVenueSettings: Basic venue information (name, description, address, etc.)
 * showVenueHours: Operating hours, special hours, holiday schedules
 * showVenueContact: Phone numbers, email addresses, social media links
 * showVenueTheme: Color schemes, logos, branding elements
 * showVenueImages: Upload and manage venue photos and gallery
 */

/**
 * System Settings Descriptions:
 * 
 * showNotificationSettings: Email, SMS, push notification preferences
 * showPaymentSettings: Payment gateway configuration, accepted methods
 * showTaxSettings: Tax rates, tax categories, tax calculation rules
 * showPrintSettings: Receipt printers, kitchen printers, print templates
 * showIntegrationSettings: Third-party service integrations (POS, accounting, etc.)
 */

/**
 * Advanced Settings Descriptions:
 * 
 * enableAdvancedSettings: Advanced configuration options for power users
 * enableSystemMaintenance: Database cleanup, cache clearing, system optimization
 * enableDataBackup: Automated backups, manual backup/restore functionality
 * enableSystemLogs: View system logs, error logs, audit trails
 */

export default settingsFlags;