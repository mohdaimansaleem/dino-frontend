#!/bin/bash

# Validate Environment Configuration
# This script validates that all required environment variables are properly configured
# for auto-triggered builds

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 Validating Environment Configuration for Auto-Triggered Builds${NC}"
echo ""

# Required environment variables for the application to work properly
REQUIRED_VARS=(
    "REACT_APP_API_BASE_URL"
    "REACT_APP_ENV"
    "REACT_APP_NAME"
    "REACT_APP_VERSION"
)

# Optional but recommended environment variables
RECOMMENDED_VARS=(
    "REACT_APP_ENABLE_THEME_TOGGLE"
    "REACT_APP_ENABLE_DEMO_MODE"
    "REACT_APP_ENABLE_ANALYTICS"
    "REACT_APP_ENABLE_QR_CODES"
    "REACT_APP_ENABLE_NOTIFICATIONS"
    "REACT_APP_API_TIMEOUT"
    "REACT_APP_JWT_EXPIRY_HOURS"
    "REACT_APP_DEFAULT_THEME"
    "REACT_APP_LOG_LEVEL"
)

# Function to check if a variable exists in cloudbuild.yaml
check_build_arg() {
    local var_name="$1"
    if grep -q "build-arg.*$var_name=" cloudbuild.yaml; then
        return 0
    else
        return 1
    fi
}

# Function to get the value of a build arg from cloudbuild.yaml
get_build_arg_value() {
    local var_name="$1"
    grep "build-arg.*$var_name=" cloudbuild.yaml | sed "s/.*$var_name=\([^']*\).*/\1/" | head -1
}

# Check if cloudbuild.yaml exists
if [ ! -f "cloudbuild.yaml" ]; then
    echo -e "${RED}❌ cloudbuild.yaml not found!${NC}"
    echo "This file is required for auto-triggered builds."
    exit 1
fi

echo -e "${BLUE}📋 Checking required environment variables...${NC}"

# Check required variables
missing_required=()
for var in "${REQUIRED_VARS[@]}"; do
    if check_build_arg "$var"; then
        value=$(get_build_arg_value "$var")
        echo -e "${GREEN}✅ $var${NC} = $value"
    else
        missing_required+=("$var")
        echo -e "${RED}❌ $var${NC} - Missing from cloudbuild.yaml"
    fi
done

echo ""
echo -e "${BLUE}📋 Checking recommended environment variables...${NC}"

# Check recommended variables
missing_recommended=()
for var in "${RECOMMENDED_VARS[@]}"; do
    if check_build_arg "$var"; then
        value=$(get_build_arg_value "$var")
        echo -e "${GREEN}✅ $var${NC} = $value"
    else
        missing_recommended+=("$var")
        echo -e "${YELLOW}⚠️  $var${NC} - Not set (using default)"
    fi
done

echo ""
echo -e "${BLUE}🔍 Checking Dockerfile configuration...${NC}"

# Check if Dockerfile has corresponding ARG and ENV statements
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Dockerfile not found!${NC}"
    exit 1
fi

# Check if Dockerfile has ARG statements for required variables
dockerfile_issues=()
for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "ARG $var" Dockerfile; then
        dockerfile_issues+=("Missing ARG $var in Dockerfile")
    fi
    if ! grep -q "ENV $var=" Dockerfile; then
        dockerfile_issues+=("Missing ENV $var in Dockerfile")
    fi
done

if [ ${#dockerfile_issues[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Dockerfile configuration looks good${NC}"
else
    echo -e "${RED}❌ Dockerfile issues found:${NC}"
    printf '%s\n' "${dockerfile_issues[@]}"
fi

echo ""
echo -e "${BLUE}🔍 Checking API Base URL configuration...${NC}"

# Check if API_BASE_URL uses PROJECT_ID substitution
if check_build_arg "REACT_APP_API_BASE_URL"; then
    api_url=$(get_build_arg_value "REACT_APP_API_BASE_URL")
    if [[ "$api_url" == *'$PROJECT_ID'* ]]; then
        echo -e "${GREEN}✅ API Base URL uses dynamic PROJECT_ID substitution${NC}"
        echo -e "   URL pattern: $api_url"
    else
        echo -e "${YELLOW}⚠️  API Base URL is hardcoded${NC}"
        echo -e "   Current URL: $api_url"
        echo -e "   Consider using: https://dino-backend-\$PROJECT_ID.a.run.app/api/v1"
    fi
fi

echo ""
echo -e "${BLUE}📊 Summary:${NC}"

# Summary
if [ ${#missing_required[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All required environment variables are configured${NC}"
else
    echo -e "${RED}❌ Missing ${#missing_required[@]} required environment variables${NC}"
fi

if [ ${#missing_recommended[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All recommended environment variables are configured${NC}"
else
    echo -e "${YELLOW}⚠️  ${#missing_recommended[@]} recommended environment variables are using defaults${NC}"
fi

if [ ${#dockerfile_issues[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Dockerfile configuration is correct${NC}"
else
    echo -e "${RED}❌ Dockerfile has ${#dockerfile_issues[@]} configuration issues${NC}"
fi

echo ""

# Final verdict
if [ ${#missing_required[@]} -eq 0 ] && [ ${#dockerfile_issues[@]} -eq 0 ]; then
    echo -e "${GREEN}🎉 Configuration is ready for auto-triggered builds!${NC}"
    echo -e "${BLUE}💡 Your next GitHub push will trigger a build with all environment variables properly configured.${NC}"
    exit 0
else
    echo -e "${RED}🚨 Configuration issues found that need to be fixed before building.${NC}"
    echo -e "${BLUE}💡 Fix the issues above and run this script again to validate.${NC}"
    exit 1
fi