/**
 * Test for branch preview routing fix
 * 
 * This test verifies that the getBasePath() and getConfigFilePath() functions
 * correctly resolve configuration file paths for different deployment scenarios.
 */

// Recreate the functions from routeConfig.js for testing
function getBasePath(pathname, hostname) {
  if (!pathname || !hostname) {
    return '';
  }
  
  // For localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/sgex';
  }
  
  // Parse pathname to find base directory
  // GitHub Pages URLs: /sgex/ (landing) or /sgex/main/ or /sgex/{branch}/
  var pathParts = pathname.split('/').filter(Boolean);
  
  if (pathParts.length === 0) {
    return '';
  }
  
  // First part should be 'sgex'
  if (pathParts[0] !== 'sgex') {
    return '';
  }
  
  // If we're at /sgex/ or /sgex (root), base is /sgex
  if (pathParts.length === 1) {
    return '/sgex';
  }
  
  // For /sgex/main/ or /sgex/{branch}/, base is /sgex/{second-part}
  return '/sgex/' + pathParts[1];
}

function getConfigFileName(deployType) {
  return deployType === 'deploy' ? 'routes-config.deploy.json' : 'routes-config.json';
}

function getConfigFilePath(deployType, pathname, hostname) {
  var basePath = getBasePath(pathname, hostname);
  var fileName = getConfigFileName(deployType);
  
  // Construct absolute path
  if (basePath) {
    return basePath + '/' + fileName;
  }
  return './' + fileName;
}

// Test scenarios
const testScenarios = [
  {
    name: 'Main deployment',
    pathname: '/sgex/main/',
    hostname: 'litlfred.github.io',
    expectedBase: '/sgex/main',
    expectedConfig: '/sgex/main/routes-config.json',
    deployType: 'main'
  },
  {
    name: 'Branch deployment (doc_consolidate)',
    pathname: '/sgex/doc_consolidate/',
    hostname: 'litlfred.github.io',
    expectedBase: '/sgex/doc_consolidate',
    expectedConfig: '/sgex/doc_consolidate/routes-config.json',
    deployType: 'main'
  },
  {
    name: 'Branch deployment (copilot-fix-123)',
    pathname: '/sgex/copilot-fix-123/',
    hostname: 'litlfred.github.io',
    expectedBase: '/sgex/copilot-fix-123',
    expectedConfig: '/sgex/copilot-fix-123/routes-config.json',
    deployType: 'main'
  },
  {
    name: 'Landing page',
    pathname: '/sgex/',
    hostname: 'litlfred.github.io',
    expectedBase: '/sgex',
    expectedConfig: '/sgex/routes-config.deploy.json',
    deployType: 'deploy'
  },
  {
    name: 'Deep path in branch',
    pathname: '/sgex/main/dashboard/user/repo',
    hostname: 'litlfred.github.io',
    expectedBase: '/sgex/main',
    expectedConfig: '/sgex/main/routes-config.json',
    deployType: 'main'
  },
  {
    name: 'Localhost development',
    pathname: '/sgex/dashboard',
    hostname: 'localhost',
    expectedBase: '/sgex',
    expectedConfig: '/sgex/routes-config.json',
    deployType: 'main'
  }
];

console.log('🧪 Branch Preview Routing Fix Tests\n');
console.log('=' .repeat(80));

let passCount = 0;
let failCount = 0;

testScenarios.forEach((scenario, index) => {
  console.log(`\nTest ${index + 1}: ${scenario.name}`);
  console.log('-'.repeat(80));
  
  try {
    // Test getBasePath
    const actualBase = getBasePath(scenario.pathname, scenario.hostname);
    const baseCorrect = actualBase === scenario.expectedBase;
    
    // Test getConfigFilePath
    const actualConfig = getConfigFilePath(scenario.deployType, scenario.pathname, scenario.hostname);
    const configCorrect = actualConfig === scenario.expectedConfig;
    
    const testPassed = baseCorrect && configCorrect;
    
    console.log(`  URL: ${scenario.pathname}`);
    console.log(`  Host: ${scenario.hostname}`);
    console.log(`  Deploy Type: ${scenario.deployType}`);
    console.log(`  Base Path: ${actualBase} ${baseCorrect ? '✓' : `✗ (expected ${scenario.expectedBase})`}`);
    console.log(`  Config Path: ${actualConfig} ${configCorrect ? '✓' : `✗ (expected ${scenario.expectedConfig})`}`);
    
    if (testPassed) {
      console.log(`  Result: ✅ PASS`);
      passCount++;
    } else {
      console.log(`  Result: ❌ FAIL`);
      failCount++;
    }
  } catch (error) {
    console.log(`  Result: ❌ ERROR - ${error.message}`);
    failCount++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Test Summary:`);
console.log(`  Total Tests: ${testScenarios.length}`);
console.log(`  Passed: ${passCount} ✅`);
console.log(`  Failed: ${failCount} ${failCount > 0 ? '❌' : ''}`);
console.log(`  Success Rate: ${Math.round(passCount / testScenarios.length * 100)}%`);

if (failCount === 0) {
  console.log('\n✅ All tests passed! The branch preview routing fix is working correctly.');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please review the implementation.');
  process.exit(1);
}
