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



# Process nginx configuration template

echo ""

echo "🔧 Processing nginx configuration template..."

if [ -f "/etc/nginx/nginx.conf.template" ]; then

  # Set default backend URL if not provided

  export BACKEND_URL="${BACKEND_URL:-https://dino-backend-api-867506203789.us-central1.run.app}"

   

  # Substitute environment variables in nginx template

  envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

  echo "✅ Nginx configuration generated from template"

  echo "🔗 Backend URL: ${BACKEND_URL}"

   

  # Validate the generated configuration

  if nginx -t -c /etc/nginx/nginx.conf; then

    echo "✅ Nginx configuration is valid"

  else

    echo "❌ Nginx configuration is invalid, using fallback"

    cp /etc/nginx/conf.d/default.conf /etc/nginx/nginx.conf

  fi

else

  echo "⚠️ nginx.conf.template not found, using existing nginx.conf"

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