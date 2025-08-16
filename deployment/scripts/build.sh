#!/bin/bash

# Production Build Script for Dino Frontend
# Optimized build with environment validation and error handling

set -e

echo "🏗️  Dino Frontend - Production Build"
echo "===================================="
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Environment setup
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export CI=true

print_status "Environment: $NODE_ENV"
print_status "Source maps: $GENERATE_SOURCEMAP"
echo ""

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf build/
rm -rf node_modules/.cache/
print_success "Clean completed"

# Install dependencies
print_status "Installing dependencies..."
if npm ci --legacy-peer-deps --silent; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Type checking
print_status "Running TypeScript type checking..."
if npm run type-check; then
    print_success "Type checking passed"
else
    print_error "Type checking failed"
    exit 1
fi

# Build the application
print_status "Building application..."
BUILD_START=$(date +%s)

if npm run build; then
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    print_success "Build completed in ${BUILD_TIME}s"
else
    print_error "Build failed"
    exit 1
fi

# Analyze build size
print_status "Analyzing build size..."
if [ -d "build" ]; then
    BUILD_SIZE=$(du -sh build/ | cut -f1)
    print_success "Build size: $BUILD_SIZE"
    
    # Check for large files
    print_status "Checking for large files (>1MB)..."
    find build/ -type f -size +1M -exec ls -lh {} \; | awk '{ print $9 ": " $5 }' || true
    
    # List main bundle files
    print_status "Main bundle files:"
    ls -lh build/static/js/*.js | awk '{ print $9 ": " $5 }' || true
    ls -lh build/static/css/*.css | awk '{ print $9 ": " $5 }' || true
else
    print_error "Build directory not found"
    exit 1
fi

# Validate build
print_status "Validating build..."
if [ -f "build/index.html" ] && [ -d "build/static" ]; then
    print_success "Build validation passed"
else
    print_error "Build validation failed - missing required files"
    exit 1
fi

# Security check - remove source maps in production
if [ "$GENERATE_SOURCEMAP" = "false" ]; then
    print_status "Removing any source maps..."
    find build/ -name "*.map" -delete || true
    print_success "Source maps removed"
fi

# Create build info
print_status "Creating build information..."
cat > build/build-info.json << EOF
{
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "buildDuration": "${BUILD_TIME}s",
  "buildSize": "$BUILD_SIZE",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "environment": "$NODE_ENV",
  "sourceMaps": "$GENERATE_SOURCEMAP",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
}
EOF

print_success "Build information created"

echo ""
print_success "🎉 Build completed successfully!"
print_status "Build location: ./build/"
print_status "Build size: $BUILD_SIZE"
print_status "Build time: ${BUILD_TIME}s"
echo ""
print_status "Next steps:"
echo "  1. Test the build locally: npm run serve"
echo "  2. Deploy to staging: ./deployment/scripts/deploy.sh staging"
echo "  3. Deploy to production: ./deployment/scripts/deploy.sh production"
echo ""