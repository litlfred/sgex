#!/usr/bin/env node

/**
 * Copy LForms vendor files from node_modules to public directory
 * This ensures LForms is available as local static assets instead of CDN
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'node_modules', 'lforms', 'dist', 'lforms');
const fhirSourceFile = path.join(__dirname, '..', 'node_modules', 'lforms', 'dist', 'fhir', 'R4', 'lformsFHIR.js');
const targetDir = path.join(__dirname, '..', 'public', 'vendor', 'lforms');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy lforms directory contents
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Source directory ${src} does not exist`);
    return;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('Copying LForms vendor files...');
  
  // Copy main lforms directory
  copyDir(sourceDir, targetDir);
  
  // Copy FHIR integration file
  if (fs.existsSync(fhirSourceFile)) {
    fs.copyFileSync(fhirSourceFile, path.join(targetDir, 'lformsFHIR.js'));
  }
  
  // Copy CSS with better name
  const cssSource = path.join(targetDir, 'webcomponent', 'styles.css');
  const cssTarget = path.join(targetDir, 'lforms-styles.css');
  
  if (fs.existsSync(cssSource)) {
    fs.copyFileSync(cssSource, cssTarget);
  }
  
  console.log('✅ LForms vendor files copied successfully');
  
} catch (error) {
  console.error('❌ Error copying LForms vendor files:', error);
  process.exit(1);
}