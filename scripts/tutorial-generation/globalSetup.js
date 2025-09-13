/**
 * Global Setup for Tutorial Generation
 * Prepares the environment for screen recording
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function globalSetup(config) {
  console.log('🎬 Setting up tutorial recording environment...');
  
  // Ensure directories exist
  const dirs = ['recordings', 'tutorials', 'audio', 'test-results'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  📁 Created directory: ${dir}`);
    }
  });

  // Test browser launch
  console.log('  🌐 Testing browser availability...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { 
      width: parseInt(process.env.VIDEO_WIDTH) || 1280, 
      height: parseInt(process.env.VIDEO_HEIGHT) || 720 
    }
  });
  
  const page = await context.newPage();
  
  // Test SGEX availability
  const baseURL = process.env.SGEX_BASE_URL || 'http://localhost:3000/sgex';
  try {
    console.log(`  🔗 Testing SGEX availability at ${baseURL}...`);
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    console.log('  ✅ SGEX is accessible');
  } catch (error) {
    console.error(`  ❌ SGEX not accessible at ${baseURL}`);
    throw new Error(`SGEX not available: ${error.message}`);
  }
  
  await context.close();
  await browser.close();

  // Log environment info
  console.log('  📊 Environment summary:');
  console.log(`    • Base URL: ${baseURL}`);
  console.log(`    • Video Resolution: ${process.env.VIDEO_WIDTH || 1280}x${process.env.VIDEO_HEIGHT || 720}`);
  console.log(`    • Record Video: ${process.env.RECORD_VIDEO || 'false'}`);
  console.log(`    • Tutorial Mode: ${process.env.TUTORIAL_MODE || 'false'}`);
  
  console.log('✅ Tutorial recording environment ready');
}

module.exports = globalSetup;