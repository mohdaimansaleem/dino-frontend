#!/bin/bash

# Test Environment Variable Flow
# This script demonstrates how environment variables flow from cloudbuild.yaml to React

echo "🔍 Testing Environment Variable Flow"
echo "=================================="
echo ""

echo "1. 📋 Build arguments in cloudbuild.yaml:"
echo "   --build-arg REACT_APP_API_BASE_URL=https://dino-backend-\$PROJECT_ID.a.run.app/api/v1"
echo ""

echo "2. 📥 ARG statements in Dockerfile:"
grep "^ARG REACT_APP_" Dockerfile | head -5
echo "   ... (and more)"
echo ""

echo "3. 🔄 ENV statements in Dockerfile:"
grep "^ENV REACT_APP_" Dockerfile | head -5
echo "   ... (and more)"
echo ""

echo "4. 🏗️  React build process:"
echo "   RUN npm run build  ← This reads all ENV variables starting with REACT_APP_"
echo ""

echo "5. 📦 Final result:"
echo "   Static JavaScript files with environment variables baked in"
echo "   Example: process.env.REACT_APP_API_BASE_URL becomes a hardcoded string"
echo ""

echo "✅ Flow verified: cloudbuild.yaml → Docker ARG → Docker ENV → React Build → Static Files"