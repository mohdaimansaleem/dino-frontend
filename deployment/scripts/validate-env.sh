#!/bin/bash

# Environment Validation Script
# Validates required environment variables and configurations

set -e

echo "🔍 Environment Validation"
echo "========================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

VALIDATION_ERRORS=0

# Function to validate environment variable
validate_env_var() {
    local var_name=$1
    local var_value=${!var_name}
    local required=${2:-true}
    local description=$3
    
    if [ -z "$var_value" ]; then
        if [ "$required" = true ]; then
            print_error "Missing required environment variable: $var_name"
            if [ -n "$description" ]; then
                echo "  Description: $description"
            fi
            VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
        else
            print_warning "Optional environment variable not set: $var_name"
            if [ -n "$description" ]; then
                echo "  Description: $description"
            fi
        fi
    else
        print_success "$var_name: $var_value"
    fi
}

# Function to validate URL
validate_url() {
    local url=$1
    local name=$2
    
    if [ -n "$url" ]; then
        if curl -s --head "$url" > /dev/null 2>&1; then
            print_success "$name URL is accessible: $url"
        else
            print_warning "$name URL is not accessible (might be expected): $url"
        fi
    fi
}

print_status "Validating environment configuration..."
echo ""

# Core environment variables
print_status "Core Environment Variables:"
validate_env_var "NODE_ENV" true "Application environment (development/staging/production)"
validate_env_var "APP_ENV" false "Alternative app environment variable"

# API Configuration
print_status "API Configuration:"
validate_env_var "BACKEND_URL" false "Backend API URL"
validate_env_var "API_BASE_URL" false "API base URL"
validate_env_var "WS_URL" false "WebSocket URL"

# Build Configuration
print_status "Build Configuration:"
validate_env_var "GENERATE_SOURCEMAP" false "Whether to generate source maps"
validate_env_var "CI" false "Continuous Integration flag"

# Feature Flags
print_status "Feature Flags:"
validate_env_var "ENABLE_ANALYTICS" false "Enable analytics tracking"
validate_env_var "ENABLE_NOTIFICATIONS" false "Enable notifications"
validate_env_var "ENABLE_QR_CODES" false "Enable QR code functionality"
validate_env_var "ENABLE_THEME_TOGGLE" false "Enable theme toggle"
validate_env_var "ENABLE_ANIMATIONS" false "Enable animations"

# Debug Configuration
print_status "Debug Configuration:"
validate_env_var "DEBUG_MODE" false "Enable debug mode"
validate_env_var "ENABLE_CONSOLE_LOGGING" false "Enable console logging"

echo ""

# Validate URLs if provided
if [ -n "$BACKEND_URL" ]; then
    print_status "Validating URLs..."
    validate_url "$BACKEND_URL/health" "Backend Health"
fi

# Check Node.js version
print_status "Runtime Validation:"
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [ "$NODE_VERSION" != "not found" ]; then
    print_success "Node.js version: $NODE_VERSION"
    
    # Check if version is compatible (v16+)
    NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v\([0-9]*\).*/\1/')
    if [ "$NODE_MAJOR" -ge 16 ]; then
        print_success "Node.js version is compatible"
    else
        print_error "Node.js version $NODE_VERSION is not supported (requires v16+)"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi
else
    print_error "Node.js is not installed"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

# Check npm version
NPM_VERSION=$(npm --version 2>/dev/null || echo "not found")
if [ "$NPM_VERSION" != "not found" ]; then
    print_success "npm version: $NPM_VERSION"
else
    print_error "npm is not installed"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

# Check package.json
if [ -f "package.json" ]; then
    print_success "package.json found"
    
    # Check if dependencies are installed
    if [ -d "node_modules" ]; then
        print_success "node_modules directory exists"
    else
        print_warning "node_modules directory not found - run 'npm install'"
    fi
else
    print_error "package.json not found"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

echo ""

# Summary
if [ $VALIDATION_ERRORS -eq 0 ]; then
    print_success "✅ Environment validation passed!"
    echo ""
    print_status "Environment Summary:"
    echo "  Environment: ${NODE_ENV:-not set}"
    echo "  Backend URL: ${BACKEND_URL:-not set}"
    echo "  Debug Mode: ${DEBUG_MODE:-false}"
    echo "  Source Maps: ${GENERATE_SOURCEMAP:-true}"
    echo ""
    exit 0
else
    print_error "❌ Environment validation failed with $VALIDATION_ERRORS error(s)"
    echo ""
    print_status "Please fix the above errors and run validation again."
    echo ""
    exit 1
fi