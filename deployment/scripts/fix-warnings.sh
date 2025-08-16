#!/bin/bash

# Fix all ESLint warnings in the project

echo "🔧 Fixing ESLint warnings..."

# Fix OrderTrackingPage.tsx
sed -i '' 's/const isMobile = useMediaQuery/\/\/ const isMobile = useMediaQuery/' src/pages/OrderTrackingPage.tsx
sed -i '' 's/const isSmallScreen = useMediaQuery/\/\/ const isSmallScreen = useMediaQuery/' src/pages/OrderTrackingPage.tsx

# Fix RegistrationPage.tsx escape characters
sed -i '' 's/\\\\\\[/[/g' src/pages/RegistrationPage.tsx
sed -i '' 's/\\\\\\//\//g' src/pages/RegistrationPage.tsx

# Fix MenuManagement.tsx
sed -i '' 's/MenuItem, MenuCategory/\/\/ MenuItem, MenuCategory/' src/pages/admin/MenuManagement.tsx
sed -i '' 's/useEffect(\[/useEffect([getMenuItems], [getMenuItems/' src/pages/admin/MenuManagement.tsx

# Fix OrdersManagement.tsx
sed -i '' 's/Divider,/\/\/ Divider,/' src/pages/admin/OrdersManagement.tsx
sed -i '' 's/Edit,/\/\/ Edit,/' src/pages/admin/OrdersManagement.tsx
sed -i '' 's/Print,/\/\/ Print,/' src/pages/admin/OrdersManagement.tsx
sed -i '' 's/PaymentStatus, PaymentMethod/\/\/ PaymentStatus, PaymentMethod/' src/pages/admin/OrdersManagement.tsx
sed -i '' 's/ORDER_STATUS,/\/\/ ORDER_STATUS,/' src/pages/admin/OrdersManagement.tsx
sed -i '' 's/ORDER_STATUS_COLORS,/\/\/ ORDER_STATUS_COLORS,/' src/pages/admin/OrdersManagement.tsx
sed -i '' 's/PAYMENT_STATUS,/\/\/ PAYMENT_STATUS,/' src/pages/admin/OrdersManagement.tsx
sed -i '' 's/PAYMENT_METHODS,/\/\/ PAYMENT_METHODS,/' src/pages/admin/OrdersManagement.tsx
sed -i '' 's/PAGE_TITLES,/\/\/ PAGE_TITLES,/' src/pages/admin/OrdersManagement.tsx
sed -i '' 's/PLACEHOLDERS,/\/\/ PLACEHOLDERS,/' src/pages/admin/OrdersManagement.tsx
sed -i '' 's/userDataLoading,/\/\/ userDataLoading,/' src/pages/admin/OrdersManagement.tsx

# Fix TableManagement.tsx
sed -i '' 's/useEffect(\[/useEffect([getTables], [getTables/' src/pages/admin/TableManagement.tsx

# Fix UserManagement.tsx
sed -i '' 's/Paper,/\/\/ Paper,/' src/pages/admin/UserManagement.tsx
sed -i '' 's/Tooltip,/\/\/ Tooltip,/' src/pages/admin/UserManagement.tsx
sed -i '' 's/Person,/\/\/ Person,/' src/pages/admin/UserManagement.tsx
sed -i '' 's/Email,/\/\/ Email,/' src/pages/admin/UserManagement.tsx
sed -i '' 's/Phone,/\/\/ Phone,/' src/pages/admin/UserManagement.tsx
sed -i '' 's/Security,/\/\/ Security,/' src/pages/admin/UserManagement.tsx
sed -i '' 's/Visibility,/\/\/ Visibility,/' src/pages/admin/UserManagement.tsx
sed -i '' 's/PermissionService,/\/\/ PermissionService,/' src/pages/admin/UserManagement.tsx
sed -i '' 's/STORAGE_KEYS,/\/\/ STORAGE_KEYS,/' src/pages/admin/UserManagement.tsx
sed -i '' 's/currentUser, getUserWithRole/\/\/ currentUser, getUserWithRole/' src/pages/admin/UserManagement.tsx
sed -i '' 's/hasUserDataPermission/\/\/ hasUserDataPermission/' src/pages/admin/UserManagement.tsx
sed -i '' 's/showPermissions, setShowPermissions/\/\/ showPermissions, setShowPermissions/' src/pages/admin/UserManagement.tsx
sed -i '' 's/useEffect(\[/useEffect([loadUsers], [loadUsers/' src/pages/admin/UserManagement.tsx
sed -i '' 's/workspace =/\/\/ workspace =/' src/pages/admin/UserManagement.tsx

echo "✅ Fixed ESLint warnings"