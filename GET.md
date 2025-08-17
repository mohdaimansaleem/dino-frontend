# GET APIs Documentation

This document lists all the GET APIs used in the Dino Restaurant Management System frontend application, organized by module with their expected response formats.

## Table of Contents
- [Authentication Module](#authentication-module)
- [User Management Module](#user-management-module)
- [Venue Management Module](#venue-management-module)
- [Workspace Management Module](#workspace-management-module)
- [Menu Management Module](#menu-management-module)
- [Order Management Module](#order-management-module)
- [Table Management Module](#table-management-module)
- [Dashboard & Analytics Module](#dashboard--analytics-module)
- [Promo Code Management Module](#promo-code-management-module)
- [Validation Module](#validation-module)
- [System Health Module](#system-health-module)

---

## Authentication Module

### 1. Get Current User Profile
**Endpoint:** `GET /auth/me`
**Description:** Get current authenticated user's profile information
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "role": "admin",
    "venue_id": "venue_123",
    "workspace_id": "workspace_123",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Get User Permissions
**Endpoint:** `GET /auth/permissions`
**Description:** Get current user's permissions
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "permissions": [
      {
        "id": "perm_1",
        "name": "menu.read",
        "resource": "menu",
        "action": "read",
        "description": "View menu items"
      }
    ],
    "role": {
      "id": "role_1",
      "name": "admin",
      "display_name": "Administrator"
    }
  }
}
```

### 3. Get User Data (Comprehensive)
**Endpoint:** `GET /auth/user-data`
**Description:** Get comprehensive user data including venue and workspace information
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "role": "admin",
      "venue_ids": ["venue_123"],
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    },
    "venue": {
      "id": "venue_123",
      "name": "Sample Restaurant",
      "description": "A great restaurant",
      "location": {
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "postal_code": "10001"
      },
      "phone": "+1234567890",
      "email": "restaurant@example.com",
      "is_active": true,
      "is_open": true,
      "created_at": "2024-01-01T00:00:00Z"
    },
    "workspace": {
      "id": "workspace_123",
      "name": "Restaurant Group",
      "display_name": "Restaurant Group LLC",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 4. Get User Addresses
**Endpoint:** `GET /users/addresses`
**Description:** Get user's saved addresses
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "addr_123",
      "type": "home",
      "address": "123 Home St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "USA",
      "is_default": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 5. Get User Preferences
**Endpoint:** `GET /users/preferences`
**Description:** Get user's preferences and settings
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    },
    "language": "en",
    "timezone": "America/New_York",
    "theme": "light"
  }
}
```

---

## User Management Module

### 1. Get Users (Paginated)
**Endpoint:** `GET /users?page=1&page_size=10&workspace_id=123&venue_id=456&role=admin&is_active=true`
**Description:** Get paginated list of users with filters
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "user_123",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+1234567890",
        "role": "admin",
        "venue_id": "venue_123",
        "workspace_id": "workspace_123",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 10,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

### 2. Get User by ID
**Endpoint:** `GET /users/{userId}`
**Description:** Get specific user details
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "role": "admin",
    "venue_id": "venue_123",
    "workspace_id": "workspace_123",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Get Users by Venue ID
**Endpoint:** `GET /venues/{venueId}/users`
**Description:** Get all users assigned to a specific venue
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "first_name": "John",
      "last_name": "Doe",
      "email": "user@example.com",
      "phone": "+1234567890",
      "role": "admin",
      "role_display_name": "Administrator",
      "is_active": true,
      "status": "active",
      "last_logged_in": "2024-01-01T00:00:00Z",
      "venue_id": "venue_123",
      "workspace_id": "workspace_123",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 4. Get User Statistics
**Endpoint:** `GET /users/statistics?workspace_id=123&venue_id=456`
**Description:** Get user statistics for workspace/venue
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 25,
    "active_users": 20,
    "users_by_role": {
      "admin": 5,
      "operator": 15,
      "staff": 5
    },
    "recent_logins": 12
  }
}
```

---

## Venue Management Module

### 1. Get Public Venues (Paginated)
**Endpoint:** `GET /venues/public?page=1&page_size=10&search=restaurant&cuisine_type=italian&price_range=mid_range`
**Description:** Get public venues with filtering and pagination
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "venue_123",
        "name": "Sample Restaurant",
        "description": "A great Italian restaurant",
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
        "email": "restaurant@example.com",
        "website": "https://restaurant.com",
        "cuisine_type": "italian",
        "price_range": "mid_range",
        "is_active": true,
        "is_open": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 10,
    "total_pages": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

### 2. Get Public Venue by ID
**Endpoint:** `GET /venues/public/{venueId}`
**Description:** Get public venue details
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "venue_123",
    "name": "Sample Restaurant",
    "description": "A great Italian restaurant",
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
    "email": "restaurant@example.com",
    "website": "https://restaurant.com",
    "cuisine_type": "italian",
    "price_range": "mid_range",
    "is_active": true,
    "is_open": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Get Venues (Authenticated)
**Endpoint:** `GET /venues?page=1&page_size=10&search=restaurant&subscription_status=active&is_active=true`
**Description:** Get venues filtered by user permissions
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "venue_123",
        "name": "Sample Restaurant",
        "description": "A great restaurant",
        "location": {
          "address": "123 Main St",
          "city": "New York",
          "state": "NY",
          "country": "USA",
          "postal_code": "10001"
        },
        "phone": "+1234567890",
        "email": "restaurant@example.com",
        "workspace_id": "workspace_123",
        "subscription_status": "active",
        "is_active": true,
        "is_open": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "page_size": 10,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

### 4. Get Venue by ID
**Endpoint:** `GET /venues/{venueId}`
**Description:** Get specific venue details
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "venue_123",
    "name": "Sample Restaurant",
    "description": "A great restaurant",
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
    "email": "restaurant@example.com",
    "website": "https://restaurant.com",
    "workspace_id": "workspace_123",
    "subscription_status": "active",
    "is_active": true,
    "is_open": true,
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 5. Get Venues by Workspace
**Endpoint:** `GET /venues/workspace/{workspaceId}/venues`
**Description:** Get all venues for a specific workspace
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "venue_123",
      "name": "Sample Restaurant",
      "description": "A great restaurant",
      "location": {
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "address": "123 Main St"
      },
      "phone": "+1234567890",
      "email": "restaurant@example.com",
      "is_active": true,
      "is_open": true,
      "status": "active",
      "subscription_status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 6. Get Venue Operating Hours
**Endpoint:** `GET /venues/{venueId}/hours`
**Description:** Get venue operating hours
**Expected Response:**
```json
{
  "success": true,
  "data": [
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
}
```

### 7. Get Venue Status
**Endpoint:** `GET /venues/{venueId}/status`
**Description:** Check if venue is currently open
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_id": "venue_123",
    "is_open": true,
    "is_accepting_orders": true,
    "current_status": "open",
    "next_status_change": {
      "type": "closing",
      "time": "22:00:00",
      "day": "Today"
    },
    "operating_hours": {
      "today": {
        "open_time": "09:00:00",
        "close_time": "22:00:00"
      }
    }
  }
}
```

### 8. Get Venue Analytics
**Endpoint:** `GET /venues/{venueId}/analytics`
**Description:** Get venue analytics data
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_id": "venue_123",
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "summary": {
      "total_orders": 150,
      "total_revenue": 15000.00,
      "average_order_value": 100.00,
      "customer_count": 120
    },
    "trends": {
      "revenue_growth": 15.5,
      "order_growth": 12.3
    }
  }
}
```

---

## Workspace Management Module

### 1. Get Workspaces (Paginated)
**Endpoint:** `GET /workspaces?page=1&page_size=10&search=restaurant&is_active=true`
**Description:** Get paginated list of workspaces
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "workspace_123",
        "name": "Restaurant Group",
        "display_name": "Restaurant Group LLC",
        "description": "A chain of restaurants",
        "is_active": true,
        "subscription_plan": "premium",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "page_size": 10,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

### 2. Get Workspace by ID
**Endpoint:** `GET /workspaces/{workspaceId}`
**Description:** Get specific workspace details
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "workspace_123",
    "name": "Restaurant Group",
    "display_name": "Restaurant Group LLC",
    "description": "A chain of restaurants",
    "is_active": true,
    "subscription_plan": "premium",
    "settings": {
      "timezone": "America/New_York",
      "currency": "USD",
      "language": "en"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Get Workspace Statistics
**Endpoint:** `GET /workspaces/{workspaceId}/statistics`
**Description:** Get workspace statistics
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_venues": 5,
    "active_venues": 4,
    "total_users": 25,
    "total_orders": 1500,
    "total_revenue": 150000.00,
    "monthly_growth": {
      "venues": 20.0,
      "users": 15.0,
      "revenue": 25.0
    }
  }
}
```

### 4. Get Workspace Users
**Endpoint:** `GET /workspaces/{workspaceId}/users`
**Description:** Get all users in a workspace
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin",
      "venue_id": "venue_123",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 5. Get Workspace Analytics
**Endpoint:** `GET /workspaces/{workspaceId}/analytics?start_date=2024-01-01&end_date=2024-01-31`
**Description:** Get workspace analytics for date range
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "summary": {
      "total_revenue": 150000.00,
      "total_orders": 1500,
      "total_customers": 800,
      "average_order_value": 100.00
    },
    "venue_performance": [
      {
        "venue_id": "venue_123",
        "venue_name": "Sample Restaurant",
        "revenue": 50000.00,
        "orders": 500,
        "growth": 15.5
      }
    ]
  }
}
```

---

## Menu Management Module

### 1. Get Menu Categories (Paginated)
**Endpoint:** `GET /menu/categories?page=1&page_size=10&venue_id=123&is_active=true`
**Description:** Get paginated list of menu categories
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "Appetizers",
      "description": "Delicious starters",
      "venue_id": "venue_123",
      "is_active": true,
      "sort_order": 1,
      "image_url": "https://example.com/appetizers.jpg",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "page_size": 10,
  "total_pages": 1,
  "has_next": false,
  "has_prev": false
}
```

### 2. Get Public Venue Categories
**Endpoint:** `GET /menu/public/venues/{venueId}/categories?table_id=table_123`
**Description:** Get menu categories for public venue access
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "Appetizers",
      "description": "Delicious starters",
      "venue_id": "venue_123",
      "is_active": true,
      "sort_order": 1,
      "image_url": "https://example.com/appetizers.jpg",
      "item_count": 8,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 3. Get Menu Category by ID
**Endpoint:** `GET /menu/categories/{categoryId}`
**Description:** Get specific menu category details
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "cat_123",
    "name": "Appetizers",
    "description": "Delicious starters",
    "venue_id": "venue_123",
    "is_active": true,
    "sort_order": 1,
    "image_url": "https://example.com/appetizers.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 4. Get Menu Items (Paginated)
**Endpoint:** `GET /menu/items?page=1&page_size=10&venue_id=123&category_id=cat_123&is_available=true&is_vegetarian=true&spice_level=medium`
**Description:** Get paginated list of menu items with filters
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item_123",
      "name": "Chicken Tikka",
      "description": "Grilled chicken with spices",
      "category_id": "cat_123",
      "venue_id": "venue_123",
      "base_price": 15.99,
      "is_available": true,
      "is_vegetarian": false,
      "is_vegan": false,
      "spice_level": "medium",
      "preparation_time_minutes": 20,
      "calories": 350,
      "allergens": ["dairy"],
      "image_url": "https://example.com/chicken-tikka.jpg",
      "created_at": "2024-01-01T00:00:00Z"
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

### 5. Get Public Venue Menu Items
**Endpoint:** `GET /menu/public/venues/{venueId}/items?category_id=cat_123&table_id=table_123`
**Description:** Get menu items for public venue access
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item_123",
      "name": "Chicken Tikka",
      "description": "Grilled chicken with spices",
      "category_id": "cat_123",
      "venue_id": "venue_123",
      "base_price": 15.99,
      "is_available": true,
      "is_vegetarian": false,
      "spice_level": "medium",
      "preparation_time_minutes": 20,
      "image_url": "https://example.com/chicken-tikka.jpg",
      "allergens": ["dairy"]
    }
  ]
}
```

### 6. Get Menu Item by ID
**Endpoint:** `GET /menu/items/{itemId}`
**Description:** Get specific menu item details
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "item_123",
    "name": "Chicken Tikka",
    "description": "Grilled chicken with spices",
    "category_id": "cat_123",
    "venue_id": "venue_123",
    "base_price": 15.99,
    "is_available": true,
    "is_vegetarian": false,
    "is_vegan": false,
    "spice_level": "medium",
    "preparation_time_minutes": 20,
    "calories": 350,
    "allergens": ["dairy"],
    "ingredients": ["chicken", "yogurt", "spices"],
    "image_url": "https://example.com/chicken-tikka.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 7. Search Menu Items
**Endpoint:** `GET /menu/venues/{venueId}/search?q=chicken`
**Description:** Search menu items by query
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item_123",
      "name": "Chicken Tikka",
      "description": "Grilled chicken with spices",
      "category_id": "cat_123",
      "base_price": 15.99,
      "is_available": true,
      "image_url": "https://example.com/chicken-tikka.jpg"
    }
  ]
}
```

### 8. Validate QR Code Access
**Endpoint:** `GET /menu/public/validate-qr-access?qr_code=QR123456`
**Description:** Validate QR code for menu access
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue": {
      "id": "venue_123",
      "name": "Sample Restaurant",
      "is_open": true,
      "is_accepting_orders": true
    },
    "table": {
      "id": "table_123",
      "table_number": "5",
      "capacity": 4,
      "table_status": "available"
    },
    "validation_timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 9. Get Venue Menu with Validation
**Endpoint:** `GET /menu/public/venues/{venueId}/menu-with-validation?table_id=table_123`
**Description:** Get complete menu with validation for public access
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue": {
      "id": "venue_123",
      "name": "Sample Restaurant",
      "is_open": true
    },
    "table": {
      "id": "table_123",
      "table_number": "5"
    },
    "categories": [
      {
        "id": "cat_123",
        "name": "Appetizers",
        "sort_order": 1
      }
    ],
    "items": [
      {
        "id": "item_123",
        "name": "Chicken Tikka",
        "category_id": "cat_123",
        "base_price": 15.99,
        "is_available": true
      }
    ],
    "items_by_category": {
      "cat_123": [
        {
          "id": "item_123",
          "name": "Chicken Tikka",
          "base_price": 15.99
        }
      ]
    }
  }
}
```

---

## Order Management Module

### 1. Get Orders (Paginated)
**Endpoint:** `GET /orders?page=1&page_size=10&venue_id=123&status=pending&payment_status=paid&order_type=dine_in`
**Description:** Get paginated list of orders with filters
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "order_123",
        "order_number": "ORD-001",
        "venue_id": "venue_123",
        "table_id": "table_123",
        "customer_id": "customer_123",
        "status": "pending",
        "payment_status": "paid",
        "order_type": "dine_in",
        "subtotal": 25.99,
        "tax_amount": 2.60,
        "total_amount": 28.59,
        "estimated_ready_time": "2024-01-01T12:30:00Z",
        "created_at": "2024-01-01T12:00:00Z",
        "items": [
          {
            "id": "order_item_123",
            "menu_item_id": "item_123",
            "menu_item_name": "Chicken Tikka",
            "quantity": 2,
            "unit_price": 12.99,
            "total_price": 25.98,
            "special_instructions": "Extra spicy"
          }
        ]
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 10,
    "total_pages": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

### 2. Get Order by ID
**Endpoint:** `GET /orders/{orderId}`
**Description:** Get specific order details
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_123",
    "order_number": "ORD-001",
    "venue_id": "venue_123",
    "table_id": "table_123",
    "customer_id": "customer_123",
    "status": "pending",
    "payment_status": "paid",
    "order_type": "dine_in",
    "subtotal": 25.99,
    "tax_amount": 2.60,
    "discount_amount": 0.00,
    "total_amount": 28.59,
    "payment_method": "card",
    "estimated_ready_time": "2024-01-01T12:30:00Z",
    "special_instructions": "No onions",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:05:00Z",
    "items": [
      {
        "id": "order_item_123",
        "menu_item_id": "item_123",
        "menu_item_name": "Chicken Tikka",
        "quantity": 2,
        "unit_price": 12.99,
        "total_price": 25.98,
        "special_instructions": "Extra spicy"
      }
    ],
    "customer": {
      "id": "customer_123",
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com"
    }
  }
}
```

### 3. Get Venue Orders
**Endpoint:** `GET /orders/venues/{venueId}/orders?status=pending&limit=20`
**Description:** Get orders for a specific venue
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order_123",
      "order_number": "ORD-001",
      "table_number": "5",
      "status": "pending",
      "total_amount": 28.59,
      "items_count": 2,
      "estimated_ready_time": "2024-01-01T12:30:00Z",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### 4. Get Customer Orders
**Endpoint:** `GET /orders/customers/{customerId}/orders?limit=10`
**Description:** Get orders for a specific customer
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order_123",
      "order_number": "ORD-001",
      "venue_name": "Sample Restaurant",
      "status": "delivered",
      "total_amount": 28.59,
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### 5. Get Order Analytics
**Endpoint:** `GET /orders/venues/{venueId}/analytics?start_date=2024-01-01&end_date=2024-01-31`
**Description:** Get order analytics for venue
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_id": "venue_123",
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "summary": {
      "total_orders": 150,
      "total_revenue": 15000.00,
      "average_order_value": 100.00,
      "completed_orders": 140,
      "cancelled_orders": 10
    },
    "order_trends": [
      {
        "date": "2024-01-01",
        "orders": 5,
        "revenue": 500.00
      }
    ],
    "popular_items": [
      {
        "menu_item_id": "item_123",
        "name": "Chicken Tikka",
        "orders": 25,
        "revenue": 324.75
      }
    ]
  }
}
```

### 6. Get Live Order Status
**Endpoint:** `GET /orders/venues/{venueId}/live`
**Description:** Get live order status for venue
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_id": "venue_123",
    "timestamp": "2024-01-01T12:00:00Z",
    "active_orders": 8,
    "pending_orders": 3,
    "preparing_orders": 4,
    "ready_orders": 1,
    "average_preparation_time": 18,
    "kitchen_load": "medium"
  }
}
```

### 7. Access Menu by QR
**Endpoint:** `GET /orders/public/qr/{qrCode}`
**Description:** Access menu via QR code
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue": {
      "id": "venue_123",
      "name": "Sample Restaurant",
      "is_open": true
    },
    "table": {
      "id": "table_123",
      "table_number": "5"
    },
    "menu_url": "/menu/venue_123/table_123"
  }
}
```

### 8. Check Venue Status (Public)
**Endpoint:** `GET /orders/public/venue/{venueId}/status`
**Description:** Check venue operating status for public
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_id": "venue_123",
    "is_open": true,
    "is_accepting_orders": true,
    "estimated_wait_time": 15,
    "message": "We're open and accepting orders!"
  }
}
```

### 9. Track Order Status (Public)
**Endpoint:** `GET /orders/public/{orderId}/status`
**Description:** Track order status for customers
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "order_123",
    "order_number": "ORD-001",
    "status": "preparing",
    "estimated_ready_time": "2024-01-01T12:30:00Z",
    "progress": {
      "ordered": true,
      "confirmed": true,
      "preparing": true,
      "ready": false,
      "served": false
    },
    "estimated_time_remaining": 15
  }
}
```

### 10. Get Order Receipt (Public)
**Endpoint:** `GET /orders/public/{orderId}/receipt`
**Description:** Get order receipt for customers
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "order_123",
    "order_number": "ORD-001",
    "venue_name": "Sample Restaurant",
    "venue_address": "123 Main St, New York, NY",
    "order_date": "2024-01-01T12:00:00Z",
    "items": [
      {
        "name": "Chicken Tikka",
        "quantity": 2,
        "unit_price": 12.99,
        "total_price": 25.98
      }
    ],
    "subtotal": 25.98,
    "tax_amount": 2.60,
    "total_amount": 28.58,
    "payment_method": "card",
    "payment_status": "paid"
  }
}
```

---

## Table Management Module

### 1. Get Tables (Paginated)
**Endpoint:** `GET /tables?page=1&page_size=10&venue_id=123&table_status=available&is_active=true`
**Description:** Get paginated list of tables with filters
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "table_123",
        "table_number": "5",
        "venue_id": "venue_123",
        "capacity": 4,
        "table_status": "available",
        "location": "Main dining area",
        "is_active": true,
        "qr_code": "QR123456",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 20,
    "page": 1,
    "page_size": 10,
    "total_pages": 2,
    "has_next": true,
    "has_prev": false
  }
}
```

### 2. Get Table by ID
**Endpoint:** `GET /tables/{tableId}`
**Description:** Get specific table details
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "table_123",
    "table_number": "5",
    "venue_id": "venue_123",
    "capacity": 4,
    "table_status": "available",
    "location": "Main dining area",
    "is_active": true,
    "qr_code": "QR123456",
    "current_order_id": null,
    "last_cleaned": "2024-01-01T10:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Get Venue Tables
**Endpoint:** `GET /tables/venues/{venueId}/tables?status=available`
**Description:** Get all tables for a specific venue
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "table_123",
      "table_number": "5",
      "capacity": 4,
      "table_status": "available",
      "location": "Main dining area",
      "is_active": true,
      "qr_code": "QR123456"
    }
  ]
}
```

### 4. Get Table QR Code
**Endpoint:** `GET /tables/{tableId}/qr-code`
**Description:** Get QR code data for a table
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "table_id": "table_123",
    "qr_code": "QR123456",
    "qr_code_url": "https://example.com/menu/venue_123/table_123",
    "qr_code_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "generated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 5. Get Table Areas
**Endpoint:** `GET /table-areas/venues/{venueId}/areas`
**Description:** Get table areas for a venue
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "area_123",
      "name": "Main Dining",
      "description": "Main dining area",
      "venue_id": "venue_123",
      "capacity": 50,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Dashboard & Analytics Module

### 1. Get SuperAdmin Dashboard
**Endpoint:** `GET /dashboard/venue/{venueId}` (for SuperAdmin users)
**Description:** Get comprehensive dashboard data for SuperAdmin
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "system_stats": {
      "total_workspaces": 10,
      "total_venues": 50,
      "total_users": 200,
      "total_orders_today": 150,
      "total_revenue_today": 15000.00,
      "total_tables": 500,
      "occupied_tables": 120,
      "active_venues": 45
    },
    "workspaces": [
      {
        "id": "workspace_123",
        "name": "Restaurant Group",
        "venue_count": 5,
        "user_count": 25,
        "is_active": true,
        "monthly_revenue": 50000.00
      }
    ],
    "venue_performance": [
      {
        "venue_id": "venue_123",
        "venue_name": "Sample Restaurant",
        "today_orders": 25,
        "today_revenue": 2500.00,
        "status": "active"
      }
    ]
  }
}
```

### 2. Get Admin Dashboard
**Endpoint:** `GET /dashboard/venue/{venueId}` (for Admin users)
**Description:** Get dashboard data for Admin users
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_name": "Sample Restaurant",
    "stats": {
      "today": {
        "orders_count": 25,
        "revenue": 2500.00,
        "customers": 20
      },
      "tables": {
        "total": 20,
        "occupied": 8,
        "available": 12
      },
      "menu": {
        "total_items": 50,
        "active_items": 45
      },
      "staff": {
        "total": 10,
        "active": 8
      }
    },
    "recent_orders": [
      {
        "id": "order_123",
        "order_number": "ORD-001",
        "table_number": "5",
        "total_amount": 28.59,
        "status": "preparing",
        "created_at": "2024-01-01T12:00:00Z"
      }
    ],
    "revenue_trend": [
      {
        "date": "2024-01-01",
        "revenue": 2500.00,
        "orders": 25
      }
    ]
  }
}
```

### 3. Get Operator Dashboard
**Endpoint:** `GET /dashboard/operator/comprehensive`
**Description:** Get dashboard data for Operator users
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_name": "Sample Restaurant",
    "stats": {
      "active_orders": 8,
      "pending_orders": 3,
      "preparing_orders": 4,
      "ready_orders": 1,
      "tables_occupied": 8,
      "tables_total": 20
    },
    "active_orders": [
      {
        "id": "order_123",
        "order_number": "ORD-001",
        "table_number": "5",
        "total_amount": 28.59,
        "status": "preparing",
        "estimated_ready_time": "2024-01-01T12:30:00Z",
        "items_count": 2,
        "created_at": "2024-01-01T12:00:00Z"
      }
    ],
    "table_status": [
      {
        "table_id": "table_123",
        "table_number": "5",
        "status": "occupied",
        "capacity": 4,
        "current_order_id": "order_123"
      }
    ]
  }
}
```

### 4. Get Dashboard Stats
**Endpoint:** `GET /dashboard/stats`
**Description:** Get general dashboard statistics
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_orders": 1500,
    "total_revenue": 150000.00,
    "active_venues": 45,
    "total_customers": 800,
    "growth_rate": 15.5
  }
}
```

### 5. Get Live Order Status
**Endpoint:** `GET /dashboard/live-orders/{venueId}`
**Description:** Get live order status for dashboard
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_id": "venue_123",
    "timestamp": "2024-01-01T12:00:00Z",
    "active_orders": 8,
    "pending_orders": 3,
    "preparing_orders": 4,
    "ready_orders": 1,
    "average_wait_time": 18,
    "kitchen_efficiency": 85.5
  }
}
```

### 6. Get Live Table Status
**Endpoint:** `GET /dashboard/live-tables/{venueId}`
**Description:** Get live table status for dashboard
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_id": "venue_123",
    "timestamp": "2024-01-01T12:00:00Z",
    "total_tables": 20,
    "occupied_tables": 8,
    "available_tables": 12,
    "reserved_tables": 0,
    "occupancy_rate": 40.0,
    "table_turnover_rate": 2.5
  }
}
```

---

## Analytics Module

### 1. Get Dashboard Analytics
**Endpoint:** `GET /analytics/venues/{venueId}/dashboard?start_date=2024-01-01&end_date=2024-01-31`
**Description:** Get comprehensive dashboard analytics
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_id": "venue_123",
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "summary": {
      "total_revenue": 50000.00,
      "total_orders": 500,
      "average_order_value": 100.00,
      "active_orders": 8,
      "customer_count": 300,
      "table_turnover_rate": 2.5
    },
    "revenue_trend": [
      {
        "date": "2024-01-01",
        "revenue": 1500.00,
        "orders": 15,
        "average_order_value": 100.00
      }
    ],
    "order_status_breakdown": [
      {
        "status": "completed",
        "count": 450,
        "percentage": 90.0,
        "color": "#4CAF50"
      }
    ],
    "popular_items": [
      {
        "menu_item_id": "item_123",
        "name": "Chicken Tikka",
        "category": "Main Course",
        "orders": 50,
        "revenue": 649.50,
        "percentage_of_total": 15.5
      }
    ],
    "hourly_performance": [
      {
        "hour": "12:00",
        "orders": 25,
        "revenue": 2500.00,
        "average_order_value": 100.00,
        "peak_indicator": true
      }
    ]
  }
}
```

### 2. Get Recent Orders
**Endpoint:** `GET /analytics/venues/{venueId}/recent-orders?limit=10`
**Description:** Get recent orders for analytics
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order_123",
      "order_number": "ORD-001",
      "table_number": "5",
      "table_id": "table_123",
      "items_count": 2,
      "total_amount": 28.59,
      "status": "completed",
      "created_at": "2024-01-01T12:00:00Z",
      "time_ago": "2 hours ago",
      "customer_name": "John Doe"
    }
  ]
}
```

### 3. Get Live Metrics
**Endpoint:** `GET /analytics/venues/{venueId}/live-metrics`
**Description:** Get live metrics for real-time dashboard
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_id": "venue_123",
    "timestamp": "2024-01-01T12:00:00Z",
    "active_orders": 8,
    "pending_orders": 3,
    "preparing_orders": 4,
    "ready_orders": 1,
    "served_orders_today": 45,
    "current_revenue_today": 4500.00,
    "tables_occupied": 8,
    "total_tables": 20,
    "average_wait_time": 18,
    "kitchen_efficiency": 85.5
  }
}
```

### 4. Get Sales Report
**Endpoint:** `GET /analytics/venues/{venueId}/sales-report?start_date=2024-01-01&end_date=2024-01-31`
**Description:** Get comprehensive sales report
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_id": "venue_123",
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "summary": {
      "total_revenue": 50000.00,
      "total_orders": 500,
      "total_customers": 300,
      "average_order_value": 100.00,
      "revenue_growth": 15.5,
      "order_growth": 12.3
    },
    "daily_breakdown": [
      {
        "date": "2024-01-01",
        "revenue": 1500.00,
        "orders": 15,
        "customers": 12,
        "average_order_value": 100.00,
        "day_of_week": "Monday"
      }
    ],
    "category_performance": [
      {
        "category_id": "cat_123",
        "category_name": "Main Course",
        "revenue": 25000.00,
        "orders": 250,
        "items_sold": 300,
        "percentage_of_total_revenue": 50.0,
        "growth_rate": 20.0
      }
    ],
    "top_selling_items": [
      {
        "menu_item_id": "item_123",
        "name": "Chicken Tikka",
        "category": "Main Course",
        "orders": 50,
        "revenue": 649.50,
        "percentage_of_total": 15.5
      }
    ]
  }
}
```

### 5. Get Revenue Trend
**Endpoint:** `GET /analytics/venues/{venueId}/revenue-trend?start_date=2024-01-01&end_date=2024-01-31&granularity=day`
**Description:** Get revenue trend data
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "revenue": 1500.00,
      "orders": 15,
      "average_order_value": 100.00
    }
  ]
}
```

### 6. Get Popular Items
**Endpoint:** `GET /analytics/venues/{venueId}/popular-items?start_date=2024-01-01&end_date=2024-01-31&limit=10`
**Description:** Get popular menu items analytics
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "menu_item_id": "item_123",
      "name": "Chicken Tikka",
      "category": "Main Course",
      "orders": 50,
      "revenue": 649.50,
      "percentage_of_total": 15.5,
      "image_url": "https://example.com/chicken-tikka.jpg"
    }
  ]
}
```

### 7. Get Hourly Performance
**Endpoint:** `GET /analytics/venues/{venueId}/hourly-performance?date=2024-01-01`
**Description:** Get hourly performance data
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "hour": "12:00",
      "orders": 25,
      "revenue": 2500.00,
      "average_order_value": 100.00,
      "peak_indicator": true
    }
  ]
}
```

### 8. Get Performance Metrics
**Endpoint:** `GET /analytics/venues/{venueId}/performance-metrics?start_date=2024-01-01&end_date=2024-01-31`
**Description:** Get performance metrics
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "metric": "Kitchen Efficiency",
      "value": 85.5,
      "max_value": 100.0,
      "unit": "%",
      "trend": "up",
      "percentage_change": 5.2
    }
  ]
}
```

### 9. Get Customer Insights
**Endpoint:** `GET /analytics/venues/{venueId}/customer-insights?start_date=2024-01-01&end_date=2024-01-31`
**Description:** Get customer insights analytics
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "new_customers": 50,
    "returning_customers": 250,
    "customer_retention_rate": 83.3,
    "average_customer_lifetime_value": 500.00,
    "most_popular_order_time": "19:00",
    "average_dining_duration": 75
  }
}
```

### 10. Get Customer Satisfaction
**Endpoint:** `GET /analytics/venues/{venueId}/customer-satisfaction?start_date=2024-01-01&end_date=2024-01-31`
**Description:** Get customer satisfaction data
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "average_rating": 4.5,
    "total_reviews": 150,
    "rating_distribution": [
      {
        "rating": 5,
        "count": 75,
        "percentage": 50.0
      },
      {
        "rating": 4,
        "count": 45,
        "percentage": 30.0
      }
    ]
  }
}
```

### 11. Get Inventory Analytics
**Endpoint:** `GET /analytics/venues/{venueId}/inventory`
**Description:** Get inventory analytics
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venue_id": "venue_123",
    "low_stock_items": [
      {
        "menu_item_id": "item_123",
        "name": "Chicken Tikka",
        "current_stock": 5,
        "minimum_threshold": 10,
        "days_until_stockout": 2,
        "priority": "high"
      }
    ],
    "top_consuming_items": [
      {
        "menu_item_id": "item_123",
        "name": "Chicken Tikka",
        "quantity_consumed": 100,
        "revenue_generated": 1299.00,
        "profit_margin": 65.0
      }
    ],
    "waste_analysis": {
      "total_waste_cost": 500.00,
      "waste_percentage": 5.0,
      "top_wasted_items": [
        {
          "menu_item_id": "item_123",
          "name": "Chicken Tikka",
          "quantity_wasted": 5,
          "cost_impact": 64.95,
          "reason": "Overproduction"
        }
      ]
    }
  }
}
```

### 12. Export Analytics
**Endpoint:** `GET /analytics/venues/{venueId}/export?report_type=sales&start_date=2024-01-01&end_date=2024-01-31&format=csv`
**Description:** Export analytics data
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "download_url": "https://example.com/exports/sales-report-2024-01.csv",
    "file_name": "sales-report-2024-01.csv",
    "file_size": 1024,
    "expires_at": "2024-01-02T00:00:00Z"
  }
}
```

---

## Promo Code Management Module

### 1. Get Promo Codes (Paginated)
**Endpoint:** `GET /promo-codes?venue_id=123&is_active=true&type=percentage&search=SAVE&page=1&page_size=10`
**Description:** Get paginated list of promo codes with filters
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "promo_123",
        "code": "SAVE20",
        "name": "20% Off",
        "description": "Get 20% off your order",
        "type": "percentage",
        "discount_type": "order_total",
        "discount_value": 20.0,
        "minimum_order_amount": 50.00,
        "maximum_discount_amount": 100.00,
        "usage_limit": 100,
        "usage_count": 25,
        "user_usage_limit": 1,
        "valid_from": "2024-01-01T00:00:00Z",
        "valid_until": "2024-12-31T23:59:59Z",
        "is_active": true,
        "venue_id": "venue_123",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 10,
    "total_pages": 5
  }
}
```

### 2. Get Active Promo Codes (Public)
**Endpoint:** `GET /promo-codes/public/active?venue_id=123`
**Description:** Get active promo codes for public use
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "promo_123",
      "code": "SAVE20",
      "name": "20% Off",
      "description": "Get 20% off your order",
      "type": "percentage",
      "discount_value": 20.0,
      "minimum_order_amount": 50.00,
      "maximum_discount_amount": 100.00,
      "valid_until": "2024-12-31T23:59:59Z",
      "terms_and_conditions": "Valid for dine-in orders only"
    }
  ]
}
```

### 3. Get Promo Code by ID
**Endpoint:** `GET /promo-codes/{promoCodeId}`
**Description:** Get specific promo code details
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "promo_123",
    "code": "SAVE20",
    