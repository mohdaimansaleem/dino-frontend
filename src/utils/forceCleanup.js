/**
 * Force cleanup script to remove dino_last_activity immediately
 * Run this in browser console if the entry persists
 */

console.log('🧹 Starting force cleanup of dino_last_activity...');

// Check if it exists
if (localStorage.getItem('dino_last_activity')) {
  console.log('📍 Found dino_last_activity, removing...');
  localStorage.removeItem('dino_last_activity');
  console.log('✅ Successfully removed dino_last_activity');
} else {
  console.log('ℹ️ dino_last_activity not found in localStorage');
}

// Also remove any other legacy items
const legacyItems = [
  'dino_last_activity',
  'dino_token_expiry',
  'auth_token_expiry',
  'token_expiry'
];

let removedCount = 0;
legacyItems.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    removedCount++;
    console.log(`✅ Removed legacy item: ${key}`);
  }
});

if (removedCount === 0) {
  console.log('ℹ️ No legacy items found to remove');
} else {
  console.log(`🗑️ Removed ${removedCount} legacy items`);
}

// Show current dino items
console.log('📋 Current dino items in localStorage:');
const dinoItems = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('dino_')) {
    dinoItems.push(key);
  }
}

if (dinoItems.length === 0) {
  console.log('ℹ️ No dino items found');
} else {
  dinoItems.forEach(key => {
    console.log(`  - ${key}`);
  });
}

console.log('✅ Force cleanup completed');