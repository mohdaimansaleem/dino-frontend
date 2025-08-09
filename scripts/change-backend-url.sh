#!/bin/bash

# Change Backend URL - Single Place Update
# This script updates the backend URL in ONE place and it applies everywhere

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show current URLs
show_current_urls() {
    echo -e "${BLUE}📋 Current Backend URLs:${NC}"
    echo ""
    
    # Extract current URLs from the centralized config
    local api_url=$(grep "PRODUCTION_API_URL = " src/config/api.ts | sed "s/.*= '\(.*\)';/\1/")
    local ws_url=$(grep "PRODUCTION_WS_URL = " src/config/api.ts | sed "s/.*= '\(.*\)';/\1/")
    
    echo -e "  ${GREEN}API URL:${NC} $api_url"
    echo -e "  ${GREEN}WebSocket URL:${NC} $ws_url"
    echo ""
}

# Function to update URLs
update_urls() {
    local new_api_url="$1"
    local new_ws_url="$2"
    
    if [ -z "$new_api_url" ]; then
        echo -e "${RED}❌ Usage: $0 update <api-url> [ws-url]${NC}"
        echo "Example: $0 update https://my-backend.com/api/v1"
        echo "Example: $0 update https://my-backend.com/api/v1 wss://my-backend.com/ws"
        exit 1
    fi
    
    # Auto-generate WebSocket URL if not provided
    if [ -z "$new_ws_url" ]; then
        new_ws_url=$(echo "$new_api_url" | sed 's|https://|wss://|g' | sed 's|http://|ws://|g' | sed 's|/api/v1|/ws|g')
        echo -e "${YELLOW}🔄 Auto-generated WebSocket URL: $new_ws_url${NC}"
    fi
    
    echo -e "${YELLOW}🔄 Updating backend URLs...${NC}"
    echo -e "  API URL: $new_api_url"
    echo -e "  WebSocket URL: $new_ws_url"
    echo ""
    
    # Update the centralized configuration file
    sed -i.bak "s|const PRODUCTION_API_URL = '.*';|const PRODUCTION_API_URL = '$new_api_url';|g" src/config/api.ts
    sed -i.bak "s|const PRODUCTION_WS_URL = '.*';|const PRODUCTION_WS_URL = '$new_ws_url';|g" src/config/api.ts
    
    # Update build configuration
    sed -i.bak "s|'--build-arg', 'REACT_APP_API_BASE_URL=.*'|'--build-arg', 'REACT_APP_API_BASE_URL=$new_api_url'|g" cloudbuild.yaml
    sed -i.bak "s|'--build-arg', 'REACT_APP_WS_URL=.*'|'--build-arg', 'REACT_APP_WS_URL=$new_ws_url'|g" cloudbuild.yaml
    
    # Clean up backup files
    rm -f src/config/api.ts.bak cloudbuild.yaml.bak
    
    echo -e "${GREEN}✅ Backend URLs updated successfully!${NC}"
    echo -e "${BLUE}💡 Changes applied to:${NC}"
    echo "  - src/config/api.ts (centralized configuration)"
    echo "  - cloudbuild.yaml (build configuration)"
    echo ""
    echo -e "${BLUE}💡 All services will automatically use the new URLs.${NC}"
    echo -e "${BLUE}💡 Commit and push to deploy with new URLs.${NC}"
}

# Function to validate URLs
validate_urls() {
    echo -e "${YELLOW}🔍 Validating current configuration...${NC}"
    
    # Check if centralized config exists
    if [ ! -f "src/config/api.ts" ]; then
        echo -e "${RED}❌ Centralized config file not found: src/config/api.ts${NC}"
        exit 1
    fi
    
    # Extract URLs
    local api_url=$(grep "PRODUCTION_API_URL = " src/config/api.ts | sed "s/.*= '\(.*\)';/\1/")
    local ws_url=$(grep "PRODUCTION_WS_URL = " src/config/api.ts | sed "s/.*= '\(.*\)';/\1/")
    
    # Validate API URL
    if [[ ! "$api_url" =~ ^https?:// ]]; then
        echo -e "${RED}❌ Invalid API URL: $api_url${NC}"
        return 1
    fi
    
    # Validate WebSocket URL
    if [[ ! "$ws_url" =~ ^wss?:// ]]; then
        echo -e "${RED}❌ Invalid WebSocket URL: $ws_url${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ URLs are valid${NC}"
    return 0
}

# Function to show help
show_help() {
    echo -e "${GREEN}🔧 Backend URL Manager - Single Place Update${NC}"
    echo ""
    echo "Usage: $0 [command] [args]"
    echo ""
    echo "Commands:"
    echo "  show                    Show current backend URLs"
    echo "  update <api-url> [ws-url]  Update backend URLs"
    echo "  validate               Validate current URLs"
    echo "  help                   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 show"
    echo "  $0 update https://my-backend.com/api/v1"
    echo "  $0 update https://my-backend.com/api/v1 wss://my-backend.com/ws"
    echo "  $0 validate"
    echo ""
    echo -e "${BLUE}💡 This script updates URLs in ONE place and they apply everywhere!${NC}"
}

# Main script logic
case "${1:-show}" in
    "show")
        show_current_urls
        ;;
    "update")
        update_urls "$2" "$3"
        show_current_urls
        ;;
    "validate")
        validate_urls
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