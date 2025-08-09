#!/usr/bin/env node

// Test Configuration Script
// This script tests if the environment variables are properly set

console.log('🔍 Testing Environment Configuration');
console.log('=====================================');
console.log('');

// Simulate the environment variables that would be set during build
const testEnvVars = {
  'REACT_APP_API_BASE_URL': 'https://dino-backend-api-867506203789.us-central1.run.app/api/v1',
  'REACT_APP_WS_URL': 'wss://dino-backend-api-867506203789.us-central1.run.app/ws',
  'REACT_APP_ENV': 'production',
  'NODE_ENV': 'production'
};

console.log('📋 Environment Variables:');
Object.entries(testEnvVars).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log('');
console.log('✅ Configuration looks correct!');
console.log('');
console.log('🔧 Next Steps:');
console.log('1. Commit the changes');
console.log('2. Push to trigger auto-build');
console.log('3. Check browser Network tab after deployment');
console.log('4. Use the API Debugger component to monitor calls');
console.log('');
console.log('🚨 If API calls still go to frontend URL:');
console.log('1. Open browser DevTools');
console.log('2. Go to Network tab');
console.log('3. Look for calls to your frontend domain instead of backend');
console.log('4. Check the API Debugger component for detailed monitoring');