#!/usr/bin/env node

/**
 * Multi-branch build script for SGEX
 * 
 * This script handles two different build scenarios:
 * 1. Branch-specific builds (for deployment to subdirectories)
 * 2. Root landing page build (for branch listing at gh-pages root)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get build mode from environment or command line
const buildMode = process.env.BUILD_MODE || process.argv[2] || 'branch';
const branchName = process.env.GITHUB_REF_NAME || 'main';

console.log(`🚀 Starting ${buildMode} build for branch: ${branchName}`);

function createBranchSpecificBuild() {
  console.log('📦 Building branch-specific React app...');
  
  // Standard React build for the branch
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log(`✅ Branch-specific build completed for: ${branchName}`);
}

function createRootLandingPageApp() {
  console.log('🏠 Creating root landing page application...');
  
  // Create a temporary React app that only renders BranchListing
  const tempAppContent = `
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import BranchListing from './components/BranchListing';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <BranchListing />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
`;

  // Backup original App.js
  const appJsPath = path.join(__dirname, '..', 'src', 'App.js');
  const appJsBackupPath = path.join(__dirname, '..', 'src', 'App.js.backup');
  
  if (fs.existsSync(appJsPath)) {
    fs.copyFileSync(appJsPath, appJsBackupPath);
  }
  
  try {
    // Write temporary App.js for landing page
    fs.writeFileSync(appJsPath, tempAppContent.trim());
    
    // Update package.json homepage for root deployment
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const originalHomepage = packageJson.homepage;
    
    // For root landing page, we want it to be at the GitHub Pages root
    packageJson.homepage = '/';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // Build the landing page app
    execSync('npm run build', { stdio: 'inherit' });
    
    // Restore original package.json
    packageJson.homepage = originalHomepage;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    console.log('✅ Root landing page build completed');
    
  } finally {
    // Always restore original App.js
    if (fs.existsSync(appJsBackupPath)) {
      fs.copyFileSync(appJsBackupPath, appJsPath);
      fs.unlinkSync(appJsBackupPath);
    }
  }
}

// Execute based on build mode
if (buildMode === 'root' || buildMode === 'landing') {
  createRootLandingPageApp();
} else {
  createBranchSpecificBuild();
}

console.log(`🎉 Build process completed successfully!`);