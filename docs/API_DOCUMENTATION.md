# Dino E-Menu Frontend API Documentation

This document provides a comprehensive list of all API endpoints used by the frontend application. Each endpoint includes the HTTP method, URL, request/response examples, and authentication requirements.

## Base Configuration

- **Base URL**: `http://localhost:8000/api/v1` (configurable via `REACT_APP_API_URL`)
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json` (unless specified otherwise)
- **Timeout**: 30 seconds

## Authentication Endpoints

### 1. User Login
- **Method**: `POST`
- **URL**: `/auth/login`
- **Authentication**: None required
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin",
      "workspace_id": "workspace_123",
      "venue_id": "venue_123"
    }
  }
}
```

### 2. Refresh Token
- **Method**: `POST`
- **URL**: `/auth/refresh`
- **Authentication**: None required
- **Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Response**: Same as login response

## User Management Endpoints

### 3. Get Current User Profile
- **Method**: `GET`
- **URL**: `/users/profile`
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "role": {
      "id": "role_123",
      "name": "admin",
      "display_name": "Administrator",
      "permissions": [...]
    },
    "workspace_id": "workspace_123",
    "venue_id": "venue_123",
    "is_active": true,
    "is_verified": true,
    "preferences": {...},
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 4. Update User Profile
- **Method**: `PUT`
- **URL**: `/users/profile`
- **Authentication**: Required
- **Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "preferences": {
    "language": "en",
    "timezone": "Asia/Kolkata",
    "notifications": {
      "email_notifications": true,
      "push_notifications": true
    }
  }
}
```

### 5. Register New User
- **Method**: `POST`
- **URL**: `/users/register`
- **Authentication**: None required
- **Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567890"
}
```

### 6. Get Users (Admin)
- **Method**: `GET`
- **URL**: `/users?workspace_id={id}&role={role}&is_active={bool}&search={query}&page={num}&page_size={num}`
- **Authentication**: Required (Admin)
- **Response**:
```json
{
  "success": true,
  "data": {
    "data": [...users],
    "total": 50,
    "page": 1,
    "total_pages": 5
  }
}
```

### 7. Create User (Admin)
- **Method**: `POST`
- **URL**: `/users`
- **Authentication**: Required (Admin)
- **Request Body**:
```json
{
  "email": "employee@example.com",
  "password": "password123",
  "first_name": "Employee",
  "last_name": "Name",
  "role_name": "operator",
  "workspace_id": "workspace_123",
  "venue_id": "venue_123",
  "send_invitation": true
}
```

### 8. Update User (Admin)
- **Method**: `PUT`
- **URL**: `/users/{userId}`
- **Authentication**: Required (Admin)

### 9. Delete User (Admin)
- **Method**: `DELETE`
- **URL**: `/users/{userId}`
- **Authentication**: Required (Admin)

### 10. Change Password
- **Method**: `POST`
- **URL**: `/users/change-password`
- **Authentication**: Required
- **Request Body**:
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

### 11. Upload Profile Image
- **Method**: `POST`
- **URL**: `/users/profile/image`
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`
- **Request Body**: FormData with 'file' field

### 12. User Addresses
- **Method**: `GET/POST/PUT/DELETE`
- **URLs**: 
  - `GET /users/addresses`
  - `POST /users/addresses`
  - `PUT /users/addresses/{addressId}`
  - `DELETE /users/addresses/{addressId}`
- **Authentication**: Required

### 13. User Preferences
- **Method**: `GET/PUT`
- **URLs**: 
  - `GET /users/preferences`
  - `PUT /users/preferences`
- **Authentication**: Required

## Workspace Management Endpoints

### 14. Get Workspaces
- **Method**: `GET`
- **URL**: `/workspaces`
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "workspace_123",
      "name": "My Restaurant Chain",
      "description": "Multi-location restaurant business",
      "pricing_plan": "premium",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 15. Get Workspace by ID
- **Method**: `GET`
- **URL**: `/workspaces/{workspaceId}`
- **Authentication**: Required

### 16. Create Workspace
- **Method**: `POST`
- **URL**: `/workspaces`
- **Authentication**: Required
- **Request Body**:
```json
{
  "name": "New Restaurant Chain",
  "description": "Description of the business",
  "pricing_plan": "basic"
}
```

### 17. Update Workspace
- **Method**: `PUT`
- **URL**: `/workspaces/{workspaceId}`
- **Authentication**: Required

### 18. Delete Workspace
- **Method**: `DELETE`
- **URL**: `/workspaces/{workspaceId}`
- **Authentication**: Required

### 19. Get Workspace Users
- **Method**: `GET`
- **URL**: `/workspaces/{workspaceId}/users`
- **Authentication**: Required

### 20. Invite User to Workspace
- **Method**: `POST`
- **URL**: `/workspaces/{workspaceId}/invite`
- **Authentication**: Required
- **Request Body**:
```json
{
  "email": "newuser@example.com",
  "role": "operator",
  "venue_id": "venue_123"
}
```

### 21. Get Workspace Analytics
- **Method**: `GET`
- **URL**: `/workspaces/{workspaceId}/analytics?start_date={date}&end_date={date}`
- **Authentication**: Required

## Venue/Cafe Management Endpoints

### 22. Get Venues
- **Method**: `GET`
- **URL**: `/venues?workspace_id={id}&subscription_status={status}&is_active={bool}&search={query}`
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "venue_123",
      "name": "Downtown Cafe",
      "description": "Cozy cafe in the heart of the city",
      "workspace_id": "workspace_123",
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
      "email": "cafe@example.com",
      "cuisine_types": ["Italian", "American"],
      "price_range": "mid_range",
      "operating_hours": [...],
      "subscription_plan": "premium",
      "status": "active",
      "is_active": true,
      "rating": 4.5,
      "total_reviews": 150
    }
  ]
}
```

### 23. Get Public Venues
- **Method**: `GET`
- **URL**: `/venues/public?search={query}&cuisine_type={type}&price_range={range}&page={num}&page_size={num}`
- **Authentication**: None required

### 24. Get Venue by ID
- **Method**: `GET`
- **URL**: `/venues/{venueId}`
- **Authentication**: Required

### 25. Get Public Venue by ID
- **Method**: `GET`
- **URL**: `/venues/public/{venueId}`
- **Authentication**: None required

### 26. Create Venue
- **Method**: `POST`
- **URL**: `/venues`
- **Authentication**: Required
- **Request Body**:
```json
{
  "name": "New Cafe",
  "description": "A wonderful new cafe",
  "workspace_id": "workspace_123",
  "location": {
    "address": "456 Oak St",
    "city": "Boston",
    "state": "MA",
    "country": "USA",
    "postal_code": "02101"
  },
  "phone": "+1234567890",
  "email": "newcafe@example.com",
  "cuisine_types": ["Coffee", "Pastries"],
  "price_range": "budget"
}
```

### 27. Update Venue
- **Method**: `PUT`
- **URL**: `/venues/{venueId}`
- **Authentication**: Required

### 28. Delete Venue
- **Method**: `DELETE`
- **URL**: `/venues/{venueId}`
- **Authentication**: Required

### 29. Activate/Deactivate Venue
- **Method**: `POST`
- **URLs**: 
  - `POST /venues/{venueId}/activate`
  - `POST /venues/{venueId}/deactivate`
- **Authentication**: Required

### 30. Get My Venues
- **Method**: `GET`
- **URL**: `/venues/my-venues`
- **Authentication**: Required

### 31. Upload Venue Logo
- **Method**: `POST`
- **URL**: `/venues/{venueId}/logo`
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`

### 32. Get/Update Operating Hours
- **Method**: `GET/PUT`
- **URLs**: 
  - `GET /venues/{venueId}/hours`
  - `PUT /venues/{venueId}/hours`
- **Authentication**: Required

### 33. Get Venue Analytics
- **Method**: `GET`
- **URL**: `/venues/{venueId}/analytics`
- **Authentication**: Required

## Menu Management Endpoints

### 34. Get Menu Categories
- **Method**: `GET`
- **URL**: `/menu/categories/{cafeId}`
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "category_123",
      "name": "Appetizers",
      "description": "Start your meal right",
      "venue_id": "venue_123",
      "order": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 35. Create Menu Category
- **Method**: `POST`
- **URL**: `/menu/categories`
- **Authentication**: Required
- **Request Body**:
```json
{
  "name": "New Category",
  "description": "Category description",
  "venue_id": "venue_123",
  "order": 5
}
```

### 36. Update Menu Category
- **Method**: `PUT`
- **URL**: `/menu/categories/{categoryId}`
- **Authentication**: Required

### 37. Delete Menu Category
- **Method**: `DELETE`
- **URL**: `/menu/categories/{categoryId}`
- **Authentication**: Required

### 38. Get Menu Items
- **Method**: `GET`
- **URL**: `/menu/items/{cafeId}?category={categoryId}&is_veg={bool}&available_only={bool}`
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "item_123",
      "name": "Margherita Pizza",
      "description": "Classic pizza with tomato, mozzarella, and basil",
      "price": 12.99,
      "category": "category_123",
      "venue_id": "venue_123",
      "image": "https://example.com/pizza.jpg",
      "is_available": true,
      "is_veg": true,
      "allergens": ["dairy", "gluten"],
      "preparation_time": 15,
      "ingredients": ["tomato", "mozzarella", "basil"],
      "order": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 39. Get Menu Item by ID
- **Method**: `GET`
- **URL**: `/menu/items/detail/{itemId}`
- **Authentication**: Required

### 40. Create Menu Item
- **Method**: `POST`
- **URL**: `/menu/items`
- **Authentication**: Required
- **Request Body**:
```json
{
  "name": "New Dish",
  "description": "Delicious new dish",
  "price": 15.99,
  "category": "category_123",
  "venue_id": "venue_123",
  "is_veg": false,
  "allergens": ["nuts"],
  "preparation_time": 20,
  "ingredients": ["chicken", "spices"]
}
```

### 41. Update Menu Item
- **Method**: `PUT`
- **URL**: `/menu/items/{itemId}`
- **Authentication**: Required

### 42. Delete Menu Item
- **Method**: `DELETE`
- **URL**: `/menu/items/{itemId}`
- **Authentication**: Required

### 43. Upload Menu Item Image
- **Method**: `POST`
- **URL**: `/menu/items/{itemId}/image`
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`

### 44. Reorder Menu Items
- **Method**: `POST`
- **URL**: `/menu/items/reorder`
- **Authentication**: Required
- **Request Body**:
```json
{
  "cafe_id": "venue_123",
  "item_orders": [
    {"id": "item_123", "order": 1},
    {"id": "item_124", "order": 2}
  ]
}
```

## Table Management Endpoints

### 45. Get Tables
- **Method**: `GET`
- **URL**: `/tables?venue_id={id}&status={status}&section={section}&floor={floor}&available_only={bool}`
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "table_123",
      "venue_id": "venue_123",
      "table_number": 1,
      "table_name": "Window Table",
      "capacity": 4,
      "table_status": "available",
      "qr_code": "QR_123",
      "qr_code_url": "https://example.com/qr/QR_123.png",
      "location": {
        "section": "Main Dining",
        "floor": "Ground",
        "position": "Near window",
        "coordinates": {"x": 100, "y": 200}
      },
      "features": ["window_view", "wheelchair_accessible"],
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 46. Get Table by ID
- **Method**: `GET`
- **URL**: `/tables/{tableId}`
- **Authentication**: Required

### 47. Get Venue Tables
- **Method**: `GET`
- **URL**: `/tables/venues/{venueId}/tables`
- **Authentication**: Required

### 48. Create Table
- **Method**: `POST`
- **URL**: `/tables`
- **Authentication**: Required
- **Request Body**:
```json
{
  "venue_id": "venue_123",
  "table_number": 5,
  "table_name": "Corner Table",
  "capacity": 2,
  "location": {
    "section": "Patio",
    "position": "Corner spot"
  },
  "features": ["outdoor", "quiet"]
}
```

### 49. Update Table
- **Method**: `PUT`
- **URL**: `/tables/{tableId}`
- **Authentication**: Required

### 50. Delete Table
- **Method**: `DELETE`
- **URL**: `/tables/{tableId}`
- **Authentication**: Required

### 51. Update Table Status
- **Method**: `PUT`
- **URL**: `/tables/{tableId}/status`
- **Authentication**: Required
- **Request Body**:
```json
{
  "status": "occupied"
}
```

### 52. Bulk Update Table Status
- **Method**: `PUT`
- **URL**: `/tables/bulk-status-update`
- **Authentication**: Required
- **Request Body**:
```json
{
  "updates": [
    {"table_id": "table_123", "status": "available"},
    {"table_id": "table_124", "status": "cleaning"}
  ]
}
```

### 53. Generate Table QR Code
- **Method**: `POST`
- **URL**: `/tables/{tableId}/generate-qr`
- **Authentication**: Required
- **Request Body**:
```json
{
  "logo_url": "https://example.com/logo.png",
  "primary_color": "#FF6B6B",
  "secondary_color": "#4ECDC4",
  "template": "modern"
}
```

### 54. Regenerate Table QR Code
- **Method**: `POST`
- **URL**: `/tables/{tableId}/regenerate-qr`
- **Authentication**: Required

### 55. Bulk Generate QR Codes
- **Method**: `POST`
- **URL**: `/tables/venues/{venueId}/bulk-generate-qr`
- **Authentication**: Required

### 56. Get Table Analytics
- **Method**: `GET`
- **URL**: `/tables/venues/{venueId}/analytics?start_date={date}&end_date={date}`
- **Authentication**: Required

### 57. Get Table Utilization
- **Method**: `GET`
- **URL**: `/tables/venues/{venueId}/utilization?date={date}`
- **Authentication**: Required

### 58. Get/Update Table Layout
- **Method**: `GET/PUT`
- **URLs**: 
  - `GET /tables/venues/{venueId}/layout`
  - `PUT /tables/venues/{venueId}/layout`
- **Authentication**: Required

## Order Management Endpoints

### 59. Get Orders
- **Method**: `GET`
- **URL**: `/orders?venue_id={id}&status={status}&payment_status={status}&order_type={type}&page={num}&page_size={num}`
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "order_123",
        "order_number": "ORD-20240101-001",
        "venue_id": "venue_123",
        "table_id": "table_123",
        "customer_id": "customer_123",
        "order_type": "dine_in",
        "items": [
          {
            "menu_item_id": "item_123",
            "menu_item_name": "Margherita Pizza",
            "quantity": 2,
            "unit_price": 12.99,
            "total_price": 25.98,
            "special_instructions": "Extra cheese"
          }
        ],
        "subtotal": 25.98,
        "tax_amount": 4.68,
        "total_amount": 30.66,
        "status": "confirmed",
        "payment_status": "paid",
        "payment_method": "card",
        "special_instructions": "Table by the window",
        "estimated_ready_time": "2024-01-01T12:30:00Z",
        "created_at": "2024-01-01T12:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "total_pages": 3
  }
}
```

### 60. Get Order by ID
- **Method**: `GET`
- **URL**: `/orders/{orderId}`
- **Authentication**: Required

### 61. Create Order
- **Method**: `POST`
- **URL**: `/orders`
- **Authentication**: Required
- **Request Body**:
```json
{
  "venue_id": "venue_123",
  "table_id": "table_123",
  "customer_id": "customer_123",
  "order_type": "dine_in",
  "items": [
    {
      "menu_item_id": "item_123",
      "quantity": 2,
      "special_instructions": "Extra spicy"
    }
  ],
  "special_instructions": "Rush order"
}
```

### 62. Create Public Order (QR Scan)
- **Method**: `POST`
- **URL**: `/orders/public/create-order`
- **Authentication**: None required
- **Request Body**:
```json
{
  "venue_id": "venue_123",
  "table_id": "table_123",
  "customer": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "items": [
    {
      "menu_item_id": "item_123",
      "quantity": 1
    }
  ],
  "order_type": "qr_scan",
  "estimated_guests": 2
}
```

### 63. Update Order
- **Method**: `PUT`
- **URL**: `/orders/{orderId}`
- **Authentication**: Required

### 64. Update Order Status
- **Method**: `PUT`
- **URL**: `/orders/{orderId}/status`
- **Authentication**: Required
- **Request Body**:
```json
{
  "status": "preparing"
}
```

### 65. Confirm Order
- **Method**: `POST`
- **URL**: `/orders/{orderId}/confirm?estimated_minutes={minutes}`
- **Authentication**: Required

### 66. Cancel Order
- **Method**: `POST`
- **URL**: `/orders/{orderId}/cancel?reason={reason}`
- **Authentication**: Required

### 67. Get Venue Orders
- **Method**: `GET`
- **URL**: `/orders/venues/{venueId}/orders?status={status}&limit={num}`
- **Authentication**: Required

### 68. Get Customer Orders
- **Method**: `GET`
- **URL**: `/orders/customers/{customerId}/orders?limit={num}`
- **Authentication**: Required

### 69. Get Order Analytics
- **Method**: `GET`
- **URL**: `/orders/venues/{venueId}/analytics?start_date={date}&end_date={date}`
- **Authentication**: Required

### 70. Get Live Order Status
- **Method**: `GET`
- **URL**: `/orders/venues/{venueId}/live`
- **Authentication**: Required

### 71. Access Menu by QR Code
- **Method**: `GET`
- **URL**: `/orders/public/qr/{qrCode}`
- **Authentication**: None required
- **Response**:
```json
{
  "success": true,
  "data": {
    "venue": {
      "id": "venue_123",
      "name": "Downtown Cafe",
      "description": "Cozy cafe",
      "is_active": true
    },
    "table": {
      "id": "table_123",
      "table_number": 1,
      "capacity": 4
    },
    "categories": [...],
    "items": [...],
    "is_open": true
  }
}
```

### 72. Check Venue Status
- **Method**: `GET`
- **URL**: `/orders/public/venue/{venueId}/status`
- **Authentication**: None required

### 73. Validate Order
- **Method**: `POST`
- **URL**: `/orders/public/validate-order`
- **Authentication**: None required
- **Request Body**:
```json
{
  "venue_id": "venue_123",
  "items": [
    {
      "menu_item_id": "item_123",
      "quantity": 2
    }
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "is_valid": true,
    "venue_open": true,
    "items_available": ["item_123"],
    "items_unavailable": [],
    "estimated_total": 25.98,
    "estimated_preparation_time": 15,
    "errors": []
  }
}
```

### 74. Track Order Status (Public)
- **Method**: `GET`
- **URL**: `/orders/public/{orderId}/status`
- **Authentication**: None required

### 75. Get Order Receipt
- **Method**: `GET`
- **URL**: `/orders/public/{orderId}/receipt`
- **Authentication**: None required

### 76. Submit Order Feedback
- **Method**: `POST`
- **URL**: `/orders/public/{orderId}/feedback?rating={rating}&feedback={text}`
- **Authentication**: None required

## QR Code Management Endpoints

### 77. Generate QR Code
- **Method**: `POST`
- **URL**: `/qr/generate`
- **Authentication**: Required
- **Request Body**:
```json
{
  "cafeId": "venue_123",
  "tableId": "table_123",
  "cafeName": "Downtown Cafe",
  "tableNumber": "1",
  "customization": {
    "logoUrl": "https://example.com/logo.png",
    "primaryColor": "#FF6B6B",
    "template": "modern"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "qr_123",
    "tableId": "table_123",
    "cafeId": "venue_123",
    "cafeName": "Downtown Cafe",
    "tableNumber": "1",
    "qrCodeUrl": "https://example.com/qr/qr_123.png",
    "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "menuUrl": "https://example.com/menu/venue_123/table_123",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 78. Get QR Code
- **Method**: `GET`
- **URL**: `/qr/{qrId}`
- **Authentication**: Required

### 79. Get Cafe QR Codes
- **Method**: `GET`
- **URL**: `/qr/cafe/{cafeId}`
- **Authentication**: Required

### 80. Regenerate QR Code
- **Method**: `PUT`
- **URL**: `/qr/{qrId}/regenerate`
- **Authentication**: Required

### 81. Delete QR Code
- **Method**: `DELETE`
- **URL**: `/qr/{qrId}`
- **Authentication**: Required

### 82. Generate QR Base64
- **Method**: `POST`
- **URL**: `/qr/generate-base64`
- **Authentication**: Required

### 83. Bulk Generate QR Codes
- **Method**: `POST`
- **URL**: `/qr/bulk-generate`
- **Authentication**: Required

### 84. Generate Print Template
- **Method**: `GET`
- **URL**: `/qr/{qrId}/print-template?template={template}`
- **Authentication**: Required

## Dashboard and Analytics Endpoints

### 85. Get Dashboard Data
- **Method**: `GET`
- **URL**: `/dashboard`
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "user_role": "admin",
    "workspace_id": "workspace_123",
    "venue_id": "venue_123",
    "summary": {
      "total_orders_today": 45,
      "total_revenue_today": 1250.50,
      "active_tables": 8,
      "pending_orders": 3
    },
    "recent_orders": [...],
    "active_orders": [...],
    "analytics": {...},
    "alerts": [
      {
        "type": "warning",
        "message": "Table 5 needs cleaning",
        "venue_id": "venue_123",
        "table_id": "table_5",
        "created_at": "2024-01-01T12:00:00Z"
      }
    ],
    "quick_actions": [
      {
        "label": "View Orders",
        "action": "view_orders",
        "icon": "orders"
      }
    ]
  }
}
```

### 86. Get Dashboard Summary
- **Method**: `GET`
- **URL**: `/dashboard/summary`
- **Authentication**: Required

### 87. Get Venue Analytics
- **Method**: `GET`
- **URL**: `/dashboard/analytics/venue/{venueId}?start_date={date}&end_date={date}`
- **Authentication**: Required

### 88. Get Workspace Analytics
- **Method**: `GET`
- **URL**: `/dashboard/analytics/workspace`
- **Authentication**: Required (SuperAdmin)

### 89. Get Live Orders
- **Method**: `GET`
- **URL**: `/dashboard/live/orders?venue_id={id}`
- **Authentication**: Required

### 90. Get Live Table Status
- **Method**: `GET`
- **URL**: `/dashboard/live/tables?venue_id={id}`
- **Authentication**: Required

### 91. Get Revenue Analytics
- **Method**: `GET`
- **URL**: `/analytics/revenue/{venueId}?period={daily|weekly|monthly}`
- **Authentication**: Required

### 92. Get Customer Analytics
- **Method**: `GET`
- **URL**: `/analytics/customers/{venueId}`
- **Authentication**: Required

### 93. Export Dashboard Data
- **Method**: `GET`
- **URL**: `/dashboard/export/{venueId}?format={csv|pdf|excel}`
- **Authentication**: Required
- **Response**: Binary file download

## User Roles and Permissions

### 94. Get Roles
- **Method**: `GET`
- **URL**: `/users/roles`
- **Authentication**: Required

### 95. Get Role by Name
- **Method**: `GET`
- **URL**: `/users/roles/{roleName}`
- **Authentication**: Required

### 96. Get Permissions
- **Method**: `GET`
- **URL**: `/users/permissions`
- **Authentication**: Required

### 97. Update User Role
- **Method**: `PUT`
- **URL**: `/users/{userId}/role`
- **Authentication**: Required (Admin)

## User Invitations

### 98. Send Invitation
- **Method**: `POST`
- **URL**: `/users/invitations`
- **Authentication**: Required (Admin)
- **Request Body**:
```json
{
  "email": "newuser@example.com",
  "role_name": "operator",
  "workspace_id": "workspace_123",
  "venue_id": "venue_123",
  "message": "Welcome to our team!"
}
```

### 99. Get Invitations
- **Method**: `GET`
- **URL**: `/users/invitations?workspace_id={id}&status={status}`
- **Authentication**: Required (Admin)

### 100. Cancel Invitation
- **Method**: `POST`
- **URL**: `/users/invitations/{invitationId}/cancel`
- **Authentication**: Required (Admin)

### 101. Resend Invitation
- **Method**: `POST`
- **URL**: `/users/invitations/{invitationId}/resend`
- **Authentication**: Required (Admin)

### 102. Accept Invitation (Public)
- **Method**: `POST`
- **URL**: `/users/invitations/accept/{token}`
- **Authentication**: None required
- **Request Body**:
```json
{
  "password": "newpassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

## Password Management

### 103. Request Password Reset
- **Method**: `POST`
- **URL**: `/users/password-reset-request`
- **Authentication**: None required
- **Request Body**:
```json
{
  "email": "user@example.com"
}
```

### 104. Reset Password
- **Method**: `POST`
- **URL**: `/users/password-reset`
- **Authentication**: None required
- **Request Body**:
```json
{
  "token": "reset_token_here",
  "new_password": "newpassword123"
}
```

## User Activity and Analytics

### 105. Get User Activity
- **Method**: `GET`
- **URL**: `/users/{userId}/activity?action={action}&resource_type={type}&start_date={date}&end_date={date}&limit={num}`
- **Authentication**: Required (Admin)

### 106. Get User Analytics
- **Method**: `GET`
- **URL**: `/users/{userId}/analytics?start_date={date}&end_date={date}`
- **Authentication**: Required (Admin)

## Health Check

### 107. Health Check
- **Method**: `GET`
- **URL**: `/health`
- **Authentication**: None required
- **Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "detail": "Additional error details"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Authentication

Most endpoints require authentication via Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens are obtained through the login endpoint and should be included in all authenticated requests.

## Rate Limiting

The API may implement rate limiting. Check response headers for rate limit information:
- `X-RateLimit-Limit` - Request limit per time window
- `X-RateLimit-Remaining` - Remaining requests in current window
- `X-RateLimit-Reset` - Time when the rate limit resets

## Pagination

Endpoints that return lists support pagination:
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "page_size": 20,
  "total_pages": 8
}
```

## File Uploads

File upload endpoints use `multipart/form-data`:
- Maximum file size: 10MB
- Supported formats: JPG, PNG, PDF (varies by endpoint)
- Files are uploaded in the `file` field of the form data

## WebSocket Endpoints (if implemented)

For real-time features, WebSocket connections may be available:
- **URL**: `ws://localhost:8000/ws/dashboard/{venueId}`
- **Authentication**: Token in query parameter or header
- **Events**: order_update, table_status_change, new_order

---

This documentation covers all API endpoints used by the frontend application. Ensure your backend implements these endpoints with the specified request/response formats for proper integration.