#!/bin/bash

# Environment Variable Validation Script
# Validates that all required environment variables are properly set

set -e

echo "🔍 ENVIRONMENT VARIABLE VALIDATION"
echo "=================================="
echo "📅 Started at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

# Validation results
VALIDATION_ERRORS=0
VALIDATION_WARNINGS=0

# Function to validate required variable
validate_required() {
    local var_name=$1
    local description=$2
    
    if [ -n "${!var_name}" ]; then
        echo "  ✅ $var_name: ${!var_name}"
    else
        echo "  ❌ $var_name: MISSING (Required: $description)"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi
}

# Function to validate optional variable
validate_optional() {
    local var_name=$1
    local default_value=$2
    local description=$3
    
    if [ -n "${!var_name}" ]; then
        echo "  ✅ $var_name: ${!var_name}"
    else
        echo "  ⚠️  $var_name: NOT SET (Default: $default_value) - $description"
        VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
    fi
}

# Function to validate boolean variable
validate_boolean() {
    local var_name=$1
    local description=$2
    
    local value="${!var_name}"
    if [ -n "$value" ]; then
        if [[ "$value" == "true" || "$value" == "false" || "$value" == "1" || "$value" == "0" ]]; then
            echo "  ✅ $var_name: $value"
        else
            echo "  ⚠️  $var_name: $value (Expected: true/false/1/0) - $description"
            VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
        fi
    else
        echo "  ⚠️  $var_name: NOT SET - $description"
        VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
    fi
}

# Function to validate URL
validate_url() {
    local var_name=$1
    local description=$2
    local allow_relative=${3:-false}
    
    local value="${!var_name}"
    if [ -n "$value" ]; then
        if [[ "$value" =~ ^https?:// ]] || [[ "$allow_relative" == "true" && "$value" =~ ^/ ]]; then
            echo "  ✅ $var_name: $value"
        else
            echo "  ⚠️  $var_name: $value (Invalid URL format) - $description"
            VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
        fi
    else
        echo "  ❌ $var_name: MISSING - $description"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi
}

# Function to validate number
validate_number() {
    local var_name=$1
    local min_value=$2
    local max_value=$3
    local description=$4
    
    local value="${!var_name}"
    if [ -n "$value" ]; then
        if [[ "$value" =~ ^[0-9]+$ ]]; then
            if [ "$value" -ge "$min_value" ] && [ "$value" -le "$max_value" ]; then
                echo "  ✅ $var_name: $value"
            else
                echo "  ⚠️  $var_name: $value (Expected: $min_value-$max_value) - $description"
                VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
            fi
        else
            echo "  ⚠️  $var_name: $value (Not a number) - $description"
            VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
        fi
    else
        echo "  ⚠️  $var_name: NOT SET - $description"
        VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
    fi
}

echo "📋 CORE CONFIGURATION"
echo "$(printf '─%.0s' {1..40})"
validate_url "API_BASE_URL" "API base URL for frontend calls" true
validate_url "WS_URL" "WebSocket URL for real-time features" true
validate_url "BACKEND_URL" "Backend server URL for nginx proxy" false

echo ""
echo "📋 APPLICATION SETTINGS"
echo "$(printf '─%.0s' {1..40})"
validate_optional "APP_NAME" "Dino" "Application display name"
validate_optional "APP_VERSION" "1.0.0" "Application version"
validate_optional "APP_ENV" "production" "Application environment"

echo ""
echo "📋 FEATURE FLAGS"
echo "$(printf '─%.0s' {1..40})"
validate_boolean "DEBUG_MODE" "Enable debug logging"
validate_boolean "ENABLE_THEME_TOGGLE" "Enable theme switching"
validate_boolean "ENABLE_ANALYTICS" "Enable analytics tracking"
validate_boolean "ENABLE_QR_CODES" "Enable QR code features"
validate_boolean "ENABLE_NOTIFICATIONS" "Enable notifications"

echo ""
echo "📋 API CONFIGURATION"
echo "$(printf '─%.0s' {1..40})"
validate_number "API_TIMEOUT" 1000 120000 "API request timeout in milliseconds"
validate_number "API_RATE_LIMIT" 1 1000 "API rate limit per minute"

echo ""
echo "📋 AUTHENTICATION"
echo "$(printf '─%.0s' {1..40})"
validate_number "JWT_EXPIRY_HOURS" 1 168 "JWT token expiry in hours"
validate_number "SESSION_TIMEOUT_MINUTES" 5 1440 "Session timeout in minutes"
validate_number "MIN_PASSWORD_LENGTH" 6 50 "Minimum password length"

echo ""
echo "📊 VALIDATION SUMMARY"
echo "$(printf '─%.0s' {1..40})"
echo "  🔢 Total variables checked: $(env | grep -E "^(API_|APP_|ENABLE_|JWT_|SESSION_|MIN_|DEFAULT_|CHART_|LOG_)" | wc -l)"
echo "  ❌ Errors: $VALIDATION_ERRORS"
echo "  ⚠️  Warnings: $VALIDATION_WARNINGS"

if [ $VALIDATION_ERRORS -gt 0 ]; then
    echo "  🚨 VALIDATION FAILED: $VALIDATION_ERRORS critical errors found"
    echo ""
    echo "💡 TROUBLESHOOTING TIPS:"
    echo "  1. Check your Cloud Run environment variables"
    echo "  2. Verify cloudbuild.yaml --set-env-vars configuration"
    echo "  3. Ensure all required variables are set"
    echo ""
    exit 1
elif [ $VALIDATION_WARNINGS -gt 0 ]; then
    echo "  ⚠️  VALIDATION PASSED WITH WARNINGS: $VALIDATION_WARNINGS non-critical issues"
    echo ""
    echo "💡 RECOMMENDATIONS:"
    echo "  1. Review warning messages above"
    echo "  2. Consider setting optional variables for better control"
    echo "  3. Verify boolean values are true/false"
    echo ""
else
    echo "  ✅ VALIDATION PASSED: All environment variables are properly configured"
    echo ""
fi

echo "📅 Validation completed at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""