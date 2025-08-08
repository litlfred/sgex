#!/usr/bin/env node
/**
 * Build verification script for 404.html
 * Ensures the 404.html file is properly configured for GitHub Pages deployment
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '../build');
const PUBLIC_DIR = path.join(__dirname, '../public');

function checkFile(filePath, name) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${name} not found at ${filePath}`);
    return false;
  }
  console.log(`✅ ${name} exists`);
  return true;
}

function checkFileSize(filePath, minSize, name) {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size < minSize) {
      console.error(`❌ ${name} size (${stats.size} bytes) below minimum (${minSize} bytes)`);
      return false;
    }
    console.log(`✅ ${name} size (${stats.size} bytes) meets requirements`);
    return true;
  } catch (error) {
    console.error(`❌ Cannot check ${name} size: ${error.message}`);
    return false;
  }
}

function checkFileContent(filePath, patterns, name) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let allPassed = true;
    
    patterns.forEach(({ pattern, description }) => {
      if (content.includes(pattern)) {
        console.log(`✅ ${name} contains ${description}`);
      } else {
        console.error(`❌ ${name} missing ${description}`);
        allPassed = false;
      }
    });
    
    return allPassed;
  } catch (error) {
    console.error(`❌ Cannot read ${name}: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔍 Verifying 404.html configuration for GitHub Pages...\n');
  
  let allChecks = true;
  
  // Check if files exist
  const public404Path = path.join(PUBLIC_DIR, '404.html');
  const build404Path = path.join(BUILD_DIR, '404.html');
  const routeConfigPath = path.join(BUILD_DIR, 'routeConfig.js');
  
  allChecks = checkFile(public404Path, 'public/404.html') && allChecks;
  allChecks = checkFile(build404Path, 'build/404.html') && allChecks;
  allChecks = checkFile(routeConfigPath, 'build/routeConfig.js') && allChecks;
  
  // Check file size (IE compatibility requirement)
  allChecks = checkFileSize(public404Path, 512, '404.html') && allChecks;
  
  // Check required content
  const requiredPatterns = [
    { pattern: 'Single Page Apps for GitHub Pages', description: 'SPA routing header' },
    { pattern: 'getSGEXRouteConfig', description: 'SGEX route configuration function' },
    { pattern: 'isGitHubPages', description: 'GitHub Pages detection' },
    { pattern: 'l.replace(newUrl)', description: 'URL redirection logic' },
    { pattern: 'l.pathname.split(\'/\')', description: 'path processing logic' },
    { pattern: 'routeConfig.js', description: 'route configuration dependency' }
  ];
  
  allChecks = checkFileContent(public404Path, requiredPatterns, '404.html') && allChecks;
  
  // Verify build copy matches source
  try {
    const publicContent = fs.readFileSync(public404Path, 'utf8');
    const buildContent = fs.readFileSync(build404Path, 'utf8');
    
    if (publicContent === buildContent) {
      console.log('✅ build/404.html matches public/404.html');
    } else {
      console.error('❌ build/404.html differs from public/404.html');
      allChecks = false;
    }
  } catch (error) {
    console.error(`❌ Cannot compare files: ${error.message}`);
    allChecks = false;
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allChecks) {
    console.log('🎉 All 404.html checks passed!');
    console.log('📋 The 404.html file is properly configured for GitHub Pages SPA routing.');
    process.exit(0);
  } else {
    console.log('💥 Some 404.html checks failed!');
    console.log('🔧 Please review the errors above and fix the configuration.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, checkFileSize, checkFileContent };