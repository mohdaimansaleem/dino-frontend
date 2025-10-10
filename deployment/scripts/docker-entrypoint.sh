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

# Set default backend URL if not provided
export BACKEND_URL="${BACKEND_URL:-https://dino-backend-867506203789.us-central1.run.app}"
echo "🔗 Using Backend URL: ${BACKEND_URL}"

if [ -f "/etc/nginx/nginx.conf.template" ]; then
    echo "📄 Processing nginx template..."
    
    # Substitute environment variables in nginx template
    envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /tmp/nginx.conf.processed
    
    # Verify substitution worked
    if grep -q "\${BACKEND_URL}" /tmp/nginx.conf.processed; then
        echo "❌ Template substitution failed - variables still present"
        echo "🔄 Using static configuration instead"
        cp /etc/nginx/nginx.conf /tmp/nginx.conf.processed
    else
        echo "✅ Template substitution successful"
    fi
    
    # Validate the generated configuration
    if nginx -t -c /tmp/nginx.conf.processed 2>/dev/null; then
        echo "✅ Generated nginx configuration is valid"
        cp /tmp/nginx.conf.processed /etc/nginx/nginx.conf
    else
        echo "❌ Generated nginx configuration is invalid"
        echo "🔄 Using static fallback configuration"
        # Ensure we have a working config
        if [ ! -f "/etc/nginx/nginx.conf" ] || ! nginx -t -c /etc/nginx/nginx.conf 2>/dev/null; then
            echo "📝 Creating minimal working configuration"
            cat > /etc/nginx/nginx.conf << EOF
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 8080;
        root /usr/share/nginx/html;
        index index.html;
        
        location /health {
            return 200 '{"status":"healthy"}';
            add_header Content-Type application/json;
        }
        
        location /config.js {
            expires 1m;
            add_header Content-Type application/javascript;
        }
        
        location /nginx-debug {
            return 200 'Nginx minimal config. Backend: ${BACKEND_URL}';
            add_header Content-Type text/plain;
        }
        
        location /api/ {
            proxy_pass ${BACKEND_URL}/api/;
            proxy_set_header Host dino-backend-867506203789.us-central1.run.app;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_set_header X-Original-URI \$request_uri;
            proxy_method \$request_method;
            proxy_pass_request_headers on;
            proxy_pass_request_body on;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
            
            if (\$request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin \$http_origin always;
                add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
                add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
                add_header Access-Control-Allow-Credentials true always;
                add_header Content-Length 0;
                add_header Content-Type text/plain;
                return 204;
            }
            
            add_header Access-Control-Allow-Origin \$http_origin always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
            add_header Access-Control-Allow-Credentials true always;
            add_header X-Proxy-Backend "${BACKEND_URL}" always;
            add_header X-Proxy-Method \$request_method always;
        }
        
        location /ws/ {
            proxy_pass ${BACKEND_URL};
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host dino-backend-867506203789.us-central1.run.app;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        location / {
            try_files \$uri \$uri/ /index.html;
        }
    }
}
EOF
        fi
    fi
    
    # Clean up temp file
    rm -f /tmp/nginx.conf.processed
else
    echo "⚠️ nginx.conf.template not found"
    echo "🔍 Checking if static nginx.conf exists and is valid..."
    
    if [ -f "/etc/nginx/nginx.conf" ]; then
        if nginx -t -c /etc/nginx/nginx.conf 2>/dev/null; then
            echo "✅ Using existing static nginx.conf"
        else
            echo "❌ Existing nginx.conf is invalid, creating minimal config"
            # Create minimal working config as fallback
            cat > /etc/nginx/nginx.conf << EOF
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 8080;
        root /usr/share/nginx/html;
        index index.html;
        
        location /health {
            return 200 '{"status":"healthy"}';
            add_header Content-Type application/json;
        }
        
        location /config.js {
            expires 1m;
            add_header Content-Type application/javascript;
        }
        
        location /api/ {
            proxy_pass ${BACKEND_URL};
            proxy_set_header Host dino-backend-867506203789.us-central1.run.app;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_set_header X-Original-URI \$request_uri;
            proxy_method \$request_method;
            proxy_pass_request_headers on;
            proxy_pass_request_body on;
            
            if (\$request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin \$http_origin always;
                add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
                add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
                add_header Access-Control-Allow-Credentials true always;
                add_header Content-Length 0;
                add_header Content-Type text/plain;
                return 204;
            }
            
            add_header Access-Control-Allow-Origin \$http_origin always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
            add_header Access-Control-Allow-Credentials true always;
        }
        
        location / {
            try_files \$uri \$uri/ /index.html;
        }
    }
}
EOF
        fi
    else
        echo "❌ No nginx configuration found, creating minimal config"
        # Create minimal working config
        cat > /etc/nginx/nginx.conf << EOF
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 8080;
        root /usr/share/nginx/html;
        index index.html;
        
        location /health {
            return 200 '{"status":"healthy"}';
            add_header Content-Type application/json;
        }
        
        location /config.js {
            expires 1m;
            add_header Content-Type application/javascript;
        }
        
        location /api/ {
            proxy_pass ${BACKEND_URL}/;
            proxy_set_header Host dino-backend-867506203789.us-central1.run.app;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_set_header X-Original-URI \$request_uri;
            proxy_method \$request_method;
            proxy_pass_request_headers on;
            proxy_pass_request_body on;
            
            if (\$request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin \$http_origin always;
                add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
                add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
                add_header Access-Control-Allow-Credentials true always;
                add_header Content-Length 0;
                add_header Content-Type text/plain;
                return 204;
            }
            
            add_header Access-Control-Allow-Origin \$http_origin always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
            add_header Access-Control-Allow-Credentials true always;
        }
        
        location / {
            try_files \$uri \$uri/ /index.html;
        }
    }
}
EOF
    fi
fi

# Final validation
echo "🔍 Final nginx configuration validation..."
if nginx -t; then
    echo "✅ Nginx configuration is ready"
    echo "📄 Active proxy configuration:"
    grep -n "proxy_pass" /etc/nginx/nginx.conf || echo "   No proxy_pass directives found"
else
    echo "❌ Final nginx configuration is still invalid"
    echo "🆘 This is a critical error - nginx may not start properly"
fi

# Log key configuration
echo ""
echo "📋 Key Configuration"
echo "$(printf '─%.0s' {1..40})"
echo "🌍 Environment: ${APP_ENV:-production}"
echo "🔗 Backend URL: ${BACKEND_URL:-https://dino-backend-867506203789.us-central1.run.app}"
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