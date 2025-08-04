#!/bin/bash

# Deploy Environment Variables to Cloud Run
# NOTE: This script is for server-side applications. 
# React apps need environment variables at BUILD TIME, not runtime.
# For React apps, update cloudbuild.yaml build arguments instead.

set -e

# Configuration
SERVICE_NAME="dino-frontend"
REGION="us-central1"
PROJECT_ID=${PROJECT_ID:-$(gcloud config get-value project)}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Environment Variables to Cloud Run${NC}"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo "Project: $PROJECT_ID"
echo ""

# Function to set environment variables
set_env_vars() {
    echo -e "${YELLOW}📝 Setting environment variables...${NC}"
    
    gcloud run services update $SERVICE_NAME \
        --region=$REGION \
        --set-env-vars="REACT_APP_API_BASE_URL=https://dino-backend-${PROJECT_ID}.a.run.app/api/v1" \
        --set-env-vars="REACT_APP_ENV=production" \
        --set-env-vars="REACT_APP_NAME=Dino" \
        --set-env-vars="REACT_APP_VERSION=1.0.0" \
        --set-env-vars="REACT_APP_DEBUG_MODE=false" \
        --set-env-vars="REACT_APP_ENABLE_THEME_TOGGLE=false" \
        --set-env-vars="REACT_APP_ENABLE_DEMO_MODE=false" \
        --set-env-vars="REACT_APP_ENABLE_ANALYTICS=true" \
        --set-env-vars="REACT_APP_ENABLE_QR_CODES=true" \
        --set-env-vars="REACT_APP_ENABLE_NOTIFICATIONS=true" \
        --set-env-vars="REACT_APP_API_TIMEOUT=30000" \
        --set-env-vars="REACT_APP_JWT_EXPIRY_HOURS=24" \
        --set-env-vars="REACT_APP_SESSION_TIMEOUT_MINUTES=60" \
        --set-env-vars="REACT_APP_MIN_PASSWORD_LENGTH=8" \
        --set-env-vars="REACT_APP_DEFAULT_THEME=light" \
        --set-env-vars="REACT_APP_ENABLE_ANIMATIONS=true" \
        --set-env-vars="REACT_APP_LOG_LEVEL=info" \
        --set-env-vars="REACT_APP_ENABLE_CONSOLE_LOGGING=false"
}

# Function to show current environment variables
show_env_vars() {
    echo -e "${YELLOW}📋 Current environment variables:${NC}"
    gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(spec.template.spec.template.spec.containers[0].env[].name,spec.template.spec.template.spec.containers[0].env[].value)" | grep REACT_APP || echo "No REACT_APP environment variables found"
}

# Function to set custom environment variable
set_custom_env() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo -e "${RED}❌ Usage: $0 set KEY VALUE${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}📝 Setting custom environment variable: $1=$2${NC}"
    gcloud run services update $SERVICE_NAME \
        --region=$REGION \
        --set-env-vars="$1=$2"
}

# Function to remove environment variable
remove_env() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Usage: $0 remove KEY${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}🗑️  Removing environment variable: $1${NC}"
    gcloud run services update $SERVICE_NAME \
        --region=$REGION \
        --remove-env-vars="$1"
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        set_env_vars
        echo -e "${GREEN}✅ Environment variables deployed successfully!${NC}"
        ;;
    "show")
        show_env_vars
        ;;
    "set")
        set_custom_env "$2" "$3"
        echo -e "${GREEN}✅ Environment variable set successfully!${NC}"
        ;;
    "remove")
        remove_env "$2"
        echo -e "${GREEN}✅ Environment variable removed successfully!${NC}"
        ;;
    "help")
        echo "Usage: $0 [command] [args]"
        echo ""
        echo "Commands:"
        echo "  deploy          Deploy all default environment variables"
        echo "  show            Show current environment variables"
        echo "  set KEY VALUE   Set a custom environment variable"
        echo "  remove KEY      Remove an environment variable"
        echo "  help            Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 deploy"
        echo "  $0 show"
        echo "  $0 set REACT_APP_CUSTOM_VAR 'custom_value'"
        echo "  $0 remove REACT_APP_CUSTOM_VAR"
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac