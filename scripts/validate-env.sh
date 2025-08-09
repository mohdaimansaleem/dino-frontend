#!/bin/bash

# Environment Validation Script
# Validates required environment variables for production deployment

set -e

echo "🔍 Validating environment variables..."

# Track validation status
VALIDATION_PASSED=true
ERRORS=()

# Function to check required variable
check_required() {
    local var_name="$1"
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        ERRORS+=("❌ $var_name is not set")
        VALIDATION_PASSED=false
    else
        echo "✅ $var_name is set"
    fi
}

# Function to check URL format
check_url() {
    local var_name="$1"
    local var_value="${!var_name}"
    
    if [ -n "$var_value" ]; then
        if [[ "$var_value" =~ ^https?:// ]]; then
            echo "✅ $var_name has valid URL format"
        else
            ERRORS+=("❌ $var_name must start with http:// or https://")
            VALIDATION_PASSED=false
        fi
    fi
}

# Function to check production readiness
check_production() {
    local var_name="$1"
    local var_value="${!var_name}"
    local default_value="$2"
    
    if [ "$APP_ENV" = "production" ] && [ "$var_value" = "$default_value" ]; then
        ERRORS+=("⚠️ $var_name is using default value in production")
        VALIDATION_PASSED=false
    fi
}

echo ""
echo "📋 Required Variables"
echo "$(printf '─%.0s' {1..40})"

# Check required environment variables
check_required "BACKEND_URL"

echo ""
echo "📋 URL Validation"
echo "$(printf '─%.0s' {1..40})"

# Validate URL formats
check_url "BACKEND_URL"
check_url "API_BASE_URL"

echo ""
echo "📋 Production Readiness"
echo "$(printf '─%.0s' {1..40})"

# Check production-specific settings
if [ "$APP_ENV" = "production" ]; then
    # Check for localhost in production
    if [[ "$BACKEND_URL" == *"localhost"* ]]; then
        ERRORS+=("❌ BACKEND_URL should not use localhost in production")
        VALIDATION_PASSED=false
    fi
    
    # Check for default password salt
    if [ "$APP_PASSWORD_SALT" = "dino-secure-salt-2024-change-in-production" ]; then
        ERRORS+=("⚠️ APP_PASSWORD_SALT should be changed from default in production")
    fi
    
    echo "✅ Production environment checks completed"
else
    echo "ℹ️ Non-production environment, skipping production-specific checks"
fi

echo ""
echo "📊 Validation Summary"
echo "$(printf '─%.0s' {1..40})"

if [ "$VALIDATION_PASSED" = true ]; then
    echo "✅ All environment variables are valid"
    echo "🚀 Ready for deployment"
    exit 0
else
    echo "❌ Environment validation failed"
    echo ""
    echo "🔍 Issues found:"
    for error in "${ERRORS[@]}"; do
        echo "  $error"
    done
    echo ""
    echo "💡 Please fix the above issues before deployment"
    exit 1
fi