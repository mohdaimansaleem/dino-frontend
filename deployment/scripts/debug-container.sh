#!/bin/bash



# Container Debug Script

# Run this inside the container to diagnose nginx issues



echo "🔍 Container Debug Information"

echo "$(printf '═%.0s' {1..50})"

echo ""



echo "📋 Environment Variables"

echo "$(printf '─%.0s' {1..30})"

echo "BACKEND_URL: ${BACKEND_URL:-NOT SET}"

echo "API_BASE_URL: ${API_BASE_URL:-NOT SET}"

echo "WS_URL: ${WS_URL:-NOT SET}"

echo "APP_ENV: ${APP_ENV:-NOT SET}"

echo ""



echo "📋 Nginx Configuration"

echo "$(printf '─%.0s' {1..30})"

echo "Active nginx config file:"

if [ -f "/etc/nginx/nginx.conf" ]; then

  echo "✅ /etc/nginx/nginx.conf exists"

  echo ""

  echo "Proxy configuration:"

  grep -n "proxy_pass" /etc/nginx/nginx.conf || echo "❌ No proxy_pass found"

  echo ""

  echo "Listen configuration:"

  grep -n "listen" /etc/nginx/nginx.conf || echo "❌ No listen directive found"

else

  echo "❌ /etc/nginx/nginx.conf NOT FOUND"

fi

echo ""



echo "📋 Nginx Process Status"

echo "$(printf '─%.0s' {1..30})"

if pgrep nginx > /dev/null; then

  echo "✅ Nginx is running"

  echo "Nginx processes:"

  ps aux | grep nginx | grep -v grep

else

  echo "❌ Nginx is NOT running"

fi

echo ""



echo "📋 Port Status"

echo "$(printf '─%.0s' {1..30})"

if netstat -ln 2>/dev/null | grep -q ":8080"; then

  echo "✅ Port 8080 is listening"

else

  echo "❌ Port 8080 is NOT listening"

fi

echo ""



echo "📋 File System Check"

echo "$(printf '─%.0s' {1..30})"

echo "Static files:"

if [ -d "/usr/share/nginx/html" ]; then

  echo "✅ /usr/share/nginx/html exists"

  echo "Contents:"

  ls -la /usr/share/nginx/html/ | head -10

else

  echo "❌ /usr/share/nginx/html NOT FOUND"

fi

echo ""



echo "📋 Configuration Files"

echo "$(printf '─%.0s' {1..30})"

echo "Available config files:"

find /etc/nginx -name "*.conf*" -type f 2>/dev/null || echo "No config files found"

echo ""



echo "📋 Recent Logs"

echo "$(printf '─%.0s' {1..30})"

echo "Last 10 lines of error log:"

if [ -f "/var/log/nginx/error.log" ]; then

  tail -10 /var/log/nginx/error.log

else

  echo "❌ Error log not found"

fi

echo ""



echo "Last 5 lines of access log:"

if [ -f "/var/log/nginx/access.log" ]; then

  tail -5 /var/log/nginx/access.log

else

  echo "❌ Access log not found"

fi

echo ""



echo "📋 Connectivity Test"

echo "$(printf '─%.0s' {1..30})"

echo "Testing backend connectivity:"

if command -v curl >/dev/null 2>&1; then

  if [ -n "$BACKEND_URL" ]; then

    echo "Testing: $BACKEND_URL/api/health"

    curl -s -w "HTTP Status: %{http_code}\nTime: %{time_total}s\n" "$BACKEND_URL/api/health" -o /dev/null || echo "❌ Connection failed"

  else

    echo "⚠️ BACKEND_URL not set, testing default"

    curl -s -w "HTTP Status: %{http_code}\nTime: %{time_total}s\n" "https://dino-backend-867506203789.us-central1.run.app/api/health" -o /dev/null || echo "❌ Connection failed"

  fi

else

  echo "❌ curl not available"

fi

echo ""



echo "📋 Quick Fixes"

echo "$(printf '─%.0s' {1..30})"

echo "To test nginx config: nginx -t"

echo "To reload nginx: nginx -s reload"

echo "To restart nginx: nginx -s stop && nginx"

echo "To view live logs: tail -f /var/log/nginx/error.log"

echo ""



echo "🔧 Configuration Test"

echo "$(printf '─%.0s' {1..30})"

if nginx -t 2>/dev/null; then

  echo "✅ Nginx configuration is valid"

else

  echo "❌ Nginx configuration has errors:"

  nginx -t

fi