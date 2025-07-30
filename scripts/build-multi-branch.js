#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const buildType = process.argv[2]; // 'root' or 'branch'
const branchName = process.env.GITHUB_REF_NAME || 'main';

console.log(`Building for ${buildType} deployment (branch: ${branchName})`);

// Create build directory if it doesn't exist
if (!fs.existsSync('build')) {
  fs.mkdirSync('build');
}

try {
  if (buildType === 'root') {
    console.log('Building root landing page...');
    // Build the React app for root deployment
    execSync('npm run build', { stdio: 'inherit' });
    
  } else if (buildType === 'branch') {
    console.log('Building branch-specific app...');
    // For branch builds, we build the normal React app
    execSync('npm run build', { stdio: 'inherit' });
    
  } else {
    console.error('Usage: node build-multi-branch.js [root|branch]');
    process.exit(1);
  }
  
  console.log(`✅ Build completed successfully for ${buildType}`);
  
} catch (error) {
  console.error(`❌ Build failed:`, error.message);
  process.exit(1);
}