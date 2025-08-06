#!/bin/bash

# Generate Runtime Configuration Script
# This script generates config.js from environment variables at container startup

set -e

echo "🔧 RUNTIME CONFIGURATION GENERATION"
echo "===================================="
echo "📅 Started at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

# Default values
DEFAULT_API_BASE_URL="/api/v1"
DEFAULT_WS_URL="/ws"
DEFAULT_BACKEND_URL="https://dino-backend-api-867506203789.us-central1.run.app"
DEFAULT_APP_NAME="Dino"
DEFAULT_APP_VERSION="1.0.0"
DEFAULT_APP_ENV="production"

# Function to get environment variable with default
get_env_var() {
    local var_name=$1
    local default_value=$2
    echo "${!var_name:-$default_value}"
}

# Function to convert string to boolean
to_boolean() {
    local value=$1
    if [[ "$value" == "true" || "$value" == "1" || "$value" == "yes" ]]; then
        echo "true"
    else
        echo "false"
    fi
}

# Function to convert string to number
to_number() {
    local value=$1
    local default=$2
    if [[ "$value" =~ ^[0-9]+$ ]]; then
        echo "$value"
    else
        echo "$default"
    fi
}

# Log configuration values being used
echo "📋 Configuration Values Being Applied:"
echo "$(printf '─%.0s' {1..50})"
echo "  API_BASE_URL: $(get_env_var "API_BASE_URL" "$DEFAULT_API_BASE_URL")"
echo "  WS_URL: $(get_env_var "WS_URL" "$DEFAULT_WS_URL")"
echo "  BACKEND_URL: $(get_env_var "BACKEND_URL" "$DEFAULT_BACKEND_URL")"
echo "  APP_NAME: $(get_env_var "APP_NAME" "$DEFAULT_APP_NAME")"
echo "  APP_VERSION: $(get_env_var "APP_VERSION" "$DEFAULT_APP_VERSION")"
echo "  APP_ENV: $(get_env_var "APP_ENV" "$DEFAULT_APP_ENV")"
echo "  DEBUG_MODE: $(to_boolean "$(get_env_var "DEBUG_MODE" "false")")"
echo "  ENABLE_ANALYTICS: $(to_boolean "$(get_env_var "ENABLE_ANALYTICS" "true")")"
echo "  API_TIMEOUT: $(to_number "$(get_env_var "API_TIMEOUT" "30000")" "30000")"
echo ""

# Generate config.js file
echo "📝 Writing configuration to /usr/share/nginx/html/config.js..."
cat > /usr/share/nginx/html/config.js << EOF
// Runtime Configuration
// Generated at container startup from environment variables
// Generated at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

window.APP_CONFIG = {
  // API Configuration
  API_BASE_URL: '$(get_env_var "API_BASE_URL" "$DEFAULT_API_BASE_URL")',
  WS_URL: '$(get_env_var "WS_URL" "$DEFAULT_WS_URL")',
  BACKEND_URL: '$(get_env_var "BACKEND_URL" "$DEFAULT_BACKEND_URL")',
  
  // App Configuration
  APP_NAME: '$(get_env_var "APP_NAME" "$DEFAULT_APP_NAME")',
  APP_VERSION: '$(get_env_var "APP_VERSION" "$DEFAULT_APP_VERSION")',
  APP_ENV: '$(get_env_var "APP_ENV" "$DEFAULT_APP_ENV")',
  
  // Feature Flags
  DEBUG_MODE: $(to_boolean "$(get_env_var "DEBUG_MODE" "false")"),
  ENABLE_THEME_TOGGLE: $(to_boolean "$(get_env_var "ENABLE_THEME_TOGGLE" "false")"),
  ENABLE_DEMO_MODE: $(to_boolean "$(get_env_var "ENABLE_DEMO_MODE" "false")"),
  ENABLE_ANALYTICS: $(to_boolean "$(get_env_var "ENABLE_ANALYTICS" "true")"),
  ENABLE_QR_CODES: $(to_boolean "$(get_env_var "ENABLE_QR_CODES" "true")"),
  ENABLE_NOTIFICATIONS: $(to_boolean "$(get_env_var "ENABLE_NOTIFICATIONS" "true")"),
  ENABLE_I18N: $(to_boolean "$(get_env_var "ENABLE_I18N" "false")"),
  ENABLE_ANIMATIONS: $(to_boolean "$(get_env_var "ENABLE_ANIMATIONS" "true")"),
  ENABLE_IMAGE_OPTIMIZATION: $(to_boolean "$(get_env_var "ENABLE_IMAGE_OPTIMIZATION" "true")"),
  ENABLE_SERVICE_WORKER: $(to_boolean "$(get_env_var "ENABLE_SERVICE_WORKER" "true")"),
  
  // API Configuration
  API_TIMEOUT: $(to_number "$(get_env_var "API_TIMEOUT" "30000")" "30000"),
  API_RATE_LIMIT: $(to_number "$(get_env_var "API_RATE_LIMIT" "100")" "100"),
  
  // Authentication
  JWT_EXPIRY_HOURS: $(to_number "$(get_env_var "JWT_EXPIRY_HOURS" "24")" "24"),
  SESSION_TIMEOUT_MINUTES: $(to_number "$(get_env_var "SESSION_TIMEOUT_MINUTES" "60")" "60"),
  MIN_PASSWORD_LENGTH: $(to_number "$(get_env_var "MIN_PASSWORD_LENGTH" "8")" "8"),
  
  // UI Configuration
  DEFAULT_THEME: '$(get_env_var "DEFAULT_THEME" "light")',
  
  // Chart Configuration
  CHART_ANIMATION_INTERVAL: $(to_number "$(get_env_var "CHART_ANIMATION_INTERVAL" "30000")" "30000"),
  CHART_ANIMATION_DURATION: $(to_number "$(get_env_var "CHART_ANIMATION_DURATION" "1000")" "1000"),
  CHART_ANIMATION_EASING: '$(get_env_var "CHART_ANIMATION_EASING" "easeInOutQuart")',
  CHART_ANIMATIONS_ENABLED: $(to_boolean "$(get_env_var "CHART_ANIMATIONS_ENABLED" "true")"),
  CHART_AUTO_REFRESH_ENABLED: $(to_boolean "$(get_env_var "CHART_AUTO_REFRESH_ENABLED" "true")"),
  
  // Logging
  LOG_LEVEL: '$(get_env_var "LOG_LEVEL" "info")',
  ENABLE_CONSOLE_LOGGING: $(to_boolean "$(get_env_var "ENABLE_CONSOLE_LOGGING" "false")"),
  
  // Development Settings
  ENABLE_HOT_RELOAD: $(to_boolean "$(get_env_var "ENABLE_HOT_RELOAD" "false")"),
  GENERATE_SOURCEMAP: $(to_boolean "$(get_env_var "GENERATE_SOURCEMAP" "false")")
};

// Log configuration for debugging
if (window.APP_CONFIG.DEBUG_MODE || window.APP_CONFIG.APP_ENV === 'development') {
  console.log('🔧 Runtime Configuration Loaded:', window.APP_CONFIG);
}
EOF

# Verify config file was created
if [ -f "/usr/share/nginx/html/config.js" ]; then
    echo "✅ Configuration file created successfully!"
    echo "📍 Location: /usr/share/nginx/html/config.js"
    echo "📏 File size: $(stat -c%s /usr/share/nginx/html/config.js) bytes"
else
    echo "❌ ERROR: Configuration file was not created!"
    exit 1
fi

# Show final configuration summary
echo ""
echo "📊 FINAL CONFIGURATION SUMMARY"
echo "$(printf '─%.0s' {1..50})"
echo "  🌐 API Base URL: $(get_env_var "API_BASE_URL" "$DEFAULT_API_BASE_URL")"
echo "  🔌 WebSocket URL: $(get_env_var "WS_URL" "$DEFAULT_WS_URL")"
echo "  🖥️  Backend URL: $(get_env_var "BACKEND_URL" "$DEFAULT_BACKEND_URL")"
echo "  📱 App Name: $(get_env_var "APP_NAME" "$DEFAULT_APP_NAME")"
echo "  🏷️  App Version: $(get_env_var "APP_VERSION" "$DEFAULT_APP_VERSION")"
echo "  🌍 Environment: $(get_env_var "APP_ENV" "$DEFAULT_APP_ENV")"
echo "  🐛 Debug Mode: $(to_boolean "$(get_env_var "DEBUG_MODE" "false")")"
echo "  ⏱️  API Timeout: $(to_number "$(get_env_var "API_TIMEOUT" "30000")" "30000")ms"
echo "  🎨 Default Theme: $(get_env_var "DEFAULT_THEME" "light")"
echo ""

# Log environment variable sources
echo "📋 ENVIRONMENT VARIABLE SOURCES"
echo "$(printf '─%.0s' {1..50})"

check_env_source() {
    local var_name=$1
    local default_value=$2
    local current_value=$(get_env_var "$var_name" "$default_value")
    
    if [ -n "${!var_name}" ]; then
        echo "  ✅ $var_name: FROM ENVIRONMENT"
    else
        echo "  🔧 $var_name: FROM DEFAULT ($default_value)"
    fi
}

check_env_source "API_BASE_URL" "$DEFAULT_API_BASE_URL"
check_env_source "BACKEND_URL" "$DEFAULT_BACKEND_URL"
check_env_source "APP_ENV" "$DEFAULT_APP_ENV"
check_env_source "DEBUG_MODE" "false"

echo ""
echo "✅ Runtime configuration generation completed!"
echo "📅 Completed at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""