#!/bin/bash

# Quick Production Deployment Script
# Builds and deploys the Dino Frontend to Google Cloud Run

set -e

echo "🚀 Dino Frontend - Quick Production Deployment"
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

# Validate environment
print_status "Validating environment configuration..."
if [ -f "scripts/validate-env.sh" ]; then
    # Set minimal required environment for validation
    export BACKEND_URL="${BACKEND_URL:-https://dino-backend-api-867506203789.us-central1.run.app}"
    export APP_ENV="production"
    
    if ./scripts/validate-env.sh; then
        print_success "Environment validation passed"
    else
        print_error "Environment validation failed"
        exit 1
    fi
else
    print_warning "Environment validation script not found, skipping..."
fi
echo ""

# Build and deploy
print_status "Starting Cloud Build deployment..."
print_status "This will:"
print_status "  1. Build the Docker image with production optimizations"
print_status "  2. Push the image to Google Container Registry"
print_status "  3. Deploy to Cloud Run with production configuration"
echo ""

# Confirm deployment
read -p "Continue with deployment? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled"
    exit 0
fi

# Submit the build
print_status "Submitting build to Google Cloud Build..."
if gcloud builds submit --config cloudbuild.yaml .; then
    print_success "Deployment completed successfully!"
    echo ""
    
    # Get the service URL
    print_status "Getting service URL..."
    SERVICE_URL=$(gcloud run services describe dino-frontend --region=us-central1 --format="value(status.url)" 2>/dev/null || echo "")
    
    if [ -n "$SERVICE_URL" ]; then
        print_success "Application deployed at: $SERVICE_URL"
        echo ""
        
        # Test the deployment
        print_status "Testing deployment..."
        if curl -s -f "$SERVICE_URL/health" > /dev/null; then
            print_success "Health check passed ✅"
        else
            print_warning "Health check failed - service might still be starting up"
        fi
        
        echo ""
        print_status "Deployment Summary:"
        echo "  🌐 URL: $SERVICE_URL"
        echo "  🏥 Health: $SERVICE_URL/health"
        echo "  ⚙️  Config: $SERVICE_URL/config.js"
        echo ""
        print_success "Deployment completed successfully! 🎉"
        
    else
        print_warning "Could not retrieve service URL"
    fi
    
else
    print_error "Deployment failed!"
    exit 1
fi

echo ""
print_status "Next steps:"
echo "  1. Test the application thoroughly"
echo "  2. Monitor logs: gcloud logs read --service=dino-frontend"
echo "  3. Check metrics in Google Cloud Console"
echo "  4. Set up monitoring and alerting"
echo ""
print_success "Happy deploying! 🚀"