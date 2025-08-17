/**
 * Emergency stop script to break infinite loops
 * Run this in browser console if loops persist
 */

console.log('🚨 Emergency stop initiated...');

// 1. Clear all intervals and timeouts
let highestTimeoutId = setTimeout(() => {});
for (let i = 0; i < highestTimeoutId; i++) {
  clearTimeout(i);
  clearInterval(i);
}
console.log('✅ Cleared all timers');

// 2. Close any WebSocket connections
if (window.WebSocket) {
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function() {
    console.log('🚫 WebSocket creation blocked');
    return { close: () => {}, send: () => {} };
  };
  console.log('✅ Blocked new WebSocket connections');
}

// 3. Block fetch requests to refresh-permissions
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (typeof url === 'string' && url.includes('refresh-permissions')) {
    console.log('🚫 Blocked refresh-permissions request');
    return Promise.resolve(new Response('{"blocked": true}', { status: 200 }));
  }
  return originalFetch.apply(this, arguments);
};
console.log('✅ Blocked refresh-permissions requests');

// 4. Remove problematic localStorage items
const itemsToRemove = [
  'dino_last_activity',
  'dino_token_expiry'
];

itemsToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removed ${key}`);
  }
});

// 5. Stop any running React effects by clearing dependencies
console.log('🔄 Forcing page reload to stop all loops...');
setTimeout(() => {
  window.location.reload();
}, 2000);

console.log('🚨 Emergency stop completed - page will reload in 2 seconds');