#!/usr/bin/env node

// Test script to verify image path construction logic
console.log('Testing image path construction...\n');

// Simulate different scenarios
const scenarios = [
  {
    name: 'Development (no PUBLIC_URL)',
    PUBLIC_URL: '',
    baseUrl: 'http://localhost:3000/sgex',
    currentPath: '/dashboard/litlfred/smart-ips-pilgrimage'
  },
  {
    name: 'Production (with PUBLIC_URL)',
    PUBLIC_URL: '/sgex',
    baseUrl: 'https://litlfred.github.io/sgex',
    currentPath: '/dashboard/litlfred/smart-ips-pilgrimage'
  }
];

const testImagePath = 'dashboard/dak_testing.png';

scenarios.forEach(scenario => {
  console.log(`=== ${scenario.name} ===`);
  console.log(`PUBLIC_URL: "${scenario.PUBLIC_URL}"`);
  console.log(`Current URL: ${scenario.baseUrl}${scenario.currentPath}`);
  
  // Current useThemeImage logic
  const normalizedPath = testImagePath.startsWith('/') ? testImagePath.slice(1) : testImagePath;
  const finalPath = scenario.PUBLIC_URL ? `${scenario.PUBLIC_URL}/${normalizedPath}` : `/${normalizedPath}`;
  
  console.log(`Image path generated: "${finalPath}"`);
  console.log(`Full URL would be: ${scenario.baseUrl}${finalPath}`);
  
  // What happens with relative path resolution
  const currentUrl = new URL(scenario.baseUrl + scenario.currentPath);
  const relativeResolution = new URL(testImagePath, currentUrl.href);
  console.log(`Browser relative resolution: ${relativeResolution.href}`);
  
  // Check if paths would work
  const correctPath = scenario.PUBLIC_URL + '/' + normalizedPath;
  const expectedUrl = scenario.baseUrl.replace(/\/sgex$/, '') + correctPath;
  console.log(`Expected working URL: ${expectedUrl}`);
  console.log(`Does generated path work? ${finalPath === correctPath}`);
  
  console.log();
});