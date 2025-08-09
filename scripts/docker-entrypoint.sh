#!/bin/bash

# Simplified Docker Entrypoint Script
# Generates runtime configuration and starts nginx

set -e

echo "🚀 Starting Dino Frontend Container..."
echo "📅 Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "🐳 Container ID: $(hostname)"
echo "🌍 Environment: ${APP_ENV:-production}"
echo ""

# Validate environment variables
echo "🔍 Validating environment variables..."
if [ -f "/usr/local/bin/validate-env.sh" ]; then
    /usr/local/bin/validate-env.sh
else
    echo "⚠️ validate-env.sh not found, skipping validation"
fi

# Generate runtime configuration
echo ""
echo "🔧 Generating runtime configuration..."
if [ -f "/usr/local/bin/generate-config.sh" ]; then
    /usr/local/bin/generate-config.sh
else
    echo "❌ generate-config.sh not found"
    exit 1
fi

# Log key configuration
echo ""
echo "📋 Key Configuration"
echo "$(printf '─%.0s' {1..40})"
echo "🌍 Environment: ${APP_ENV:-production}"
echo "🔗 Backend URL: ${BACKEND_URL:-https://dino-backend-api-867506203789.us-central1.run.app}"
echo "🐛 Debug Mode: ${DEBUG_MODE:-false}"
echo "📊 Console Logging: ${ENABLE_CONSOLE_LOGGING:-false}"

echo ""
echo "✅ Container startup complete!"
echo "🌍 Frontend available on port 8080"
echo "📋 Configuration endpoint: /config.js"
echo "🏥 Health check endpoint: /health"
echo ""

# Start nginx in foreground
echo "🌐 Starting nginx..."
exec nginx -g "daemon off;"