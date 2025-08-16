#!/bin/bash

# Enhanced Deployment Script for Dino Frontend
# Supports multiple environments with validation and rollback

set -e

# Default values
ENVIRONMENT=${1:-production}
SKIP_BUILD=${2:-false}
FORCE_DEPLOY=${3:-false}

echo "🚀 Dino Frontend - Deployment to $ENVIRONMENT"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Validate environment
case $ENVIRONMENT in
    development|staging|production)
        print_status "Deploying to: $ENVIRONMENT"
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT"
        print_status "Valid environments: development, staging, production"
        exit 1
        ;;
esac

# Check prerequisites
print_status "Checking prerequisites..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_error "Not authenticated with gcloud. Please run 'gcloud auth login'"
    exit 1
fi

# Check if project is set
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    print_error "No project set. Please run 'gcloud config set project YOUR_PROJECT_ID'"
    exit 1
fi

print_success "Prerequisites check passed"
print_status "Project ID: $PROJECT_ID"
echo ""

# Check if we're in the right directory
if [ ! -f "cloudbuild.yaml" ]; then
    print_error "cloudbuild.yaml not found. Please run this script from the project root."
    exit 1
fi

# Environment-specific configuration
case $ENVIRONMENT in
    development)
        SERVICE_NAME="dino-frontend-dev"
        REGION="us-central1"
        MIN_INSTANCES=0
        MAX_INSTANCES=2
        CPU_LIMIT="1"
        MEMORY_LIMIT="512Mi"
        ;;
    staging)
        SERVICE_NAME="dino-frontend-staging"
        REGION="us-central1"
        MIN_INSTANCES=0
        MAX_INSTANCES=5
        CPU_LIMIT="1"
        MEMORY_LIMIT="1Gi"
        ;;
    production)
        SERVICE_NAME="dino-frontend"
        REGION="us-central1"
        MIN_INSTANCES=1
        MAX_INSTANCES=10
        CPU_LIMIT="2"
        MEMORY_LIMIT="2Gi"
        ;;
esac

print_status "Service configuration:"
print_status "  Service: $SERVICE_NAME"
print_status "  Region: $REGION"
print_status "  Instances: $MIN_INSTANCES-$MAX_INSTANCES"
print_status "  Resources: $CPU_LIMIT CPU, $MEMORY_LIMIT memory"
echo ""

# Build if not skipped
if [ "$SKIP_BUILD" != "true" ]; then
    print_status "Building application..."
    if [ -f "deployment/scripts/build.sh" ]; then
        ./deployment/scripts/build.sh
    else
        npm run build
    fi
    print_success "Build completed"
else
    print_warning "Skipping build (SKIP_BUILD=true)"
    if [ ! -d "build" ]; then
        print_error "Build directory not found and SKIP_BUILD=true"
        exit 1
    fi
fi

# Validate build
print_status "Validating build..."
if [ -f "build/index.html" ] && [ -d "build/static" ]; then
    BUILD_SIZE=$(du -sh build/ | cut -f1)
    print_success "Build validation passed (Size: $BUILD_SIZE)"
else
    print_error "Build validation failed - missing required files"
    exit 1
fi

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if service exists
if gcloud run services describe $SERVICE_NAME --region=$REGION &>/dev/null; then
    print_status "Service $SERVICE_NAME exists"
    EXISTING_SERVICE=true
    
    # Get current revision for potential rollback
    CURRENT_REVISION=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.latestReadyRevisionName)")
    print_status "Current revision: $CURRENT_REVISION"
else
    print_status "Service $SERVICE_NAME does not exist - will be created"
    EXISTING_SERVICE=false
fi

# Confirm deployment for production
if [ "$ENVIRONMENT" = "production" ] && [ "$FORCE_DEPLOY" != "true" ]; then
    echo ""
    print_warning "⚠️  PRODUCTION DEPLOYMENT WARNING ⚠️"
    print_warning "You are about to deploy to production environment."
    print_warning "This will affect live users."
    echo ""
    read -p "Continue with production deployment? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
fi

# Deploy using Cloud Build
print_status "Starting Cloud Build deployment..."
print_status "This will:"
print_status "  1. Build the Docker image with production optimizations"
print_status "  2. Push the image to Google Container Registry"
print_status "  3. Deploy to Cloud Run with $ENVIRONMENT configuration"
echo ""

# Create environment-specific cloudbuild config
CLOUDBUILD_CONFIG="deployment/cloudbuild-${ENVIRONMENT}.yaml"
if [ ! -f "$CLOUDBUILD_CONFIG" ]; then
    print_status "Creating environment-specific cloudbuild config..."
    cp cloudbuild.yaml "$CLOUDBUILD_CONFIG"
    
    # Update service name in the config
    sed -i.bak "s/dino-frontend/$SERVICE_NAME/g" "$CLOUDBUILD_CONFIG"
    rm "${CLOUDBUILD_CONFIG}.bak"
fi

# Submit the build
DEPLOY_START=$(date +%s)
if gcloud builds submit --config "$CLOUDBUILD_CONFIG" .; then
    DEPLOY_END=$(date +%s)
    DEPLOY_TIME=$((DEPLOY_END - DEPLOY_START))
    print_success "Deployment completed successfully in ${DEPLOY_TIME}s!"
    echo ""
    
    # Update service configuration
    print_status "Updating service configuration..."
    gcloud run services update $SERVICE_NAME \
        --region=$REGION \
        --min-instances=$MIN_INSTANCES \
        --max-instances=$MAX_INSTANCES \
        --cpu=$CPU_LIMIT \
        --memory=$MEMORY_LIMIT \
        --set-env-vars="NODE_ENV=$ENVIRONMENT" \
        --quiet
    
    # Get the service URL
    print_status "Getting service URL..."
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)" 2>/dev/null || echo "")
    
    if [ -n "$SERVICE_URL" ]; then
        print_success "Application deployed at: $SERVICE_URL"
        echo ""
        
        # Test the deployment
        print_status "Testing deployment..."
        if curl -s -f "$SERVICE_URL/health" > /dev/null 2>&1; then
            print_success "Health check passed ✅"
        else
            print_warning "Health check failed - service might still be starting up"
        fi
        
        echo ""
        print_status "Deployment Summary:"
        echo "  🌐 URL: $SERVICE_URL"
        echo "  🏥 Health: $SERVICE_URL/health"
        echo "  ⚙️  Config: $SERVICE_URL/config.js"
        echo "  🕐 Deploy time: ${DEPLOY_TIME}s"
        echo "  📦 Build size: $BUILD_SIZE"
        echo ""
        
        # Save deployment info
        cat > "deployment/last-deployment-${ENVIRONMENT}.json" << EOF
{
  "environment": "$ENVIRONMENT",
  "serviceName": "$SERVICE_NAME",
  "serviceUrl": "$SERVICE_URL",
  "deployTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "deployDuration": "${DEPLOY_TIME}s",
  "buildSize": "$BUILD_SIZE",
  "revision": "$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.latestReadyRevisionName)" 2>/dev/null || echo 'unknown')",
  "previousRevision": "$CURRENT_REVISION",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
}
EOF
        
        print_success "Deployment completed successfully! 🎉"
        
    else
        print_warning "Could not retrieve service URL"
    fi
    
else
    print_error "Deployment failed!"
    
    # Rollback if this was an update to existing service
    if [ "$EXISTING_SERVICE" = true ] && [ -n "$CURRENT_REVISION" ]; then
        echo ""
        print_warning "Attempting rollback to previous revision..."
        if gcloud run services update-traffic $SERVICE_NAME --region=$REGION --to-revisions=$CURRENT_REVISION=100; then
            print_success "Rollback completed"
        else
            print_error "Rollback failed - manual intervention required"
        fi
    fi
    
    exit 1
fi

echo ""
print_status "Next steps:"
echo "  1. Monitor the application: $SERVICE_URL"
echo "  2. Check logs: gcloud logs read --service=$SERVICE_NAME"
echo "  3. Monitor metrics in Google Cloud Console"
if [ "$ENVIRONMENT" != "production" ]; then
    echo "  4. Deploy to production: ./deployment/scripts/deploy.sh production"
fi
echo ""
print_success "Happy deploying! 🚀"