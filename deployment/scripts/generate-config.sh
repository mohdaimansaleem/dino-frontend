#!/bin/bash

# Runtime Configuration Generator
# Generates runtime configuration for the frontend application

set -e

echo "🔧 Generating Runtime Configuration"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default values
DEFAULT_BACKEND_URL="https://dino-backend-api-867506203789.us-central1.run.app"
DEFAULT_WS_URL="wss://dino-backend-api-867506203789.us-central1.run.app"

# Set defaults if not provided
export BACKEND_URL="${BACKEND_URL:-$DEFAULT_BACKEND_URL}"
export WS_URL="${WS_URL:-$DEFAULT_WS_URL}"
export APP_ENV="${APP_ENV:-${NODE_ENV:-production}}"
export DEBUG_MODE="${DEBUG_MODE:-false}"
export ENABLE_ANALYTICS="${ENABLE_ANALYTICS:-true}"
export ENABLE_NOTIFICATIONS="${ENABLE_NOTIFICATIONS:-true}"
export ENABLE_QR_CODES="${ENABLE_QR_CODES:-true}"
export ENABLE_THEME_TOGGLE="${ENABLE_THEME_TOGGLE:-false}"
export ENABLE_ANIMATIONS="${ENABLE_ANIMATIONS:-true}"
export ENABLE_CONSOLE_LOGGING="${ENABLE_CONSOLE_LOGGING:-false}"
export API_TIMEOUT="${API_TIMEOUT:-30000}"
export API_RATE_LIMIT="${API_RATE_LIMIT:-100}"

print_status "Configuration values:"
echo "  Environment: $APP_ENV"
echo "  Backend URL: $BACKEND_URL"
echo "  WebSocket URL: $WS_URL"
echo "  Debug Mode: $DEBUG_MODE"
echo "  Analytics: $ENABLE_ANALYTICS"
echo "  Notifications: $ENABLE_NOTIFICATIONS"
echo "  QR Codes: $ENABLE_QR_CODES"
echo "  Theme Toggle: $ENABLE_THEME_TOGGLE"
echo "  Animations: $ENABLE_ANIMATIONS"
echo "  Console Logging: $ENABLE_CONSOLE_LOGGING"
echo ""

# Determine output directory
if [ -d "/usr/share/nginx/html" ]; then
    OUTPUT_DIR="/usr/share/nginx/html"
    print_status "Container environment detected"
elif [ -d "build" ]; then
    OUTPUT_DIR="build"
    print_status "Local build environment detected"
elif [ -d "public" ]; then
    OUTPUT_DIR="public"
    print_status "Development environment detected"
else
    OUTPUT_DIR="."
    print_warning "Unknown environment, using current directory"
fi

CONFIG_FILE="$OUTPUT_DIR/config.js"

print_status "Generating configuration file: $CONFIG_FILE"

# Generate the configuration file
cat > "$CONFIG_FILE" << EOF
// Runtime Configuration for Dino Frontend
// Generated at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
// Environment: $APP_ENV

window.DINO_CONFIG = {
  // Environment
  APP_ENV: '$APP_ENV',
  DEBUG_MODE: $DEBUG_MODE,
  
  // API Configuration
  API_BASE_URL: '$BACKEND_URL',
  BACKEND_URL: '$BACKEND_URL',
  WS_URL: '$WS_URL',
  API_TIMEOUT: $API_TIMEOUT,
  API_RATE_LIMIT: $API_RATE_LIMIT,
  
  // Feature Flags
  ENABLE_ANALYTICS: $ENABLE_ANALYTICS,
  ENABLE_NOTIFICATIONS: $ENABLE_NOTIFICATIONS,
  ENABLE_QR_CODES: $ENABLE_QR_CODES,
  ENABLE_THEME_TOGGLE: $ENABLE_THEME_TOGGLE,
  ENABLE_ANIMATIONS: $ENABLE_ANIMATIONS,
  ENABLE_CONSOLE_LOGGING: $ENABLE_CONSOLE_LOGGING,
  
  // Build Information
  BUILD_TIME: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")',
  VERSION: '1.0.0',
  
  // URLs
  HEALTH_CHECK_URL: '$BACKEND_URL/health',
  API_DOCS_URL: '$BACKEND_URL/docs',
  
  // Application Settings
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_TIMEZONE: 'Asia/Kolkata',
  
  // UI Settings
  THEME: {
    DEFAULT_MODE: 'light',
    ENABLE_DARK_MODE: $ENABLE_THEME_TOGGLE,
    ENABLE_ANIMATIONS: $ENABLE_ANIMATIONS
  },
  
  // Performance Settings
  LAZY_LOADING: true,
  PRELOAD_CRITICAL: true,
  CACHE_DURATION: 300000, // 5 minutes
  
  // Security Settings
  ENABLE_CSP: true,
  ENABLE_HTTPS_ONLY: $([ "$APP_ENV" = "production" ] && echo "true" || echo "false"),
  
  // Monitoring
  ENABLE_ERROR_REPORTING: $([ "$APP_ENV" = "production" ] && echo "true" || echo "false"),
  ENABLE_PERFORMANCE_MONITORING: $ENABLE_ANALYTICS,
  
  // Development Settings
  ENABLE_REDUX_DEVTOOLS: $([ "$DEBUG_MODE" = "true" ] && echo "true" || echo "false"),
  ENABLE_REACT_DEVTOOLS: $([ "$DEBUG_MODE" = "true" ] && echo "true" || echo "false"),
  SHOW_DEBUG_INFO: $([ "$DEBUG_MODE" = "true" ] && echo "true" || echo "false")
};

// Freeze the configuration to prevent runtime modifications
Object.freeze(window.DINO_CONFIG);

// Log configuration in debug mode
if (window.DINO_CONFIG.DEBUG_MODE || window.DINO_CONFIG.ENABLE_CONSOLE_LOGGING) {
  console.log('🔧 Dino Configuration Loaded:', window.DINO_CONFIG);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.DINO_CONFIG;
}
EOF

# Validate the generated file
if [ -f "$CONFIG_FILE" ]; then
    FILE_SIZE=$(wc -c < "$CONFIG_FILE")
    print_success "Configuration file generated successfully"
    print_status "File size: $FILE_SIZE bytes"
    print_status "Location: $CONFIG_FILE"
    
    # Validate JavaScript syntax
    if command -v node >/dev/null 2>&1; then
        if node -c "$CONFIG_FILE" 2>/dev/null; then
            print_success "JavaScript syntax validation passed"
        else
            print_error "JavaScript syntax validation failed"
            exit 1
        fi
    else
        print_warning "Node.js not available for syntax validation"
    fi
else
    print_error "Failed to generate configuration file"
    exit 1
fi

# Create a backup of the configuration
BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%s)"
cp "$CONFIG_FILE" "$BACKUP_FILE" 2>/dev/null || true

echo ""
print_success "✅ Runtime configuration generated successfully!"
print_status "Configuration is available at: $CONFIG_FILE"
print_status "Backup created at: $BACKUP_FILE"
echo ""

# Show configuration summary
print_status "Configuration Summary:"
echo "  🌍 Environment: $APP_ENV"
echo "  🔗 Backend: $BACKEND_URL"
echo "  🔌 WebSocket: $WS_URL"
echo "  🐛 Debug: $DEBUG_MODE"
echo "  📊 Analytics: $ENABLE_ANALYTICS"
echo "  🔔 Notifications: $ENABLE_NOTIFICATIONS"
echo "  📱 QR Codes: $ENABLE_QR_CODES"
echo "  🎨 Theme Toggle: $ENABLE_THEME_TOGGLE"
echo "  ✨ Animations: $ENABLE_ANIMATIONS"
echo ""