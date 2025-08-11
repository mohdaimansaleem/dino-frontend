# Data Loading Fixes - Tables and Menu Items

## Issue Summary
Both Tables and Menu Items were not loading when navigating from the left tab in the dashboard, but would load properly when refreshing the page.

## Root Cause
The `UserDataContext` had hardcoded empty arrays for both `getTables()` and `getMenuItems()` functions:

```typescript
// In UserDataContext.tsx (lines 154-155)
const getMenuItems = () => []; // Simplified - no menu items in new structure
const getTables = () => []; // Simplified - no tables in new structure
```

However, both `TableManagement` and `MenuManagement` components were trying to use these functions to get data before making API calls, causing them to show empty states until a refresh forced direct API calls.

## Fixes Applied

### 1. TableManagement.tsx
**Before:**
```typescript
// Try to use tables from user data first
const userDataTables = getTables();
if (userDataTables && userDataTables.length > 0) {
  setTables(userDataTables);
}

// Load areas and tables from API
const [areasData, tablesData] = await Promise.all([
  tableService.getAreas(venue.id),
  userDataTables && userDataTables.length > 0 ? 
    Promise.resolve({ data: userDataTables }) : 
    tableService.getTables({ venue_id: venue.id })
]);
```

**After:**
```typescript
// Load areas and tables from API directly
const [areasData, tablesData] = await Promise.all([
  tableService.getAreas(venue.id),
  tableService.getTables({ venue_id: venue.id })
]);
```

### 2. MenuManagement.tsx
**Before:**
```typescript
// Try to use menu items from user data first
const userDataMenuItems = getMenuItems();
if (userDataMenuItems && userDataMenuItems.length > 0) {
  // Map user data menu items to component format
  setMenuItems(userDataMenuItems.map((item: any) => ({...})));
}

// Load categories and menu items from API
const [categoriesData, menuItemsData] = await Promise.all([
  menuService.getMenuCategories({ venue_id: venue.id }),
  userDataMenuItems && userDataMenuItems.length > 0 ? 
    Promise.resolve({ data: userDataMenuItems }) : 
    menuService.getMenuItems({ venue_id: venue.id })
]);
```

**After:**
```typescript
// Load categories and menu items from API directly
const [categoriesData, menuItemsData] = await Promise.all([
  menuService.getMenuCategories({ venue_id: venue.id }),
  menuService.getMenuItems({ venue_id: venue.id })
]);
```

### 3. UserDataDashboard.tsx
**Updated both tabs to redirect