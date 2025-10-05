/**
 * Global UI Component Feature Flags
 * 
 * This file controls global UI components and features across the entire application.
 * Set any flag to false to hide that UI element from users in production.
 */

import { UIFlags } from './types';

export const uiFlags: UIFlags = {
  // Global flags
  enableDebugMode: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,

  // Header components - Control app header elements
  showAppHeader: true,             // Shows the main application header
  showUserMenu: true,              // Shows user dropdown menu in header
  showNotificationCenter: true,    // Shows notification bell and center
  showThemeToggle: true,           // Shows light/dark theme toggle
  showSearchBar: false,            // Shows global search functionality

  // Footer components - Control app footer elements
  showAppFooter: true,             // Shows the main application footer
  showFooterLinks: true,           // Shows footer navigation links
  showFooterCopyright: true,       // Shows copyright information

  // Common UI elements - Control universal UI components
  showLoadingSpinners: true,       // Shows loading spinners during data fetch
  showProgressBars: true,          // Shows progress bars for long operations
  showTooltips: true,              // Shows helpful tooltips on hover
  showBreadcrumbs: false,          // Shows breadcrumb navigation
  showHelpButtons: true,           // Shows help and info buttons

  // Advanced UI features - Control enhanced user experience features
  enableAnimations: true,          // Enables smooth animations and transitions
  enableTransitions: true,         // Enables page and component transitions
  enableSoundEffects: false,       // Enables sound feedback for actions
  enableKeyboardShortcuts: true,   // Enables keyboard shortcuts for power users
};

/**
 * Header Component Descriptions:
 * 
 * showAppHeader: Main navigation header with logo and primary navigation
 * showUserMenu: User profile dropdown with logout, settings, profile options
 * showNotificationCenter: Notification bell icon with dropdown of recent notifications
 * showThemeToggle: Switch between light and dark themes
 * showSearchBar: Global search across all content and features
 */

/**
 * Footer Component Descriptions:
 * 
 * showAppFooter: Main application footer with links and information
 * showFooterLinks: Navigation links in footer (About, Contact, Help, etc.)
 * showFooterCopyright: Copyright notice and legal information
 */

/**
 * Common UI Element Descriptions:
 * 
 * showLoadingSpinners: Circular progress indicators during data loading
 * showProgressBars: Linear progress bars for file uploads, data processing
 * showTooltips: Helpful text that appears on hover for buttons and icons
 * showBreadcrumbs: Navigation trail showing current page location
 * showHelpButtons: Question mark icons that provide contextual help
 */

/**
 * Advanced UI Feature Descriptions:
 * 
 * enableAnimations: Smooth animations for cards, buttons, and interactions
 * enableTransitions: Page transitions and component state changes
 * enableSoundEffects: Audio feedback for button clicks and notifications
 * enableKeyboardShortcuts: Keyboard shortcuts for common actions (Ctrl+S, etc.)
 */

/**
 * Performance Considerations:
 * 
 * - enableAnimations and enableTransitions may impact performance on slower devices
 * - showLoadingSpinners improves perceived performance during loading
 * - enableSoundEffects should be used sparingly to avoid annoyance
 * - showTooltips improve usability but add slight overhead
 */

/**
 * Accessibility Considerations:
 * 
 * - showTooltips improve accessibility for screen readers
 * - enableKeyboardShortcuts help users with mobility impairments
 * - enableAnimations should respect user's motion preferences
 * - showBreadcrumbs help with navigation for all users
 */

export default uiFlags;