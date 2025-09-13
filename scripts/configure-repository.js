#!/usr/bin/env node

/**
 * Build-time Repository Configuration Script
 * 
 * This script extracts repository information and sets environment variables
 * for use in the React build process. It's designed to be run before build
 * to inject the correct repository configuration.
 */

const fs = require('fs');
const path = require('path');

function extractRepositoryInfo() {
  try {
    // Read package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Extract repository info from package.json
    let repositoryUrl = null;
    
    if (packageJson.repository) {
      if (typeof packageJson.repository === 'string') {
        repositoryUrl = packageJson.repository;
      } else if (packageJson.repository.url) {
        repositoryUrl = packageJson.repository.url;
      }
    }
    
    // Parse GitHub repository URL
    if (repositoryUrl) {
      // Handle various GitHub URL formats:
      // - https://github.com/owner/repo.git
      // - git+https://github.com/owner/repo.git
      // - git://github.com/owner/repo.git
      // - owner/repo
      const match = repositoryUrl.match(/(?:github\.com[/:])?([\w-]+)\/([\w-]+?)(?:\.git)?$/);
      
      if (match) {
        const [, owner, name] = match;
        return { owner, name, source: 'package.json' };
      }
    }
    
    // Try to get from git remote if package.json doesn't have it
    try {
      const { execSync } = require('child_process');
      const gitRemote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      const match = gitRemote.match(/github\.com[/:]([\w-]+)\/([\w-]+?)(?:\.git)?$/);
      
      if (match) {
        const [, owner, name] = match;
        return { owner, name, source: 'git-remote' };
      }
    } catch (error) {
      console.warn('Could not extract repository from git remote:', error.message);
    }
    
    // Default fallback
    return { owner: 'litlfred', name: 'sgex', source: 'default' };
    
  } catch (error) {
    console.error('Error extracting repository info:', error);
    return { owner: 'litlfred', name: 'sgex', source: 'error-fallback' };
  }
}

function setEnvironmentVariables(repoInfo) {
  // Create .env file for build
  const envContent = `# Auto-generated repository configuration
REACT_APP_REPO_OWNER=${repoInfo.owner}
REACT_APP_REPO_NAME=${repoInfo.name}
REACT_APP_REPO_FULL_NAME=${repoInfo.owner}/${repoInfo.name}
REACT_APP_REPO_CONFIG_SOURCE=${repoInfo.source}
`;

  try {
    fs.writeFileSync('.env.build', envContent);
    console.log(`✅ Repository configuration set from ${repoInfo.source}:`);
    console.log(`   Owner: ${repoInfo.owner}`);
    console.log(`   Name: ${repoInfo.name}`);
    console.log(`   Full: ${repoInfo.owner}/${repoInfo.name}`);
    console.log(`   Env file: .env.build`);
  } catch (error) {
    console.error('❌ Failed to write .env.build file:', error);
  }
}

function main() {
  console.log('🔧 Configuring repository settings for build...');
  
  const repoInfo = extractRepositoryInfo();
  setEnvironmentVariables(repoInfo);
  
  console.log('✨ Repository configuration complete!');
}

if (require.main === module) {
  main();
}

module.exports = { extractRepositoryInfo, setEnvironmentVariables };