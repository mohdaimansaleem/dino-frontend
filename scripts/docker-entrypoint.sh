#!/bin/bash

# Docker Entrypoint Script
# Generates runtime configuration and starts nginx

set -e

echo "🚀 Starting Dino Frontend Container..."
echo "📅 Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "🐳 Container ID: $(hostname)"
echo "👤 User: $(whoami)"
echo ""

# Function to log environment variables
log_environment_variables() {
    echo "🔍 ENVIRONMENT VARIABLES AUDIT"
    echo "================================"
    
    # Define categories of environment variables
    local api_vars=(
        "API_BASE_URL"
        "WS_URL" 
        "BACKEND_URL"
        "API_TIMEOUT"
        "API_RATE_LIMIT"
    )
    
    local app_vars=(
        "APP_NAME"
        "APP_VERSION"
        "APP_ENV"
        "DEBUG_MODE"
    )
    
    local feature_vars=(
        "ENABLE_THEME_TOGGLE"
        "ENABLE_DEMO_MODE"
        "ENABLE_ANALYTICS"
        "ENABLE_QR_CODES"
        "ENABLE_NOTIFICATIONS"
        "ENABLE_I18N"
        "ENABLE_ANIMATIONS"
        "ENABLE_IMAGE_OPTIMIZATION"
        "ENABLE_SERVICE_WORKER"
    )
    
    local auth_vars=(
        "JWT_EXPIRY_HOURS"
        "SESSION_TIMEOUT_MINUTES"
        "MIN_PASSWORD_LENGTH"
    )
    
    local ui_vars=(
        "DEFAULT_THEME"
        "CHART_ANIMATION_INTERVAL"
        "CHART_ANIMATION_DURATION"
        "CHART_ANIMATION_EASING"
        "CHART_ANIMATIONS_ENABLED"
        "CHART_AUTO_REFRESH_ENABLED"
    )
    
    local logging_vars=(
        "LOG_LEVEL"
        "ENABLE_CONSOLE_LOGGING"
    )
    
    local dev_vars=(
        "ENABLE_HOT_RELOAD"
        "GENERATE_SOURCEMAP"
    )
    
    # Function to log a category of variables
    log_category() {
        local category_name="$1"
        local -n var_array=$2
        
        echo ""
        echo "📋 $category_name"
        echo "$(printf '─%.0s' {1..40})"
        
        local found_vars=0
        for var in "${var_array[@]}"; do
            if [ -n "${!var}" ]; then
                echo "  ✅ $var = ${!var}"
                found_vars=$((found_vars + 1))
            else
                echo "  ❌ $var = (not set)"
            fi
        done
        
        if [ $found_vars -eq 0 ]; then
            echo "  ⚠️  No variables set in this category"
        else
            echo "  📊 $found_vars/${#var_array[@]} variables set"
        fi
    }
    
    # Log each category
    log_category "API Configuration" api_vars
    log_category "App Configuration" app_vars
    log_category "Feature Flags" feature_vars
    log_category "Authentication" auth_vars
    log_category "UI Configuration" ui_vars
    log_category "Logging Configuration" logging_vars
    log_category "Development Settings" dev_vars
    
    # Log system environment variables
    echo ""
    echo "📋 System Environment"
    echo "$(printf '─%.0s' {1..40})"
    echo "  🐳 HOSTNAME = $(hostname)"
    echo "  🌍 PWD = $(pwd)"
    echo "  👤 USER = ${USER:-$(whoami)}"
    echo "  🕒 TZ = ${TZ:-UTC}"
    echo "  🔧 PATH = ${PATH:0:100}..."
    
    # Count total environment variables
    local total_env_vars=$(env | wc -l)
    local app_env_vars=$(env | grep -E "^(API_|APP_|ENABLE_|JWT_|SESSION_|MIN_|DEFAULT_|CHART_|LOG_|GENERATE_)" | wc -l)
    
    echo ""
    echo "📊 SUMMARY"
    echo "$(printf '─%.0s' {1..40})"
    echo "  🔢 Total environment variables: $total_env_vars"
    echo "  🎯 App-specific variables: $app_env_vars"
    echo "  📅 Audit completed at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo ""
}

# Log all environment variables
log_environment_variables

# Validate environment variables
echo "🔍 Validating environment variables..."
/usr/local/bin/validate-env.sh

# Generate runtime configuration from environment variables
echo "🔧 Generating runtime configuration..."
/usr/local/bin/generate-config.sh

echo ""
echo "🌐 Starting nginx..."

# Update nginx configuration with backend URL if provided
if [ -n "$BACKEND_URL" ]; then
    echo "🔗 Setting backend URL to: $BACKEND_URL"
    # Use envsubst to replace environment variables in nginx config
    envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf > /tmp/nginx.conf
    mv /tmp/nginx.conf /etc/nginx/conf.d/default.conf
else
    echo "ℹ️  Using default backend URL in nginx configuration"
fi

echo ""
echo "✅ Container startup complete!"
echo "🌍 Frontend available on port 8080"
echo "📋 Configuration endpoint: /config.js"
echo "🏥 Health check endpoint: /health"
echo ""

# Start nginx in foreground
exec nginx -g "daemon off;"