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
const basePath = process.env.BASE_PATH || process.argv[3] || null;

console.log(`🚀 Starting ${buildMode} build for branch: ${branchName}`);

function ensureDependencies() {
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    execSync('npm ci', { stdio: 'inherit' });
  }
}

function createBranchSpecificBuild() {
  console.log('📦 Building branch-specific React app...');
  
  // Ensure dependencies are available
  ensureDependencies();
  
  // Update package.json homepage for branch-specific deployment
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const originalHomepage = packageJson.homepage;
  
  try {
    // Set homepage based on branch and base path
    let deploymentPath;
    if (basePath) {
      // For GitHub Pages, ensure the repository name is included in the path
      // basePath comes in format like "/copilot-fix-418/" but needs to be "/sgex/copilot-fix-418/"
      if (basePath.startsWith('/') && !basePath.startsWith('/sgex/')) {
        deploymentPath = `/sgex${basePath}`;
      } else {
        deploymentPath = basePath;
      }
      packageJson.homepage = deploymentPath;
      console.log(`🔧 Setting homepage to: ${deploymentPath}`);
    } else {
      // Default path structure: /sgex/main/ for main, /sgex/safe-branch-name/ for others
      const safeBranchName = branchName === 'main' ? 'main' : branchName.replace(/[^a-zA-Z0-9._-]/g, '-');
      deploymentPath = `/sgex/${safeBranchName}/`;
      packageJson.homepage = deploymentPath;
      console.log(`🔧 Setting homepage to: ${deploymentPath}`);
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // Update manifest.json for subdirectory deployment
    const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
    const manifestBackupPath = path.join(__dirname, '..', 'public', 'manifest.json.backup');
    
    if (fs.existsSync(manifestPath)) {
      // Backup original manifest.json
      fs.copyFileSync(manifestPath, manifestBackupPath);
      
      // Update manifest.json paths for subdirectory deployment
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const originalManifest = { ...manifest };
      
      // Update start_url for subdirectory deployment
      manifest.start_url = deploymentPath;
      
      // Update icon paths for subdirectory deployment
      if (manifest.icons && Array.isArray(manifest.icons)) {
        manifest.icons = manifest.icons.map(icon => ({
          ...icon,
          src: icon.src.startsWith('/') ? icon.src : `${deploymentPath}${icon.src}`
        }));
      }
      
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`🔧 Updated manifest.json for subdirectory deployment`);
    }
    
    // Standard React build for the branch
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log(`✅ Branch-specific build completed for: ${branchName}`);
    
  } finally {
    // Always restore original package.json
    packageJson.homepage = originalHomepage;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // Restore original manifest.json if backup exists
    const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
    const manifestBackupPath = path.join(__dirname, '..', 'public', 'manifest.json.backup');
    
    if (fs.existsSync(manifestBackupPath)) {
      fs.copyFileSync(manifestBackupPath, manifestPath);
      fs.unlinkSync(manifestBackupPath);
      console.log(`🔧 Restored original manifest.json`);
    }
  }
}

function createRootLandingPageApp() {
  console.log('🏠 Creating root landing page application...');
  
  // Ensure dependencies are available
  ensureDependencies();
  
  // Create a temporary React app that only renders BranchListing
  const tempAppContent = `
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import BranchListing from './components/BranchListing';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <BranchListing />
      </div>
    </Router>
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
    
    // For root landing page, we want it to be at the GitHub Pages root for this repository
    packageJson.homepage = '/sgex/';
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