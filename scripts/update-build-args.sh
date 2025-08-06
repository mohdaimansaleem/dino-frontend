#!/bin/bash

# Update Build Arguments for React App
# This script helps you update build-time environment variables for React apps

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 React Build Arguments Manager${NC}"
echo -e "${BLUE}For React apps, environment variables must be set at BUILD TIME${NC}"
echo ""

# Function to show current build arguments in cloudbuild.yaml
show_build_args() {
    echo -e "${YELLOW}📋 Current build arguments in cloudbuild.yaml:${NC}"
    grep -A 20 "build-arg" cloudbuild.yaml | grep "REACT_APP" || echo "No REACT_APP build arguments found"
}

# Function to update API base URL
update_api_url() {
    local new_url="$1"
    if [ -z "$new_url" ]; then
        echo -e "${RED}❌ Usage: $0 api-url <new-url>${NC}"
        echo "Example: $0 api-url https://my-backend.com/api/v1"
        exit 1
    fi
    
    echo -e "${YELLOW}🔄 Updating API base URL to: $new_url${NC}"
    
    # Update in cloudbuild.yaml
    sed -i.bak "s|'--build-arg', 'REACT_APP_API_BASE_URL=.*'|'--build-arg', 'REACT_APP_API_BASE_URL=$new_url'|g" cloudbuild.yaml
    
    # Update in .env.production for reference
    sed -i.bak "s|REACT_APP_API_BASE_URL=.*|REACT_APP_API_BASE_URL=$new_url|g" .env.production
    
    echo -e "${GREEN}✅ API URL updated in cloudbuild.yaml and .env.production${NC}"
    echo -e "${BLUE}💡 Trigger a new build to apply changes${NC}"
}

# Function to update environment (dev/staging/prod)
update_env() {
    local new_env="$1"
    if [ -z "$new_env" ]; then
        echo -e "${RED}❌ Usage: $0 env <environment>${NC}"
        echo "Example: $0 env staging"
        exit 1
    fi
    
    echo -e "${YELLOW}🔄 Updating environment to: $new_env${NC}"
    
    # Update in cloudbuild.yaml
    sed -i.bak "s|'--build-arg', 'REACT_APP_ENV=.*'|'--build-arg', 'REACT_APP_ENV=$new_env'|g" cloudbuild.yaml
    
    echo -e "${GREEN}✅ Environment updated to $new_env${NC}"
    echo -e "${BLUE}💡 Trigger a new build to apply changes${NC}"
}

# Function to toggle feature flag
toggle_feature() {
    local feature="$1"
    local value="$2"
    
    if [ -z "$feature" ] || [ -z "$value" ]; then
        echo -e "${RED}❌ Usage: $0 feature <feature-name> <true|false>${NC}"
        echo "Example: $0 feature DEMO_MODE true"
        exit 1
    fi
    
    # Ensure feature name has REACT_APP_ prefix
    if [[ ! "$feature" =~ ^REACT_APP_ ]]; then
        feature="REACT_APP_ENABLE_$feature"
    fi
    
    echo -e "${YELLOW}🔄 Setting $feature to: $value${NC}"
    
    # Update in cloudbuild.yaml
    sed -i.bak "s|'--build-arg', '$feature=.*'|'--build-arg', '$feature=$value'|g" cloudbuild.yaml
    
    echo -e "${GREEN}✅ Feature flag $feature set to $value${NC}"
    echo -e "${BLUE}💡 Trigger a new build to apply changes${NC}"
}

# Function to add new build argument
add_build_arg() {
    local key="$1"
    local value="$2"
    
    if [ -z "$key" ] || [ -z "$value" ]; then
        echo -e "${RED}❌ Usage: $0 add <KEY> <VALUE>${NC}"
        echo "Example: $0 add REACT_APP_NEW_FEATURE true"
        exit 1
    fi
    
    # Ensure key has REACT_APP_ prefix
    if [[ ! "$key" =~ ^REACT_APP_ ]]; then
        echo -e "${YELLOW}⚠️  Adding REACT_APP_ prefix to key${NC}"
        key="REACT_APP_$key"
    fi
    
    echo -e "${YELLOW}➕ Adding new build argument: $key=$value${NC}"
    
    # Find the line with the last build-arg and add after it
    sed -i.bak "/--build-arg.*REACT_APP.*=.*,$/a\\
      '--build-arg', '$key=$value'," cloudbuild.yaml
    
    echo -e "${GREEN}✅ Build argument $key added${NC}"
    echo -e "${BLUE}💡 Trigger a new build to apply changes${NC}"
}

# Function to validate cloudbuild.yaml
validate_config() {
    echo -e "${YELLOW}🔍 Validating cloudbuild.yaml...${NC}"
    
    # Check if file exists
    if [ ! -f "cloudbuild.yaml" ]; then
        echo -e "${RED}❌ cloudbuild.yaml not found${NC}"
        exit 1
    fi
    
    # Check for required build args
    local required_args=("REACT_APP_API_BASE_URL" "REACT_APP_ENV")
    local missing_args=()
    
    for arg in "${required_args[@]}"; do
        if ! grep -q "$arg" cloudbuild.yaml; then
            missing_args+=("$arg")
        fi
    done
    
    if [ ${#missing_args[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ Configuration is valid${NC}"
    else
        echo -e "${RED}❌ Missing required build arguments:${NC}"
        printf '%s\n' "${missing_args[@]}"
    fi
}

# Function to show help
show_help() {
    echo "React Build Arguments Manager"
    echo ""
    echo "Usage: $0 [command] [args]"
    echo ""
    echo "Commands:"
    echo "  show                    Show current build arguments"
    echo "  api-url <url>          Update API base URL"
    echo "  env <environment>      Update environment (dev/staging/prod)"
    echo "  feature <name> <value> Toggle feature flag (true/false)"
    echo "  add <key> <value>      Add new build argument"
    echo "  validate               Validate cloudbuild.yaml configuration"
    echo "  help                   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 show"
    echo "  $0 api-url https://my-backend.com/api/v1"
    echo "  $0 env staging"
    echo "  $0 feature DEMO_MODE true"
    echo "  $0 add REACT_APP_CUSTOM_VAR custom_value"
    echo ""
    echo "Note: Changes require triggering a new build to take effect."
}

# Main script logic
case "${1:-show}" in
    "show")
        show_build_args
        ;;
    "api-url")
        update_api_url "$2"
        ;;
    "env")
        update_env "$2"
        ;;
    "feature")
        toggle_feature "$2" "$3"
        ;;
    "add")
        add_build_arg "$2" "$3"
        ;;
    "validate")
        validate_config
        ;;
    "help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac