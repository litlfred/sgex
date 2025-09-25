#!/usr/bin/env node

/**
 * Build-time Repository Configuration Script
 * 
 * This script extracts and validates repository information from package.json
 * and sets environment variables for use in the React build process.
 * 
 * Requirements:
 * - package.json MUST have a repository field
 * - If git remote exists, it MUST match package.json repository
 * - Build will fail if these requirements are not met
 */

const fs = require('fs');
const path = require('path');

function getRepositoryFromPackageJson() {
  try {
    // Read package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Repository field is required
    if (!packageJson.repository) {
      console.error('❌ FATAL ERROR: package.json is missing the "repository" field');
      console.error('   Add a repository field like:');
      console.error('   {');
      console.error('     "repository": {');
      console.error('       "type": "git",');
      console.error('       "url": "https://github.com/owner/repo.git"');
      console.error('     }');
      console.error('   }');
      process.exit(1);
    }
    
    // Extract repository URL
    let repositoryUrl = null;
    if (typeof packageJson.repository === 'string') {
      repositoryUrl = packageJson.repository;
    } else if (packageJson.repository.url) {
      repositoryUrl = packageJson.repository.url;
    } else {
      console.error('❌ FATAL ERROR: package.json repository field is invalid');
      console.error('   Repository must be a string or object with "url" property');
      process.exit(1);
    }
    
    // Parse GitHub repository URL from package.json
    // Handle various GitHub URL formats:
    // - https://github.com/owner/repo.git
    // - git+https://github.com/owner/repo.git
    // - git://github.com/owner/repo.git
    // - owner/repo
    const match = repositoryUrl.match(/(?:github\.com[/:])?([\w-]+)\/([\w-]+?)(?:\.git)?$/);
    
    if (!match) {
      console.error('❌ FATAL ERROR: package.json repository is not a valid GitHub repository');
      console.error(`   Repository URL: ${repositoryUrl}`);
      console.error('   Expected format: https://github.com/owner/repo.git');
      process.exit(1);
    }
    
    const [, owner, name] = match;
    return { owner, name, url: repositoryUrl, source: 'package.json' };
    
  } catch (error) {
    console.error('❌ FATAL ERROR: Failed to read or parse package.json:', error.message);
    process.exit(1);
  }
}

function validateGitRemote(packageRepoInfo) {
  try {
    const { execSync } = require('child_process');
    const gitRemote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const match = gitRemote.match(/github\.com[/:]([\w-]+)\/([\w-]+?)(?:\.git)?$/);
    
    if (match) {
      const [, gitOwner, gitName] = match;
      const packageRepo = `${packageRepoInfo.owner}/${packageRepoInfo.name}`;
      const gitRepo = `${gitOwner}/${gitName}`;
      
      if (packageRepo !== gitRepo) {
        console.error('❌ FATAL ERROR: Repository mismatch detected');
        console.error(`   package.json repository: ${packageRepo}`);
        console.error(`   git remote origin:       ${gitRepo}`);
        console.error('');
        console.error('   Fix by choosing one of:');
        console.error('   1. Update package.json repository field to match git remote');
        console.error('   2. Change git remote origin to match package.json');
        console.error('');
        console.error('   Commands to fix:');
        console.error(`   git remote set-url origin https://github.com/${packageRepo}.git`);
        console.error('   OR update package.json repository.url field');
        process.exit(1);
      }
      
      console.log(`✅ Repository consistency verified: ${packageRepo}`);
    } else {
      console.warn('⚠️  Warning: Could not parse git remote origin, skipping validation');
    }
  } catch (error) {
    console.warn('⚠️  Warning: No git remote found, skipping validation');
  }
}

function setEnvironmentVariables(repoInfo) {
  // Create .env file for build (React Scripts recognizes this format)
  const envContent = `# Auto-generated repository configuration from package.json
REACT_APP_REPO_OWNER=${repoInfo.owner}
REACT_APP_REPO_NAME=${repoInfo.name}
REACT_APP_REPO_FULL_NAME=${repoInfo.owner}/${repoInfo.name}
REACT_APP_REPO_CONFIG_SOURCE=${repoInfo.source}
`;

  try {
    fs.writeFileSync('.env', envContent);
    console.log(`✅ Repository configuration set from ${repoInfo.source}:`);
    console.log(`   Owner: ${repoInfo.owner}`);
    console.log(`   Name: ${repoInfo.name}`);
    console.log(`   Full: ${repoInfo.owner}/${repoInfo.name}`);
    console.log(`   Env file: .env`);
    
    // Also update 404.html with dynamic repository configuration
    updateStaticFiles(repoInfo);
  } catch (error) {
    console.error('❌ Failed to write .env file:', error);
    process.exit(1);
  }
}

function updateStaticFiles(repoInfo) {
  try {
    const notFoundPath = path.join(process.cwd(), 'public', '404.html');
    
    if (fs.existsSync(notFoundPath)) {
      let content = fs.readFileSync(notFoundPath, 'utf8');
      
      // Replace repository references with current repository
      const newRepo = `${repoInfo.owner}/${repoInfo.name}`;
      
      // Replace GitHub URLs that might be hardcoded
      // This is a generic replacement that works for any existing hardcoded references
      content = content.replace(
        /https:\/\/github\.com\/[\w-]+\/[\w-]+\//g,
        `https://github.com/${newRepo}/`
      );
      content = content.replace(
        /https:\/\/[\w-]+\.github\.io\/[\w-]+\//g,
        `https://${repoInfo.owner}.github.io/${repoInfo.name}/`
      );
      
      fs.writeFileSync(notFoundPath, content);
      console.log(`✅ Updated 404.html with repository: ${newRepo}`);
    }
  } catch (error) {
    console.warn(`⚠️ Failed to update static files: ${error.message}`);
  }
}

function main() {
  console.log('🔧 Configuring repository settings for build...');
  console.log('📋 Step 1/4: Reading package.json repository configuration...');
  
  // Get repository from package.json (required)
  const repoInfo = getRepositoryFromPackageJson();
  
  console.log('📋 Step 2/4: Validating against git remote origin...');
  // Validate against git remote if present
  validateGitRemote(repoInfo);
  
  console.log('📋 Step 3/4: Setting up environment variables for React build...');
  // Set environment variables
  setEnvironmentVariables(repoInfo);
  
  console.log('📋 Step 4/4: Updating static files for deployment...');
  // Update static files for deployment
  updateStaticFiles(repoInfo);
  
  console.log('✨ Repository configuration complete!');
  console.log('🚀 Starting React development server (this may take 1-2 minutes)...');
}

if (require.main === module) {
  main();
}

module.exports = { getRepositoryFromPackageJson, validateGitRemote, setEnvironmentVariables, updateStaticFiles };