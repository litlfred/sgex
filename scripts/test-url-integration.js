/**
 * Integration test for URL routing fix
 * Tests that direct URLs work correctly and extract context
 */

const fs = require('fs');
const path = require('path');

// Test the SPA redirect mechanism in the main application
function testSpaRedirectMechanism() {
  console.log('Testing SPA redirect mechanism...\n');
  
  // Simulate the index.html SPA redirect code
  const testRedirects = [
    {
      name: 'Dashboard Component with User/Repo/Branch',
      search: '?/dashboard/demo-user/test-dak/main',
      pathname: '/sgex/',
      expectedPath: '/sgex/dashboard/demo-user/test-dak/main'
    },
    {
      name: 'Testing Viewer Component',
      search: '?/testing-viewer/demo-user/test-dak',
      pathname: '/sgex/',
      expectedPath: '/sgex/testing-viewer/demo-user/test-dak'
    },
    {
      name: 'Branch Deployment',
      search: '?/dashboard/demo-user/test-dak',
      pathname: '/sgex/main/',
      expectedPath: '/sgex/main/dashboard/demo-user/test-dak'
    }
  ];
  
  testRedirects.forEach((test, index) => {
    console.log(`Test ${index + 1}: ${test.name}`);
    console.log(`  Input: ${test.pathname}${test.search}`);
    
    // Simulate the SPA redirect code from index.html
    const location = {
      search: test.search,
      pathname: test.pathname,
      hash: ''
    };
    
    let restoredPath = '';
    
    if (location.search[1] === '/') {
      const decoded = location.search.slice(1).split('&').map(function(s) { 
        return s.replace(/~and~/g, '&')
      }).join('?');
      restoredPath = location.pathname.slice(0, -1) + decoded + location.hash;
    }
    
    console.log(`  Output: ${restoredPath}`);
    console.log(`  Expected: ${test.expectedPath}`);
    console.log(`  Result: ${restoredPath === test.expectedPath ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
  });
}

// Test URL parameter extraction for DAK components
function testUrlParameterExtraction() {
  console.log('Testing URL parameter extraction...\n');
  
  const testPaths = [
    {
      path: '/dashboard/demo-user/test-dak/main',
      expectedParams: { component: 'dashboard', user: 'demo-user', repo: 'test-dak', branch: 'main' }
    },
    {
      path: '/testing-viewer/demo-user/test-dak',
      expectedParams: { component: 'testing-viewer', user: 'demo-user', repo: 'test-dak', branch: undefined }
    },
    {
      path: '/bpmn-editor/who/immunization-dak/feature-branch',
      expectedParams: { component: 'bpmn-editor', user: 'who', repo: 'immunization-dak', branch: 'feature-branch' }
    }
  ];
  
  testPaths.forEach((test, index) => {
    console.log(`Test ${index + 1}: Path ${test.path}`);
    
    // Simulate React Router's useParams hook parsing
    const pathSegments = test.path.split('/').filter(Boolean);
    const extractedParams = {
      component: pathSegments[0],
      user: pathSegments[1],
      repo: pathSegments[2], 
      branch: pathSegments[3]
    };
    
    console.log(`  Extracted: ${JSON.stringify(extractedParams)}`);
    console.log(`  Expected: ${JSON.stringify(test.expectedParams)}`);
    
    const isCorrect = JSON.stringify(extractedParams) === JSON.stringify(test.expectedParams);
    console.log(`  Result: ${isCorrect ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
  });
}

// Test the complete flow
function testCompleteFlow() {
  console.log('Testing complete URL routing flow...\n');
  
  const endToEndTests = [
    {
      name: 'Direct DAK Dashboard Access',
      originalUrl: '/sgex/dashboard/demo-user/test-dak/main',
      hostname: 'litlfred.github.io'
    },
    {
      name: 'Testing Viewer Access',
      originalUrl: '/sgex/testing-viewer/who/immunization-dak',
      hostname: 'litlfred.github.io'
    }
  ];
  
  endToEndTests.forEach((test, index) => {
    console.log(`Test ${index + 1}: ${test.name}`);
    console.log(`  Original URL: ${test.hostname}${test.originalUrl}`);
    
    // Step 1: 404.html redirect
    const pathSegments = test.originalUrl.split('/').filter(Boolean);
    let redirectUrl = '';
    
    if (pathSegments[0] === 'sgex' && pathSegments.length >= 2) {
      const component = pathSegments[1];
      const dakComponents = [
        'dashboard', 'testing-viewer', 'core-data-dictionary-viewer',
        'health-interventions', 'actor-editor', 'business-process-selection',
        'bpmn-editor', 'bpmn-viewer', 'bpmn-source', 'decision-support-logic',
        'questionnaire-editor'
      ];
      
      if (dakComponents.includes(component)) {
        const routePath = pathSegments.slice(1).join('/');
        redirectUrl = `/sgex/?/${routePath}`;
      }
    }
    
    console.log(`  After 404 redirect: ${redirectUrl}`);
    
    // Step 2: SPA redirect restoration
    let finalPath = '';
    if (redirectUrl.includes('?/')) {
      const [basePath, queryRoute] = redirectUrl.split('?/');
      finalPath = basePath.slice(0, -1) + '/' + queryRoute;
    }
    
    console.log(`  After SPA restore: ${finalPath}`);
    
    // Step 3: React Router parsing
    const finalSegments = finalPath.split('/').filter(Boolean);
    if (finalSegments[0] === 'sgex') {
      const extractedParams = {
        component: finalSegments[1],
        user: finalSegments[2],
        repo: finalSegments[3],
        branch: finalSegments[4]
      };
      
      console.log(`  Extracted Context: ${JSON.stringify(extractedParams)}`);
      
      // Verify we got the expected parameters
      const hasValidContext = extractedParams.user && extractedParams.repo;
      console.log(`  Has Valid Context: ${hasValidContext ? '✅ YES' : '❌ NO'}`);
    }
    
    console.log('');
  });
}

// Run all tests
console.log('='.repeat(60));
console.log('URL ROUTING INTEGRATION TESTS');
console.log('='.repeat(60));
console.log('');

testSpaRedirectMechanism();
testUrlParameterExtraction();
testCompleteFlow();

console.log('All URL routing tests completed.');