#!/usr/bin/env node

/**
 * Validation script for PR Workflow UI improvements
 * This script validates that the required changes were implemented correctly
 */

const fs = require('fs');
const path = require('path');

const PREVIEW_BADGE_JS = path.join(__dirname, '../src/components/PreviewBadge.js');
const PREVIEW_BADGE_CSS = path.join(__dirname, '../src/components/PreviewBadge.css');

console.log('🔍 Validating PR Workflow UI improvements...\n');

// Read the files
const jsContent = fs.readFileSync(PREVIEW_BADGE_JS, 'utf8');
const cssContent = fs.readFileSync(PREVIEW_BADGE_CSS, 'utf8');

let allTestsPassed = true;

// Test 1: Check for "Open Session" text instead of "View Agent Session"
console.log('1. Checking button text changes...');
if (jsContent.includes('🔗 Open Session') && !jsContent.includes('🔗 View Agent Session')) {
  console.log('   ✅ "View Agent Session" correctly changed to "Open Session"');
} else {
  console.log('   ❌ Button text not updated correctly');
  allTestsPassed = false;
}

// Test 2: Check for Watch Session button reordering (should appear first)
console.log('2. Checking button order...');
const sessionActionsMatch = jsContent.match(/<div className="copilot-session-actions">([\s\S]*?)<\/div>/);
if (sessionActionsMatch) {
  const actionsContent = sessionActionsMatch[1];
  const watchButtonIndex = actionsContent.indexOf('👁️ Watch Session');
  const openSessionIndex = actionsContent.indexOf('🔗 Open Session');
  
  if (watchButtonIndex !== -1 && openSessionIndex !== -1 && watchButtonIndex < openSessionIndex) {
    console.log('   ✅ Watch Session button appears before Open Session button');
  } else {
    console.log('   ❌ Button order not correct');
    allTestsPassed = false;
  }
} else {
  console.log('   ❌ Could not find copilot session actions section');
  allTestsPassed = false;
}

// Test 3: Check for auto-refresh functionality
console.log('3. Checking auto-refresh implementation...');
if (jsContent.includes('handleWatchSessionToggle') && 
    jsContent.includes('setInterval') && 
    jsContent.includes('10000')) {
  console.log('   ✅ Auto-refresh functionality implemented with 10-second interval');
} else {
  console.log('   ❌ Auto-refresh functionality not found');
  allTestsPassed = false;
}

// Test 4: Check for watching status indicator
console.log('4. Checking watching status indicator...');
if (jsContent.includes('🔄 Watching for updates (every 10s)') && 
    jsContent.includes('isWatchingSession')) {
  console.log('   ✅ Watching status indicator implemented');
} else {
  console.log('   ❌ Watching status indicator not found');
  allTestsPassed = false;
}

// Test 5: Check for dark mode CSS improvements
console.log('5. Checking dark mode CSS...');
if (cssContent.includes('copilot-session-modal') && 
    cssContent.includes('@media (prefers-color-scheme: dark)') &&
    cssContent.includes('copilot-session-header') &&
    cssContent.includes('copilot-watching-status')) {
  console.log('   ✅ Dark mode CSS for copilot session modal implemented');
} else {
  console.log('   ❌ Dark mode CSS not properly implemented');
  allTestsPassed = false;
}

// Test 6: Check for cleanup functionality
console.log('6. Checking interval cleanup...');
if (jsContent.includes('clearInterval') && 
    jsContent.includes('useEffect') &&
    jsContent.includes('watchSessionInterval')) {
  console.log('   ✅ Proper interval cleanup implemented');
} else {
  console.log('   ❌ Interval cleanup not found');
  allTestsPassed = false;
}

// Test 7: Check for pulse animation
console.log('7. Checking pulse animation...');
if (cssContent.includes('@keyframes pulse') && 
    cssContent.includes('animation: pulse')) {
  console.log('   ✅ Pulse animation for watching status implemented');
} else {
  console.log('   ❌ Pulse animation not found');
  allTestsPassed = false;
}

console.log('\n📊 Validation Results:');
if (allTestsPassed) {
  console.log('🎉 All PR Workflow UI improvements successfully implemented!');
  console.log('\n✨ Summary of changes:');
  console.log('   • Button reordering: Watch Session appears first');
  console.log('   • Button renaming: "View Agent Session" → "Open Session"'); 
  console.log('   • Auto-refresh: 10-second interval for watching sessions');
  console.log('   • Visual feedback: Animated watching status indicator');
  console.log('   • Dark mode: Comprehensive styling for copilot session modal');
  console.log('   • Proper cleanup: Interval management and useEffect hooks');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the implementation.');
  process.exit(1);
}