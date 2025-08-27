#!/usr/bin/env node

/**
 * Test script to validate 404.html routing behavior
 * Tests various URL patterns to ensure they redirect correctly
 */

const fs = require('fs');
const path = require('path');

// Read the 404.html file
const html404Path = path.join(__dirname, '../public/404.html');
const html404Content = fs.readFileSync(html404Path, 'utf8');

// Extract the JavaScript code from the 404.html
const scriptMatch = html404Content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('Could not extract JavaScript from 404.html');
  process.exit(1);
}

const routingScript = scriptMatch[1];

// Test cases for different URL patterns
const testCases = [
  {
    name: 'GitHub Pages Direct DAK Component',
    hostname: 'litlfred.github.io',
    pathname: '/sgex/dashboard/demo-user/test-dak/main',
    expected: '/sgex/?/dashboard/demo-user/test-dak/main'
  },
  {
    name: 'GitHub Pages Branch Deployment',
    hostname: 'litlfred.github.io',
    pathname: '/sgex/main/dashboard/demo-user/test-dak',
    expected: '/sgex/main/?/dashboard/demo-user/test-dak'
  },
  {
    name: 'GitHub Pages Testing Viewer',
    hostname: 'litlfred.github.io',
    pathname: '/sgex/testing-viewer/demo-user/test-dak',
    expected: '/sgex/?/testing-viewer/demo-user/test-dak'
  },
  {
    name: 'Standalone Deployment',
    hostname: 'localhost',
    pathname: '/dashboard/demo-user/test-dak/main',
    expected: '/?/dashboard/demo-user/test-dak/main'
  },
  {
    name: 'GitHub Pages Root',
    hostname: 'litlfred.github.io',
    pathname: '/sgex/unknown-path',
    expected: '/sgex/'
  }
];

console.log('Testing 404.html routing behavior...\n');

// Mock window.location for each test case
testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  Input: ${testCase.hostname}${testCase.pathname}`);
  
  // Create a mock location object
  const mockLocation = {
    hostname: testCase.hostname,
    pathname: testCase.pathname,
    search: '',
    hash: '',
    host: testCase.hostname,
    protocol: 'https:',
    replace: function(url) {
      this.replacedUrl = url;
    }
  };
  
  // Create a mock console for the script
  const mockConsole = {
    log: function() {
      // Capture console.log calls if needed
    }
  };
  
  try {
    // Create the execution context with the script wrapped in the same IIFE pattern
    const scriptCode = `
      var window = { location: l };
      ${routingScript}
    `;
    
    // Execute the routing script with mocked environment
    const func = new Function('l', 'console', scriptCode);
    func(mockLocation, mockConsole);
    
    if (mockLocation.replacedUrl) {
      console.log(`  Output: ${mockLocation.replacedUrl}`);
      console.log(`  Expected: ${testCase.expected}`);
      
      // Extract the path part of the URL for comparison
      const outputPath = mockLocation.replacedUrl.replace(/^https?:\/\/[^\/]+/, '');
      const isCorrect = outputPath === testCase.expected;
      
      console.log(`  Result: ${isCorrect ? '✅ PASS' : '❌ FAIL'}`);
    } else {
      console.log(`  Output: No redirect (stays at original URL)`);
      console.log(`  Expected: ${testCase.expected}`);
      console.log(`  Result: ${testCase.expected === testCase.pathname ? '✅ PASS' : '❌ FAIL'}`);
    }
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    console.log(`  Result: ❌ FAIL`);
  }
  
  console.log('');
});

console.log('404.html routing test completed.');