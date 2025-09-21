#!/usr/bin/env node

// Test script to understand the routing issue
// This simulates the scenario described in the issue

const githubService = require('./src/services/githubService');
const dakValidationService = require('./src/services/dakValidationService');

async function testRepositoryAccess() {
  console.log('Testing repository access patterns...\n');
  
  // Test cases from the issue
  const repositories = [
    { owner: 'litlfred', repo: 'smart-ips-pilgrimage' },
    { owner: 'WorldHealthOrganization', repo: 'smart-ips-pilgrimage' },
    { owner: 'WorldHealthOrganization', repo: 'smart-immunizations' },
    { owner: 'litlfred', repo: 'sgex' }
  ];
  
  for (const { owner, repo } of repositories) {
    console.log(`\n--- Testing ${owner}/${repo} ---`);
    
    try {
      // Test 1: Repository access without authentication
      console.log('1. Testing repository access (unauthenticated)...');
      const repoData = await githubService.default.getRepository(owner, repo);
      console.log('✅ Repository accessible:', repoData.full_name);
      
      // Test 2: DAK validation
      console.log('2. Testing DAK validation...');
      const isValidDAK = await dakValidationService.default.validateDAKRepository(owner, repo);
      console.log('✅ DAK validation result:', isValidDAK);
      
    } catch (error) {
      console.log('❌ Error:', error.message);
      console.log('   Status:', error.status);
    }
  }
}

testRepositoryAccess().catch(console.error);