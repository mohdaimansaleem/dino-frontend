/**
 * Menu Management Page Feature Flags
 * 
 * This file controls all features and components visible on the menu management page.
 * Set any flag to false to hide that feature from users in production.
 */

import { MenuFlags } from './types';

export const menuFlags: MenuFlags = {
  // Global flags
  enableDebugMode: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,

  // Menu item management actions - Control CRUD operations for menu items
  showAddMenuItem: true,           // Shows "Add Menu Item" button and functionality
  showEditMenuItem: true,          // Shows edit button on menu item cards
  showDeleteMenuItem: true,        // Shows delete button on menu item cards
  showMenuItemImage: true,         // Shows image upload/display for menu items
  showQuickImageUpload: true,      // Shows quick image upload button on item cards
  showMenuItemAvailability: true, // Shows availability toggle for menu items

  // Category management - Control category-related features
  showAddCategory: true,           // Shows "Add Category" button and functionality
  showEditCategory: true,          // Shows edit button for categories
  showDeleteCategory: true,        // Shows delete button for categories
  showCategoryStats: true,         // Shows statistics for each category

  // Menu page features - Control main page functionality
  showMenuStats: true,             // Shows menu statistics at the top of the page
  showMenuFilters: true,           // Shows filtering options (category, veg/non-veg, etc.)
  showBulkActions: true,           // Shows bulk action buttons for multiple items
  showMenuExport: true,            // Shows export menu data functionality
  showPriceHistory: false,         // Shows price change history for items
  showIngredientManagement: false, // Shows ingredient management for items

  // Advanced menu features - Premium/advanced functionality
  enableMenuTemplates: false,      // Enables menu template system
  enableMenuScheduling: false,     // Enables scheduling menu items for specific times
  enableSeasonalMenus: false,      // Enables seasonal menu management
  enableNutritionalInfo: false,    // Enables nutritional information for items
};

/**
 * Menu Item Action Descriptions:
 * 
 * showAddMenuItem: Displays the "Add New Menu Item" button and opens the creation dialog
 * showEditMenuItem: Shows edit icon on each menu item card for modifications
 * showDeleteMenuItem: Shows delete icon on each menu item card for removal
 * showMenuItemImage: Enables image upload, display, and management for menu items
 * showQuickImageUpload: Shows the quick upload button overlay on menu item images
 * showMenuItemAvailability: Shows the availability toggle switch for each item
 */

/**
 * Category Management Descriptions:
 * 
 * showAddCategory: Displays the "Add Category" button in the categories section
 * showEditCategory: Shows edit button for each category in the category list
 * showDeleteCategory: Shows delete button for each category (with safety checks)
 * showCategoryStats: Displays item count and other statistics for each category
 */

/**
 * Menu Page Feature Descriptions:
 * 
 * showMenuStats: Top section showing total items, categories, availability stats
 * showMenuFilters: Filter bar with category, vegetarian, availability filters
 * showBulkActions: Select multiple items for bulk operations (delete, update, etc.)
 * showMenuExport: Export menu data to CSV, PDF, or other formats
 * showPriceHistory: Track and display price changes over time for items
 * showIngredientManagement: Manage ingredients and allergen information
 */

/**
 * Advanced Feature Descriptions:
 * 
 * enableMenuTemplates: Pre-built menu templates for quick setup
 * enableMenuScheduling: Schedule items to be available at specific times/dates
 * enableSeasonalMenus: Create different menus for different seasons
 * enableNutritionalInfo: Add and display nutritional information for menu items
 */

export default menuFlags;