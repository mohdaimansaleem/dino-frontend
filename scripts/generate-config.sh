#!/bin/bash



# Generate Runtime Configuration Script

# Creates config.js file from environment variables for runtime configuration



set -e



echo "🔧 Generating runtime configuration..."



# Define the config file path

CONFIG_FILE="/usr/share/nginx/html/config.js"



# Log current environment for debugging

echo "📋 Current environment variables:"

echo " API_BASE_URL: ${API_BASE_URL:-/api/v1}"

echo " WS_URL: ${WS_URL:-/ws}"

echo " BACKEND_URL: ${BACKEND_URL:-https://dino-backend-api-867506203789.us-central1.run.app}"

echo " APP_ENV: ${APP_ENV:-production}"



# Create the config.js file with environment variables

cat > "$CONFIG_FILE" << EOF

// Runtime Configuration

// This file is generated at container startup from environment variables

window.APP_CONFIG = {

 // API Configuration - Use relative URLs for nginx proxy routing

 API_BASE_URL: "${API_BASE_URL:-/api/v1}",

 WS_URL: "${WS_URL:-/ws}",

 BACKEND_URL: "${BACKEND_URL:-https://dino-backend-api-867506203789.us-central1.run.app}",

  

 // App Configuration

 APP_NAME: "${APP_NAME:-Dino}",

 APP_VERSION: "${APP_VERSION:-1.0.0}",

 APP_ENV: "${APP_ENV:-production}",

  

 // Feature Flags

 DEBUG_MODE: ${DEBUG_MODE:-false},

 ENABLE_THEME_TOGGLE: ${ENABLE_THEME_TOGGLE:-false},

 ENABLE_DEMO_MODE: ${ENABLE_DEMO_MODE:-false},

 ENABLE_ANALYTICS: ${ENABLE_ANALYTICS:-true},

 ENABLE_QR_CODES: ${ENABLE_QR_CODES:-true},

 ENABLE_NOTIFICATIONS: ${ENABLE_NOTIFICATIONS:-true},

 ENABLE_I18N: ${ENABLE_I18N:-false},

 ENABLE_ANIMATIONS: ${ENABLE_ANIMATIONS:-true},

 ENABLE_IMAGE_OPTIMIZATION: ${ENABLE_IMAGE_OPTIMIZATION:-true},

 ENABLE_SERVICE_WORKER: ${ENABLE_SERVICE_WORKER:-true},

  

 // API Configuration

 API_TIMEOUT: ${API_TIMEOUT:-30000},

 API_RATE_LIMIT: ${API_RATE_LIMIT:-100},

  

 // Authentication

 JWT_EXPIRY_HOURS: ${JWT_EXPIRY_HOURS:-24},

 SESSION_TIMEOUT_MINUTES: ${SESSION_TIMEOUT_MINUTES:-60},

 MIN_PASSWORD_LENGTH: ${MIN_PASSWORD_LENGTH:-8},

  

 // UI Configuration

 DEFAULT_THEME: "${DEFAULT_THEME:-light}",

  

 // Logging

 LOG_LEVEL: "${LOG_LEVEL:-warn}",

 ENABLE_CONSOLE_LOGGING: ${ENABLE_CONSOLE_LOGGING:-false},

  

 // Development Settings

 ENABLE_HOT_RELOAD: ${ENABLE_HOT_RELOAD:-false},

 GENERATE_SOURCEMAP: ${GENERATE_SOURCEMAP:-false}

};



// Log configuration load

console.log('✅ Runtime configuration loaded from environment variables');

EOF



echo "✅ Runtime configuration generated at $CONFIG_FILE"



# Verify the file was created

if [ -f "$CONFIG_FILE" ]; then

  echo "📄 Config file size: $(wc -c < "$CONFIG_FILE") bytes"

else

  echo "❌ Failed to create config file"

  exit 1

fi