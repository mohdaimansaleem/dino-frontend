/**
 * Sidebar Migration Script
 * Migrates sidebar state from localStorage to React state
 * Run this in browser console to clean up old sidebar storage
 */

console.log('🔄 Starting sidebar migration...');

// Check for existing sidebar state in localStorage
const legacySidebarKeys = [
  'sidebarCollapsed',
  'dino_sidebar_collapsed',
  'sidebar_collapsed'
];

let foundLegacyState = false;
let lastKnownState = false;

legacySidebarKeys.forEach(key => {
  const value = localStorage.getItem(key);
  if (value !== null) {
    try {
      lastKnownState = JSON.parse(value);
      foundLegacyState = true;
      console.log(`📍 Found legacy sidebar state in ${key}: ${lastKnownState}`);
      
      // Remove the legacy key
      localStorage.removeItem(key);
      console.log(`✅ Removed legacy key: ${key}`);
    } catch (error) {
      console.warn(`⚠️ Failed to parse ${key}:`, error);
      localStorage.removeItem(key);
      console.log(`✅ Removed corrupted key: ${key}`);
    }
  }
});

if (foundLegacyState) {
  console.log(`🔄 Last known sidebar state was: ${lastKnownState ? 'collapsed' : 'expanded'}`);
  console.log('ℹ️ Sidebar state is now managed by React Context');
  console.log('ℹ️ The sidebar will start in the default state (expanded) on next page load');
} else {
  console.log('ℹ️ No legacy sidebar state found');
}

// Show current localStorage items
const remainingDinoItems = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('dino_')) {
    remainingDinoItems.push(key);
  }
}

console.log('📋 Remaining dino items in localStorage:');
if (remainingDinoItems.length === 0) {
  console.log('  (none)');
} else {
  remainingDinoItems.forEach(key => {
    console.log(`  - ${key}`);
  });
}

console.log('✅ Sidebar migration completed');
console.log('🔄 Refresh the page to use the new React Context-based sidebar state');