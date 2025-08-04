#!/bin/bash

# Script to fix user property references across the codebase
# This script updates all references to use the new utility functions

echo "🔧 Fixing user property references..."

# Function to add import if not exists
add_import_if_needed() {
    local file=$1
    local import_line="import { getUserFirstName, getUserLastName, getUserFullName, getUserWorkspaceId, getUserVenueId, getUserIsActive, getUserCreatedAt, getUserDateOfBirth, getUserIsVerified, getUserProfileImageUrl, getUserInitials } from '../../utils/userUtils';"
    
    if ! grep -q "getUserFirstName" "$file"; then
        # Find the last import line and add after it
        sed -i '' '/^import.*from/a\
'"$import_line"'
' "$file"
    fi
}

# Fix SuperAdminDashboard
if [ -f "src/components/dashboards/SuperAdminDashboard.tsx" ]; then
    echo "Fixing SuperAdminDashboard..."
    add_import_if_needed "src/components/dashboards/SuperAdminDashboard.tsx"
    sed -i '' 's/user?.firstName/getUserFirstName(user)/g' "src/components/dashboards/SuperAdminDashboard.tsx"
fi

# Fix Layout component
if [ -f "src/components/Layout.tsx" ]; then
    echo "Fixing Layout..."
    add_import_if_needed "src/components/Layout.tsx"
    sed -i '' 's/user.firstName/getUserFirstName(user)/g' "src/components/Layout.tsx"
fi

# Fix AppHeader
if [ -f "src/components/layout/AppHeader/index.tsx" ]; then
    echo "Fixing AppHeader..."
    add_import_if_needed "src/components/layout/AppHeader/index.tsx"
    sed -i '' 's/user.firstName/getUserFirstName(user)/g' "src/components/layout/AppHeader/index.tsx"
fi

echo "✅ User property references fixed!"