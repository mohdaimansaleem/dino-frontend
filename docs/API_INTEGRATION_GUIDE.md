# Dino Multi-Venue Platform - API Integration Guide

## 📋 Overview

This document provides a comprehensive mapping between UI components and their corresponding API calls, including expected requests and responses. This serves as a reference for developers to understand the data flow between frontend components and backend services.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │────│   Service Layer │────│   Backend API   │
│                 │    │                 │    │                 │
│ - Pages         │    │ - authService   │    │ - /auth/*       │
│ - Components    │    │ - venueService  │    │ - /venues/*     │
│ - Forms         │    │ - orderService  │    │ - /orders/*     │
│ - Dashboards    │    │ - menuService   │    │ - /menu/*       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📚 Table of Contents

1. [Authentication Components](#-authentication-components)
2. [Dashboard Components](#-dashboard-components)
3. [Workspace Management Components](#-workspace-management-components)
4. [Venue Management Components](#-venue-management-components)
5. [Menu Management Components](#-menu-management-components)
6. [Table Management Components](#-table-management-components)
7. [Order Management Components](#-order-management-components)
8. [User Management Components](#-user-management-components)
9. [Public Ordering Components](#-public-ordering-components)
10. [Real-Time Components](#-real-time-components)
11. [Error Handling](#-error-handling)
12. [Authentication Flow](#-authentication-flow)

---

## 🔐 Authentication Components

### LoginPage Component
**Location:** `frontend/src/pages/LoginPage.tsx`

#### API Calls:

**🔑 User Login**
- **Service:** `authService.login()`
- **Endpoint:** `POST /auth/login`
- **UI Request:**
```typescript
{
  email: string;
  password: string;
  rememberMe: boolean;
}
```
- **Backend Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "remember_me": false
}
```
- **Backend Response:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "workspace_id": "workspace_id",
    "venue_id": "venue_id"
  }
}
```

### RegistrationPage Component
**Location:** `frontend/src/pages/RegistrationPage.tsx`

#### API Calls:

**👤 User Registration**
- **Service:** `authService.register()`
- **Endpoint:** `POST /auth/register`
- **UI Request:**
```typescript
{
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  workspaceId: string;
  venueId?: string;
  roleId?: string;
}
```
- **Backend Request:**
```json
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePass123",
  "confirm_password": "SecurePass123",
  "role_id": "optional_role_id",
  "workspace_id": "workspace_id",
  "venue_id": "optional_venue_id"
}
```
- **Backend Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "workspace_id": "workspace_id",
    "role": "operator",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**🏢 Workspace Registration**
- **Service:** `authService.registerWorkspace()`
- **Endpoint:** `POST /auth/register-workspace`
- **UI Request:**
```typescript
{
  workspaceDisplayName: string;
  workspaceDescription?: string;
  businessType: string;
  venueName: string;
  venueDescription?: string;
  venueLocation: VenueLocation;
  venuePhone?: string;
  venueEmail?: string;
  venueWebsite?: string;
  cuisineTypes: string[];
  priceRange: PriceRange;
  ownerEmail: string;
  ownerPhone?: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerPassword: string;
  confirmPassword: string;
}
```

### UserProfile Component
**Location:** `frontend/src/components/UserProfile.tsx`

#### API Calls:

**👤 Get Current User**
- **Service:** `authService.getCurrentUser()`
- **Endpoint:** `GET /auth/me`
- **UI Request:** None (uses stored token)
- **Backend Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "admin",
  "workspace_id": "workspace_id",
  "venue_id": "venue_id",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

**✏️ Update Profile**
- **Service:** `authService.updateProfile()`
- **Endpoint:** `PUT /auth/me`
- **UI Request:**
```typescript
{
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
}
```

**🔒 Change Password**
- **Service:** `authService.changePassword()`
- **Endpoint:** `POST /auth/change-password`
- **UI Request:**
```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

---

## 📊 Dashboard Components

### SuperAdminDashboard Component
**Location:** `frontend/src/components/dashboards/SuperAdminDashboard.tsx`

#### API Calls:

**📈 Get Dashboard Data**
- **Service:** `dashboardService.getDashboardData()`
- **Endpoint:** `GET /dashboard/`
- **UI Request:** None
- **Backend Response:**
```json
{
  "user_role": "superadmin",
  "workspace_id": "workspace_id",
  "summary": {
    "total_venues": 5,
    "active_venues": 4,
    "total_orders": 1250,
    "total_revenue": 45000.00
  },
  "all_venues": [...],
  "workspace_analytics": {...},
  "user_management": {...},
  "alerts": [...],
  "quick_actions": [...]
}
```

**📊 Get Workspace Analytics**
- **Service:** `dashboardService.getWorkspaceAnalytics()`
- **Endpoint:** `GET /dashboard/analytics/workspace`
- **UI Request:**
```typescript
{
  startDate?: string;
  endDate?: string;
}
```

### AdminDashboard Component
**Location:** `frontend/src/components/dashboards/AdminDashboard.tsx`

#### API Calls:

**🏪 Get Venue Analytics**
- **Service:** `dashboardService.getVenueAnalytics()`
- **Endpoint:** `GET /dashboard/analytics/venue/{venue_id}`
- **UI Request:**
```typescript
{
  venueId: string;
  startDate?: string;
  endDate?: string;
}
```
- **Backend Response:**
```json
{
  "venue_id": "venue_id",
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "total_orders": 150,
  "total_revenue": 12500.00,
  "average_order_value": 83.33,
  "status_breakdown": {
    "pending": 5,
    "confirmed": 10,
    "preparing": 8,
    "ready": 3,
    "served": 124
  }
}
```

### OperatorDashboard Component
**Location:** `frontend/src/components/dashboards/OperatorDashboard.tsx`

#### API Calls:

**⚡ Get Live Order Status**
- **Service:** `dashboardService.getLiveOrderStatus()`
- **Endpoint:** `GET /dashboard/live/orders`
- **UI Request:**
```typescript
{
  venueId?: string;
}
```
- **Backend Response:**
```json
{
  "venue_id": "venue_id",
  "timestamp": "2024-01-01T12:00:00Z",
  "summary": {
    "total_active_orders": 8,
    "pending_orders": 2,
    "preparing_orders": 4,
    "ready_orders": 2
  },
  "orders_by_status": {
    "pending": [...],
    "confirmed": [...],
    "preparing": [...],
    "ready": [...]
  }
}
```

**🪑 Get Live Table Status**
- **Service:** `dashboardService.getLiveTableStatus()`
- **Endpoint:** `GET /dashboard/live/tables`
- **UI Request:**
```typescript
{
  venueId?: string;
}
```

---

## 🏢 Workspace Management Components

### WorkspaceManagement Component
**Location:** `frontend/src/pages/admin/WorkspaceManagement.tsx`

#### API Calls:

**📋 Get Workspaces**
- **Service:** `workspaceService.getWorkspaces()`
- **Endpoint:** `GET /workspaces/`
- **UI Request:**
```typescript
{
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}
```
- **Backend Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "workspace_id",
      "name": "my_restaurant_chain_abc123",
      "display_name": "My Restaurant Chain",
      "description": "A chain of fine dining restaurants",
      "business_type": "restaurant",
      "owner_id": "user_id",
      "venue_ids": ["venue1", "venue2"],
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 10,
  "total_pages": 1,
  "has_next": false,
  "has_prev": false
}
```

**➕ Create Workspace**
- **Service:** `workspaceService.createWorkspace()`
- **Endpoint:** `POST /workspaces/`
- **UI Request:**
```typescript
{
  displayName: string;
  description?: string;
  businessType: string;
}
```

**✏️ Update Workspace**
- **Service:** `workspaceService.updateWorkspace()`
- **Endpoint:** `PUT /workspaces/{workspace_id}`
- **UI Request:**
```typescript
{
  workspaceId: string;
  displayName?: string;
  description?: string;
  isActive?: boolean;
}
```

**📊 Get Workspace Statistics**
- **Service:** `workspaceService.getWorkspaceStatistics()`
- **Endpoint:** `GET /workspaces/{workspace_id}/statistics`
- **Backend Response:**
```json
{
  "workspace_id": "workspace_id",
  "workspace_name": "My Restaurant Chain",
  "total_venues": 3,
  "active_venues": 2,
  "total_users": 15,
  "active_users": 12,
  "total_orders": 1250,
  "total_menu_items": 85,
  "created_at": "2024-01-01T00:00:00Z",
  "is_active": true
}
```

---

## 🏪 Venue Management Components

### VenueManagement Component
**Location:** `frontend/src/pages/admin/VenueManagement.tsx`

#### API Calls:

**🏪 Get Venues**
- **Service:** `venueService.getVenues()`
- **Endpoint:** `GET /venues/`
- **UI Request:**
```typescript
{
  page?: number;
  pageSize?: number;
  search?: string;
  subscriptionStatus?: string;
  isActive?: boolean;
}
```
- **Backend Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "venue_id",
      "name": "Main Branch",
      "description": "Our flagship restaurant",
      "location": {
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "postal_code": "10001",
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "phone": "+1234567890",
      "email": "venue@example.com",
      "website": "https://example.com",
      "cuisine_types": ["italian", "american"],
      "price_range": "mid_range",
      "rating": 4.5,
      "total_reviews": 125,
      "is_active": true
    }
  ]
}
```

**➕ Create Venue**
- **Service:** `venueService.createVenue()`
- **Endpoint:** `POST /venues/`
- **UI Request:**
```typescript
{
  name: string;
  description?: string;
  location: VenueLocation;
  phone?: string;
  email?: string;
  website?: string;
  cuisineTypes: string[];
  priceRange: PriceRange;
  operatingHours?: OperatingHours[];
  workspaceId: string;
}
```

**✏️ Update Venue**
- **Service:** `venueService.updateVenue()`
- **Endpoint:** `PUT /venues/{venue_id}`

**📊 Get Venue Analytics**
- **Service:** `venueService.getVenueAnalytics()`
- **Endpoint:** `GET /venues/{venue_id}/analytics`
- **Backend Response:**
```json
{
  "venue_id": "venue_id",
  "total_menu_items": 45,
  "total_tables": 20,
  "recent_orders": 15,
  "total_customers": 350,
  "rating": 4.5,
  "total_reviews": 125,
  "subscription_status": "active",
  "is_active": true
}
```

### VenueSettings Component
**Location:** `frontend/src/pages/admin/VenueSettings.tsx`

#### API Calls:

**🕐 Get Operating Hours**
- **Service:** `venueService.getOperatingHours()`
- **Endpoint:** `GET /venues/{venue_id}/hours`
- **Backend Response:**
```json
[
  {
    "day_of_week": 0,
    "is_open": true,
    "open_time": "09:00:00",
    "close_time": "22:00:00",
    "is_24_hours": false,
    "break_start": "14:00:00",
    "break_end": "16:00:00"
  }
]
```

**🕐 Update Operating Hours**
- **Service:** `venueService.updateOperatingHours()`
- **Endpoint:** `PUT /venues/{venue_id}/hours`
- **UI Request:**
```typescript
{
  venueId: string;
  hours: OperatingHours[];
}
```

---

## 🍽️ Menu Management Components

### MenuManagement Component
**Location:** `frontend/src/pages/admin/MenuManagement.tsx`

#### API Calls:

**📂 Get Menu Categories**
- **Service:** `menuService.getVenueCategories()`
- **Endpoint:** `GET /menu/venues/{venue_id}/categories`
- **UI Request:**
```typescript
{
  venueId: string;
}
```
- **Backend Response:**
```json
[
  {
    "id": "category_id",
    "name": "Appetizers",
    "description": "Start your meal with these delicious appetizers",
    "venue_id": "venue_id",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**🍕 Get Menu Items**
- **Service:** `menuService.getVenueMenuItems()`
- **Endpoint:** `GET /menu/venues/{venue_id}/items`
- **UI Request:**
```typescript
{
  venueId: string;
  categoryId?: string;
}
```
- **Backend Response:**
```json
[
  {
    "id": "item_id",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce, mozzarella, and basil",
    "base_price": 12.99,
    "category_id": "category_id",
    "venue_id": "venue_id",
    "is_vegetarian": true,
    "is_vegan": false,
    "is_gluten_free": false,
    "spice_level": "mild",
    "preparation_time_minutes": 15,
    "nutritional_info": {
      "calories": 280
    },
    "image_urls": ["https://example.com/pizza.jpg"],
    "is_available": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**➕ Create Menu Category**
- **Service:** `menuService.createMenuCategory()`
- **Endpoint:** `POST /menu/categories`
- **UI Request:**
```typescript
{
  name: string;
  description?: string;
  venueId: string;
}
```

**➕ Create Menu Item**
- **Service:** `menuService.createMenuItem()`
- **Endpoint:** `POST /menu/items`
- **UI Request:**
```typescript
{
  name: string;
  description?: string;
  basePrice: number;
  categoryId: string;
  venueId: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spiceLevel?: string;
  preparationTimeMinutes?: number;
  nutritionalInfo?: Record<string, any>;
}
```

**✏️ Update Menu Item**
- **Service:** `menuService.updateMenuItem()`
- **Endpoint:** `PUT /menu/items/{item_id}`

**🔍 Search Menu Items**
- **Service:** `menuService.searchMenuItems()`
- **Endpoint:** `GET /menu/venues/{venue_id}/search`
- **UI Request:**
```typescript
{
  venueId: string;
  query: string;
}
```

---

## 🪑 Table Management Components

### TableManagement Component
**Location:** `frontend/src/pages/admin/TableManagement.tsx`

#### API Calls:

**🪑 Get Venue Tables**
- **Service:** `tableService.getVenueTables()`
- **Endpoint:** `GET /tables/venues/{venue_id}/tables`
- **UI Request:**
```typescript
{
  venueId: string;
  status?: TableStatus;
}
```
- **Backend Response:**
```json
[
  {
    "id": "table_id",
    "table_number": 5,
    "capacity": 4,
    "location": "Window side",
    "venue_id": "venue_id",
    "qr_code": "encoded_qr_data.hash",
    "table_status": "available",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**➕ Create Table**
- **Service:** `tableService.createTable()`
- **Endpoint:** `POST /tables/`
- **UI Request:**
```typescript
{
  tableNumber: number;
  capacity: number;
  location?: string;
  venueId: string;
}
```
- **Backend Response:**
```json
{
  "success": true,
  "message": "Table created successfully",
  "data": {
    "id": "table_id",
    "table_number": 5,
    "capacity": 4,
    "location": "Window side",
    "venue_id": "venue_id",
    "qr_code": "encoded_qr_data.hash",
    "table_status": "available",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**🔄 Update Table Status**
- **Service:** `tableService.updateTableStatus()`
- **Endpoint:** `PUT /tables/{table_id}/status`
- **UI Request:**
```typescript
{
  tableId: string;
  newStatus: TableStatus;
}
```
- **Backend Request:**
```json
{
  "new_status": "occupied"
}
```

**📦 Bulk Create Tables**
- **Service:** `tableService.bulkCreateTables()`
- **Endpoint:** `POST /tables/bulk-create`
- **UI Request:**
```typescript
{
  venueId: string;
  startNumber: number;
  count: number;
  capacity?: number;
  location?: string;
}
```

### QRCodeManager Component
**Location:** `frontend/src/components/QRCodeManager.tsx`

#### API Calls:

**📱 Get Table QR Code**
- **Service:** `tableService.getTableQRCode()`
- **Endpoint:** `GET /tables/{table_id}/qr-code`
- **UI Request:**
```typescript
{
  tableId: string;
}
```
- **Backend Response:**
```json
{
  "table_id": "table_id",
  "qr_code": "encoded_qr_data.hash",
  "qr_code_url": "https://example.com/qr/table_id.png",
  "venue_id": "venue_id",
  "table_number": 5
}
```

**🔄 Regenerate QR Code**
- **Service:** `tableService.regenerateQRCode()`
- **Endpoint:** `POST /tables/{table_id}/regenerate-qr`

**✅ Verify QR Code**
- **Service:** `tableService.verifyQRCode()`
- **Endpoint:** `POST /tables/verify-qr`
- **UI Request:**
```typescript
{
  qrCode: string;
}
```

---

## 📋 Order Management Components

### OrdersManagement Component
**Location:** `frontend/src/pages/admin/OrdersManagement.tsx`

#### API Calls:

**📋 Get Orders**
- **Service:** `orderService.getOrders()`
- **Endpoint:** `GET /orders/`
- **UI Request:**
```typescript
{
  page?: number;
  pageSize?: number;
  venueId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  orderType?: OrderType;
}
```
- **Backend Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order_id",
      "order_number": "ORD-202401011200-ABC123",
      "venue_id": "venue_id",
      "customer_id": "customer_id",
      "items": [
        {
          "menu_item_id": "item_id",
          "menu_item_name": "Margherita Pizza",
          "quantity": 2,
          "unit_price": 12.99,
          "total_price": 25.98
        }
      ],
      "subtotal": 25.98,
      "tax_amount": 4.68,
      "total_amount": 30.66,
      "status": "pending",
      "payment_status": "pending",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "page_size": 10,
  "total_pages": 5,
  "has_next": true,
  "has_prev": false
}
```

**🔄 Update Order Status**
- **Service:** `orderService.updateOrderStatus()`
- **Endpoint:** `PUT /orders/{order_id}/status`
- **UI Request:**
```typescript
{
  orderId: string;
  status: OrderStatus;
}
```

**✅ Confirm Order**
- **Service:** `orderService.confirmOrder()`
- **Endpoint:** `POST /orders/{order_id}/confirm`
- **UI Request:**
```typescript
{
  orderId: string;
  estimatedMinutes?: number;
}
```

**❌ Cancel Order**
- **Service:** `orderService.cancelOrder()`
- **Endpoint:** `POST /orders/{order_id}/cancel`
- **UI Request:**
```typescript
{
  orderId: string;
  reason?: string;
}
```

**🏪 Get Venue Orders**
- **Service:** `orderService.getVenueOrders()`
- **Endpoint:** `GET /orders/venues/{venue_id}/orders`
- **UI Request:**
```typescript
{
  venueId: string;
  status?: OrderStatus;
  limit?: number;
}
```

### OrderTrackingPage Component
**Location:** `frontend/src/pages/OrderTrackingPage.tsx`

#### API Calls:

**📍 Track Order Status**
- **Service:** `orderService.trackOrderStatus()`
- **Endpoint:** `GET /orders/public/{order_id}/status`
- **UI Request:**
```typescript
{
  orderId: string;
}
```
- **Backend Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "order_id",
    "order_number": "ORD-202401011200-ABC123",
    "status": "preparing",
    "estimated_ready_time": "2024-01-01T12:20:00Z",
    "total_amount": 30.66,
    "payment_status": "paid",
    "venue_name": "Main Branch",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

**🧾 Get Order Receipt**
- **Service:** `orderService.getOrderReceipt()`
- **Endpoint:** `GET /orders/public/{order_id}/receipt`
- **Backend Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "order_id",
    "order_number": "ORD-202401011200-ABC123",
    "venue": {
      "name": "Main Branch",
      "address": "123 Main St, New York, NY",
      "phone": "+1234567890"
    },
    "items": [
      {
        "menu_item_name": "Margherita Pizza",
        "quantity": 2,
        "unit_price": 12.99,
        "total_price": 25.98
      }
    ],
    "subtotal": 25.98,
    "tax_amount": 4.68,
    "total_amount": 30.66,
    "payment_status": "paid",
    "order_date": "2024-01-01T12:00:00Z",
    "table_number": 5
  }
}
```

---

## 👥 User Management Components

### UserManagement Component
**Location:** `frontend/src/pages/admin/UserManagement.tsx`

#### API Calls:

**👥 Get Users**
- **Service:** `userService.getUsers()`
- **Endpoint:** `GET /users/`
- **UI Request:**
```typescript
{
  page?: number;
  pageSize?: number;
  workspaceId?: string;
  venueId?: string;
  role?: UserRole;
  isActive?: boolean;
}
```
- **Backend Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "phone": "+1234567890",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin",
      "workspace_id": "workspace_id",
      "venue_id": "venue_id",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "page_size": 10
}
```

**➕ Create User**
- **Service:** `userService.createUser()`
- **Endpoint:** `POST /users/`
- **UI Request:**
```typescript
{
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  roleId?: string;
  workspaceId: string;
  venueId?: string;
}
```

**✏️ Update User**
- **Service:** `userService.updateUser()`
- **Endpoint:** `PUT /users/{user_id}`

**🔄 Activate/Deactivate User**
- **Service:** `userService.activateUser()` / `userService.deleteUser()`
- **Endpoint:** `POST /users/{user_id}/activate` / `DELETE /users/{user_id}`

---

## 🌐 Public Ordering Components

### MenuPage Component
**Location:** `frontend/src/pages/MenuPage.tsx`

#### API Calls:

**📱 Access Menu via QR Code**
- **Service:** `orderService.accessMenuByQR()`
- **Endpoint:** `GET /orders/public/qr/{qr_code}`
- **UI Request:**
```typescript
{
  qrCode: string;
}
```
- **Backend Response:**
```json
{
  "venue": {
    "id": "venue_id",
    "name": "Main Branch",
    "description": "Our flagship restaurant",
    "cuisine_types": ["italian", "american"],
    "location": {...},
    "phone": "+1234567890",
    "is_open": true,
    "current_wait_time": 15,
    "rating": 4.5
  },
  "table": {
    "id": "table_id",
    "table_number": 5,
    "capacity": 4
  },
  "categories": [
    {
      "id": "category_id",
      "name": "Appetizers",
      "description": "Start your meal..."
    }
  ],
  "items": [
    {
      "id": "item_id",
      "name": "Margherita Pizza",
      "description": "Classic pizza...",
      "base_price": 12.99,
      "category_id": "category_id",
      "is_available": true,
      "preparation_time_minutes": 15,
      "image_urls": [...]
    }
  ]
}
```

**🏪 Check Venue Status**
- **Service:** `orderService.checkVenueStatus()`
- **Endpoint:** `GET /orders/public/venue/{venue_id}/status`
- **Backend Response:**
```json
{
  "venue_id": "venue_id",
  "is_open": true,
  "current_status": "active",
  "next_opening": null,
  "next_closing": "2024-01-01T22:00:00Z",
  "break_time": {
    "start": "2024-01-01T14:00:00Z",
    "end": "2024-01-01T16:00:00Z"
  },
  "message": "We're open! Kitchen closes at 10 PM."
}
```

### CheckoutPage Component
**Location:** `frontend/src/pages/CheckoutPage.tsx`

#### API Calls:

**✅ Validate Order**
- **Service:** `orderService.validateOrder()`
- **Endpoint:** `POST /orders/public/validate-order`
- **UI Request:**
```typescript
{
  venueId: string;
  tableId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
}
```
- **Backend Response:**
```json
{
  "is_valid": true,
  "venue_open": true,
  "items_available": ["item_id"],
  "items_unavailable": [],
  "estimated_total": 30.66,
  "estimated_preparation_time": 20,
  "message": "Order is valid and can be placed",
  "errors": []
}
```

**📋 Create Public Order**
- **Service:** `orderService.createPublicOrder()`
- **Endpoint:** `POST /orders/public/create-order`
- **UI Request:**
```typescript
{
  venueId: string;
  tableId: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  orderType: OrderType;
  specialInstructions?: string;
  estimatedGuests?: number;
}
```
- **Backend Response:**
```json
{
  "success": true,
  "order_id": "order_id",
  "order_number": "ORD-202401011200-ABC123",
  "estimated_preparation_time": 20,
  "total_amount": 30.66,
  "payment_required": true,
  "message": "Order placed successfully!",
  "customer_id": "customer_id"
}
```

---

## ⚡ Real-Time Components

### RealTimeDashboard Component
**Location:** `frontend/src/components/dashboards/RealTimeDashboard.tsx`

#### API Calls:

**⚡ Get Live Order Status (Polling)**
- **Service:** `dashboardService.getLiveOrderStatus()`
- **Endpoint:** `GET /dashboard/live/orders`
- **Polling Interval:** Every 10 seconds for operators, 30 seconds for admins
- **UI Request:**
```typescript
{
  venueId?: string;
}
```

**🪑 Get Live Table Status (Polling)**
- **Service:** `dashboardService.getLiveTableStatus()`
- **Endpoint:** `GET /dashboard/live/tables`
- **Polling Interval:** Every 30 seconds

### ActivityFeed Component
**Location:** `frontend/src/components/realtime/ActivityFeed.tsx`

#### API Calls:

**📈 Get Recent Activities**
- **Service:** Custom activity service (to be implemented)
- **Endpoint:** `GET /activities/recent`
- **UI Request:**
```typescript
{
  venueId?: string;
  limit?: number;
  since?: string;
}
```

---

## ✅ Validation Components

### Form Validation (All Forms)

#### API Calls:

**🏢 Validate Workspace Data**
- **Service:** `validationService.validateWorkspaceData()`
- **Endpoint:** `POST /validation/workspace-data`
- **UI Request:**
```typescript
{
  workspaceName: string;
  ownerEmail: string;
}
```
- **Backend Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": []
}
```

**🏪 Validate Venue Data**
- **Service:** `validationService.validateVenueData()`
- **Endpoint:** `POST /validation/venue-data`

**👤 Validate User Data**
- **Service:** `validationService.validateUserData()`
- **Endpoint:** `POST /validation/user-data`

**🍕 Validate Menu Item Data**
- **Service:** `validationService.validateMenuItemData()`
- **Endpoint:** `POST /validation/menu-item-data`

---

## ❌ Error Handling

### Common Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "error_code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "message": "Email already exists"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### HTTP Status Codes Used
- **200 OK**: Successful GET, PUT requests
- **201 Created**: Successful POST requests
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

### Error Code Constants
```typescript
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  VENUE_CLOSED: 'VENUE_CLOSED',
  ITEM_UNAVAILABLE: 'ITEM_UNAVAILABLE',
  INVALID_QR_CODE: 'INVALID_QR_CODE',
} as const;
```

---

## 🔐 Authentication Flow

### Token Management
1. **Login** → Store `access_token` and `refresh_token`
2. **API Calls** → Include `Authorization: Bearer <access_token>` header
3. **Token Refresh** → Automatic refresh on 401 responses
4. **Logout** → Clear stored tokens

### Role-Based Access
- **SuperAdmin**: Access to all workspaces and venues
- **Admin**: Access to assigned workspace and venues
- **Operator**: Access to assigned venue operations
- **Customer**: Public ordering access only

### Authentication Headers
```typescript
// All authenticated requests include:
headers: {
  'Authorization': 'Bearer <access_token>',
  'Content-Type': 'application/json'
}
```

### Token Refresh Flow
```typescript
// Automatic token refresh on 401 responses
if (error.response?.status === 401) {
  const refreshToken = localStorage.getItem('dino_refresh_token');
  const response = await axios.post('/auth/refresh', {
    refresh_token: refreshToken
  });
  // Update tokens and retry original request
}
```

---

## 🚀 Getting Started

### 1. Service Import
```typescript
import {
  authService,
  venueService,
  menuService,
  orderService,
  dashboardService
} from '../services';
```

### 2. Basic API Call Pattern
```typescript
// Example: Get venues
const fetchVenues = async () => {
  try {
    setLoading(true);
    const response = await venueService.getVenues({
      page: 1,
      pageSize: 10,
      isActive: true
    });
    
    if (response.success) {
      setVenues(response.data);
    } else {
      setError(response.error);
    }
  } catch (error) {
    setError('Failed to fetch venues');
  } finally {
    setLoading(false);
  }
};
```

### 3. Error Handling Pattern
```typescript
// Consistent error handling
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Redirect to login
    navigate('/login');
  } else if (error.response?.status === 403) {
    // Show access denied message
    showToast('Access denied', 'error');
  } else {
    // Show generic error
    showToast(error.message || 'An error occurred', 'error');
  }
};
```

### 4. Real-Time Updates
```typescript
// Polling for real-time data
useEffect(() => {
  const interval = setInterval(async () => {
    const liveData = await dashboardService.getLiveOrderStatus(venueId);
    setOrderData(liveData);
  }, 10000); // Poll every 10 seconds

  return () => clearInterval(interval);
}, [venueId]);
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Currency amounts are in the smallest unit (e.g., cents for USD)
- Phone numbers should include country code
- QR codes are base64 encoded strings
- File uploads support common image formats (JPEG, PNG, WebP)
- Pagination starts from page 1
- Default page size is 10, maximum is 100

---

## 🔗 Related Documentation

- [Backend API Documentation](../../backend/API_DOCUMENTATION.md)
- [Frontend Service Layer](../src/services/README.md)
- [Type Definitions](../src/types/README.md)
- [Component Architecture](./COMPONENT_ARCHITECTURE.md)

---

**Last Updated:** January 2024  
**Version:** 1.0.0