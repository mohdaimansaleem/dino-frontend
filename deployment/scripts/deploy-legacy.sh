#!/bin/bash

# Simple deployment script for Dino Frontend
set -e

echo "🚀 Deploying Dino Frontend..."

# Check if we're in the right directory
if [ ! -f "cloudbuild.yaml" ]; then
    echo "❌ cloudbuild.yaml not found. Run this from the project root."
    exit 1
fi

# Deploy using Cloud Build
echo "📦 Starting Cloud Build deployment..."
gcloud builds submit --config cloudbuild.yaml .

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: https://dino-frontend-[PROJECT_ID].a.run.app"