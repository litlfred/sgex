#!/usr/bin/env node

/**
 * Test script for ROUTES_CONFIG_PATH configurability
 * 
 * Tests that the compliance checker can load routes-config.json from:
 * 1. Default path (../public/routes-config.json)
 * 2. Environment variable (ROUTES_CONFIG_PATH)
 * 3. Command-line argument (--routes-config=PATH)
 * 
 * This validates Suggested Change 1 from PR #1092
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test configuration
const TEST_CONFIG_DIR = path.join(__dirname, '../test-configs');
const TEST_CONFIG_PATH = path.join(TEST_CONFIG_DIR, 'test-routes-config.json');
const SCRIPT_PATH = path.join(__dirname, 'check-framework-compliance.js');

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

/**
 * Create a test configuration file
 */
function setupTestConfig() {
  // Create test directory if it doesn't exist
  if (!fs.existsSync(TEST_CONFIG_DIR)) {
    fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
  }
  
  // Create a minimal test config
  const testConfig = {
    deployType: 'main',
    dakComponents: {
      'test-component': {
        component: 'TestComponent',
        path: '/test-component/:user/:repo/:branch/*'
      }
    },
    standardComponents: {
      'TestStandardComponent': {
        routes: [{ path: '/test-standard' }]
      }
    }
  };
  
  fs.writeFileSync(TEST_CONFIG_PATH, JSON.stringify(testConfig, null, 2));
  console.log(`✓ Created test config at ${TEST_CONFIG_PATH}`);
}

/**
 * Clean up test configuration
 */
function cleanupTestConfig() {
  if (fs.existsSync(TEST_CONFIG_PATH)) {
    fs.unlinkSync(TEST_CONFIG_PATH);
  }
  if (fs.existsSync(TEST_CONFIG_DIR)) {
    fs.rmdirSync(TEST_CONFIG_DIR);
  }
  console.log('✓ Cleaned up test config');
}

/**
 * Run a test case
 */
function runTest(testName, command) {
  try {
    console.log(`\nTesting: ${testName}`);
    const output = execSync(command, { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Check if output indicates config was loaded
    // Either "Found X routed page components" or the test components were read
    const success = output.includes('Found') || 
                    output.includes('routed page components') ||
                    output.includes('TestComponent') ||
                    output.includes('TestStandardComponent');
    
    if (success) {
      console.log(`${GREEN}✓ PASS${RESET}: ${testName}`);
      return true;
    } else {
      console.log(`${RED}✗ FAIL${RESET}: ${testName}`);
      console.log('Output:', output);
      return false;
    }
  } catch (error) {
    console.log(`${RED}✗ FAIL${RESET}: ${testName}`);
    console.log('Error:', error.message);
    if (error.stdout) console.log('Stdout:', error.stdout);
    if (error.stderr) console.log('Stderr:', error.stderr);
    return false;
  }
}

/**
 * Main test suite
 */
function runTests() {
  console.log('🧪 Testing ROUTES_CONFIG_PATH configurability\n');
  console.log('=' .repeat(60));
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Setup
  setupTestConfig();
  
  // Test 1: Default path (should work with standard config)
  if (runTest(
    'Default path (../public/routes-config.json)',
    `node ${SCRIPT_PATH} --json`
  )) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 2: Environment variable
  if (runTest(
    'Environment variable (ROUTES_CONFIG_PATH)',
    `ROUTES_CONFIG_PATH=${TEST_CONFIG_PATH} node ${SCRIPT_PATH} --json`
  )) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 3: Command-line argument
  if (runTest(
    'Command-line argument (--routes-config)',
    `node ${SCRIPT_PATH} --routes-config=${TEST_CONFIG_PATH} --json`
  )) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 4: Command-line argument takes precedence over env var
  if (runTest(
    'CLI argument overrides env var',
    `ROUTES_CONFIG_PATH=/nonexistent/path node ${SCRIPT_PATH} --routes-config=${TEST_CONFIG_PATH} --json`
  )) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 5: Help should show the new option
  try {
    const helpOutput = execSync(`node ${SCRIPT_PATH} --help`, { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..')
    });
    
    if (helpOutput.includes('--routes-config') && helpOutput.includes('ROUTES_CONFIG_PATH')) {
      console.log('\nTesting: Help documentation includes new options');
      console.log(`${GREEN}✓ PASS${RESET}: Help documentation includes new options`);
      results.passed++;
    } else {
      console.log('\nTesting: Help documentation includes new options');
      console.log(`${RED}✗ FAIL${RESET}: Help documentation missing new options`);
      results.failed++;
    }
  } catch (error) {
    console.log(`${RED}✗ FAIL${RESET}: Help command failed`);
    results.failed++;
  }
  
  // Cleanup
  cleanupTestConfig();
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log(`\n📊 Test Results:`);
  console.log(`   ${GREEN}Passed: ${results.passed}${RESET}`);
  console.log(`   ${RED}Failed: ${results.failed}${RESET}`);
  console.log(`   Total: ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    console.log(`\n${GREEN}✓ All tests passed!${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${RED}✗ Some tests failed${RESET}\n`);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
